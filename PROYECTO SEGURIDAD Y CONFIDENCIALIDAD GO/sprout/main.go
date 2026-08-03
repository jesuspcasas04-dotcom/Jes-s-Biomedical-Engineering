package main

import (
	"crypto/sha256"
	"fmt"
	"log"
	"os"
	"time"

	"sprout/pkg/api"
	"sprout/pkg/client"
	"sprout/pkg/server"
	"sprout/pkg/ui"
)

func main() {
	logger := log.New(os.Stdout, "[main] ", log.LstdFlags)

	ui.ClearScreen()
	fmt.Println("╔══════════════════════════════════════════════╗")
	fmt.Println("║    SISTEMA DE SALUD SEGURO — DATA SPACE      ║")
	fmt.Println("╚══════════════════════════════════════════════╝")
	fmt.Println()

	modo := ui.PrintMenu("Modo de ejecución", []string{
		"Servidor central  (gestiona el Data Space global)",
		"Hospital / Cliente (gestiona pacientes locales y sube al servidor central)",
	})

	pass, err := ui.ReadPassword("Contraseña maestra de la base de datos")
	if err != nil {
		logger.Fatalf("Error al leer contraseña: %v", err)
	}
	h := sha256.Sum256([]byte(pass))
	masterKey := h[:]

	switch modo {
	case 1:
		// ── Servidor central ───────────────────────────────────────────────
		fmt.Println()
		go func() {
			if err := server.Run(masterKey, api.ModeServer); err != nil {
				fmt.Printf("\n[ERROR CRÍTICO] %v\n", err)
				os.Exit(1)
			}
		}()
		arrancar("Servidor central")
		fmt.Println("Servidor central activo en :8080")
		fmt.Println("El admin puede conectarse desde un cliente hospital configurando la URL.")
		fmt.Println("Pulsa Ctrl+C para detener.")
		select {} // El servidor central no tiene cliente — solo sirve peticiones

	case 2:
		// ── Hospital ───────────────────────────────────────────────────────
		fmt.Println()

		// Preguntar si se conecta a servidor local o remoto
		serverMode := ui.PrintMenu("¿Dónde está el servidor de este hospital?", []string{
			"Local (este mismo equipo, puerto 8080)",
			"Remoto (introducir URL)",
		})

		var serverURL string
		if serverMode == 1 {
			go func() {
				if err := server.Run(masterKey, api.ModeHospital); err != nil {
					fmt.Printf("\n[ERROR CRÍTICO] %v\n", err)
					os.Exit(1)
				}
			}()
			arrancar("Sistema del hospital")
			serverURL = "https://localhost:8080/api"
		} else {
			serverURL = ui.ReadInput("URL del servidor del hospital (ej: https://192.168.1.5:8080/api)")
			fmt.Println("Conectando al servidor remoto...")
			time.Sleep(500 * time.Millisecond)
		}

		client.Run(serverURL)
	}
}

func arrancar(nombre string) {
	fmt.Printf("Iniciando %s", nombre)
	for i := 0; i < 12; i++ {
		fmt.Print(".")
		time.Sleep(120 * time.Millisecond)
	}
	fmt.Println(" OK")
}
