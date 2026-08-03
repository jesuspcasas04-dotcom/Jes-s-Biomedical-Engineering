package main

import (
	"fmt"
	"os"
	"unicode"
)

func main() {

	var fin *os.File
	var fout *os.File
	var err error
	var tamanyo int
	var longitud int

	if len(os.Args) != 3 {
		fmt.Println("Uso: esparta <filas> <columnas>")
		os.Exit(1)
	}

	_, err = fmt.Sscanf(os.Args[1], "%d", &tamanyo)
	if err != nil || tamanyo <= 0 {
		fmt.Println("Filas incorrectas")
		os.Exit(1)
	}

	_, err = fmt.Sscanf(os.Args[2], "%d", &longitud)
	if err != nil || longitud <= 0 {
		fmt.Println("Columnas incorrectas")
		os.Exit(1)
	}

	fin = os.Stdin
	fout = os.Stdout

	// memoria dinámica (matriz)
	scitala := make([][]rune, tamanyo)

	for i := 0; i < tamanyo; i++ {
		scitala[i] = make([]rune, longitud)
	}

	
	i := 0
	j := 0

	for {
		var c rune

		_, err = fmt.Fscanf(fin, "%c", &c)
		if err != nil {
			break
		}

		if unicode.IsSpace(c) {
			continue
		}

		C := unicode.ToUpper(c)

		if C >= 'A' && C <= 'Z' || C == 'Ñ' {

			scitala[i][j] = C

			j++
			if j == longitud {
				j = 0
				i++
				if i == tamanyo {
					break
				}
			}
		}
	}

	// leer por columnas
	for col := 0; col < longitud; col++ {
		for fila := 0; fila < tamanyo; fila++ {
			if scitala[fila][col] != 0 {
				fmt.Fprintf(fout, "%c", scitala[fila][col])
			}
		}
	}
}
