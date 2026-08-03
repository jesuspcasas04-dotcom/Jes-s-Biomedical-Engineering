package main

import (
	"fmt"
	"os"
	"strconv"
	"unicode"
)


func indice_alfabeto(l rune) int {
	alfabeto := map[rune]int{'A': 0, 'B': 1, 'C': 2, 'D': 3, 'E': 4, 'F': 5, 'G': 6, 'H': 7, 'I': 8, 'J': 9,
		'K': 10, 'L': 11, 'M': 12, 'N': 13, 'Ñ': 14, 'O': 15, 'P': 16, 'Q': 17, 'R': 18, 'S': 19,
		'T': 20, 'U': 21, 'V': 22, 'W': 23, 'X': 24, 'Y': 25, 'Z': 26}

	indice, existe := alfabeto[l]
	if existe {
		return indice
	}
	return -1 
}

func main() {
	var file_in *os.File  
	var file_out *os.File 
	var err error
	var des int

	letras := []rune{'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H',
		'I', 'J', 'K', 'L', 'M', 'N', 'Ñ', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'}

	if len(os.Args) == 2 {
		des, _ = strconv.Atoi(os.Args[1])
		file_in = os.Stdin
		file_out = os.Stdout
	} else if len(os.Args) == 4 {
		des, _ = strconv.Atoi(os.Args[1])
		file_in, err = os.Open(os.Args[2])
		if err != nil { // El error es cuando err NO es nil
			panic(err)
		}
		defer file_in.Close()

		file_out, err = os.Create(os.Args[3])
		if err != nil {
			panic(err)
		}
		defer file_out.Close()
	} else { 
		fmt.Println("Uso: [desplazamiento] [origen] [destino]")
		os.Exit(1)
	}

	fmt.Fprintln(os.Stderr, "Procesando...")

	var palabra string
	fmt.Fscan(file_in, &palabra)

	// Corregimos el range para obtener el carácter (v)
	for _, v := range palabra {
		letraMayus := unicode.ToUpper(v)
		indice := indice_alfabeto(letraMayus)

		if indice != -1 {
			// Fórmula del César: (posición + desplazamiento) % tamaño_alfabeto
			nuevoIndice := (indice + des) % 27
			if nuevoIndice < 0 {
				nuevoIndice += 27
			} // Por si el desplazamiento es negativo

			fmt.Fprintf(file_out, "%c", letras[nuevoIndice])
		} else {
			// Si es un símbolo que no está en el mapa, lo dejamos tal cual
			fmt.Fprintf(file_out, "%c", v)
		}
	}
	fmt.Fprintln(file_out)
}
