package store

import (
	"bytes"
	"compress/zlib"
	"crypto/aes"
	"crypto/cipher"
	"crypto/sha256"
	"fmt"
	"io"

	"go.etcd.io/bbolt"
)

/*
	Implementación de la interfaz Store mediante BoltDB (versión bbolt)
*/

// BboltStore contiene la instancia de la base de datos bbolt.
type BboltStore struct {
	db  *bbolt.DB
	key []byte // Nuestra clave de cifrado
}

// NewBboltStore abre la base de datos bbolt en la ruta especificada.
func NewBboltStore(path string, key []byte) (*BboltStore, error) {
	db, err := bbolt.Open(path, 0600, nil)
	if err != nil {
		return nil, fmt.Errorf("error al abrir base de datos bbolt: %v", err)
	}
	return &BboltStore{
		db:  db,
		key: key,
	}, nil
}

// Put almacena o actualiza (key, value) dentro de un bucket = namespace.
func (s *BboltStore) Put(namespace string, key, value []byte) error {
	// 1. Ciframos y comprimimos los datos originales antes de guardarlos
	protectedValue, err := s.protect(value)
	if err != nil {
		return fmt.Errorf("error al cifrar/comprimir los datos: %v", err)
	}

	return s.db.Update(func(tx *bbolt.Tx) error {
		b, err := tx.CreateBucketIfNotExists([]byte(namespace))
		if err != nil {
			return fmt.Errorf("error al crear/abrir bucket '%s': %v", namespace, err)
		}
		// 2. Guardamos el valor YA PROTEGIDO en la base de datos
		return b.Put(key, protectedValue)
	})
}

// Get recupera el valor de (key) en el bucket = namespace.
func (s *BboltStore) Get(namespace string, key []byte) ([]byte, error) {
	var rawFromDB []byte
	err := s.db.View(func(tx *bbolt.Tx) error {
		b := tx.Bucket([]byte(namespace))
		if b == nil {
			return fmt.Errorf("%w: %s", ErrNamespaceNotFound, namespace)
		}
		v := b.Get(key)
		if v == nil {
			return fmt.Errorf("%w: %s", ErrKeyNotFound, string(key))
		}

		// Hacemos una copia de los datos (que están cifrados en el fichero)
		rawFromDB = make([]byte, len(v))
		copy(rawFromDB, v)
		return nil
	})

	if err != nil {
		return nil, err
	}

	// 3. Desciframos y descomprimimos antes de devolver el resultado
	return s.unprotect(rawFromDB)
}

// Delete elimina la clave 'key' del bucket = namespace.
func (s *BboltStore) Delete(namespace string, key []byte) error {
	return s.db.Update(func(tx *bbolt.Tx) error {
		b := tx.Bucket([]byte(namespace))
		if b == nil {
			return fmt.Errorf("%w: %s", ErrNamespaceNotFound, namespace)
		}
		return b.Delete(key)
	})
}

// ListKeys devuelve todas las claves del bucket = namespace.
func (s *BboltStore) ListKeys(namespace string) ([][]byte, error) {
	var keys [][]byte
	err := s.db.View(func(tx *bbolt.Tx) error {
		b := tx.Bucket([]byte(namespace))
		if b == nil {
			return fmt.Errorf("%w: %s", ErrNamespaceNotFound, namespace)
		}
		c := b.Cursor()
		for k, _ := c.First(); k != nil; k, _ = c.Next() {
			kCopy := make([]byte, len(k))
			copy(kCopy, k)
			keys = append(keys, kCopy)
		}
		return nil
	})
	return keys, err
}

// KeysByPrefix devuelve las claves que inicien con 'prefix' en el bucket = namespace.
func (s *BboltStore) KeysByPrefix(namespace string, prefix []byte) ([][]byte, error) {
	var matchedKeys [][]byte
	err := s.db.View(func(tx *bbolt.Tx) error {
		b := tx.Bucket([]byte(namespace))
		if b == nil {
			return fmt.Errorf("%w: %s", ErrNamespaceNotFound, namespace)
		}
		c := b.Cursor()
		for k, _ := c.Seek(prefix); k != nil && bytes.HasPrefix(k, prefix); k, _ = c.Next() {
			kCopy := make([]byte, len(k))
			copy(kCopy, k)
			matchedKeys = append(matchedKeys, kCopy)
		}
		return nil
	})
	return matchedKeys, err
}

// Close cierra la base de datos bbolt.
func (s *BboltStore) Close() error {
	return s.db.Close()
}

// Dump imprime todo el contenido de la base de datos bbolt para propósitos de depuración.
func (s *BboltStore) Dump() error {
	// Nota: para depuración, aquí preferimos imprimir y no devolver un tipo de
	// salida estructurado.
	err := s.db.View(func(tx *bbolt.Tx) error {
		return tx.ForEach(func(bucketName []byte, b *bbolt.Bucket) error {
			fmt.Printf("Bucket: %s\n", string(bucketName))
			return b.ForEach(func(k, v []byte) error {
				fmt.Printf("  Key: %s, Value: %s\n", string(k), string(v))
				return nil
			})
		})
	})
	if err != nil {
		// Si alguien cierra la DB por debajo (o hay E/S), el error se propaga.
		// Mantenemos el contexto.
		return fmt.Errorf("error al hacer el volcado de depuración: %w", err)
	}
	return nil
}

// pkg/store/bbolt.go (añade estos imports: "bytes", "compress/zlib", "crypto/aes", "crypto/cipher", "crypto/sha256", "io")

func (s *BboltStore) protect(data []byte) ([]byte, error) {
	// Derivamos clave e IV usando SHA256 como en tu ejemplo
	h := sha256.Sum256(s.key)
	block, err := aes.NewCipher(h[:])
	if err != nil {
		return nil, err
	}

	iv := sha256.Sum256([]byte("<inicializar>"))
	stream := cipher.NewCTR(block, iv[:16])

	var out bytes.Buffer
	sw := &cipher.StreamWriter{S: stream, W: &out}
	zw := zlib.NewWriter(sw) // Añadimos compresión zlib

	if _, err := zw.Write(data); err != nil {
		return nil, err
	}
	zw.Close()
	return out.Bytes(), nil
}

func (s *BboltStore) unprotect(data []byte) ([]byte, error) {
	h := sha256.Sum256(s.key)
	block, err := aes.NewCipher(h[:])
	if err != nil {
		return nil, err
	}

	iv := sha256.Sum256([]byte("<inicializar>"))
	stream := cipher.NewCTR(block, iv[:16])

	sr := &cipher.StreamReader{S: stream, R: bytes.NewReader(data)}
	zr, err := zlib.NewReader(sr)
	if err != nil {
		return nil, err
	}
	defer zr.Close()

	return io.ReadAll(zr)
}
