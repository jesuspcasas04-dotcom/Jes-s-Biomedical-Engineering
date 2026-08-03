package client

import (
	"bytes"
	"crypto/tls"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"sprout/pkg/api"
	"sprout/pkg/ui"
	"strings"
	"time"
)

type client struct {
	log            *log.Logger
	currentUser    string
	authToken      string
	currentRole    string
	hospitalName   string
	tokenExpiresAt time.Time
	serverURL      string // URL del servidor al que conectarse
	centralURL     string // URL del servidor central (para subidas del hospital)
	httpClient     *http.Client
}

func Run(serverURL string) {
	c := &client{
		log:       log.New(os.Stdout, "[cli] ", log.LstdFlags),
		serverURL: serverURL,
		centralURL: "https://localhost:8443/api",
		httpClient: &http.Client{
			Timeout: 10 * time.Second,
			Transport: &http.Transport{
				TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
			},
		},
	}
	c.runLoop()
}

// ── Bucle principal ───────────────────────────────────────────────────────────

func (c *client) runLoop() {
	for {
		ui.ClearScreen()
		if c.authToken != "" {
			c.checkAndRefreshToken()
			// Mostrar notificaciones pendientes antes del menú
			c.showNotifications()
		}
		switch c.currentRole {
		case "":
			c.menuSinSesion()
		case api.RoleAdmin:
			c.menuAdmin()
		case api.RoleMedico:
			c.menuMedico()
		case api.RolePaciente:
			c.menuPaciente()
		case api.RoleInvestigador:
			c.menuInvestigador()
		}
	}
}

// showNotifications consulta el servidor y muestra avisos relevantes para el rol actual.
func (c *client) showNotifications() {
	res := c.send(api.Request{Action: api.ActionGetNotifications, Token: c.authToken})
	if res.Success && res.Data != "" {
		fmt.Println("┌─ Notificaciones ────────────────────────────────")
		for _, line := range strings.Split(res.Data, "\n") {
			if line != "" {
				fmt.Printf("│  %s\n", line)
			}
		}
		fmt.Println("└─────────────────────────────────────────────────")
		fmt.Println()
	}
}

func (c *client) titulo() string {
	if c.currentUser == "" {
		return "Menú Principal"
	}
	remaining := time.Until(c.tokenExpiresAt).Round(time.Minute)
	name := c.currentUser
	if c.hospitalName != "" {
		name = fmt.Sprintf("%s — %s", c.hospitalName, c.currentUser)
	}
	return fmt.Sprintf("[ %s | %s | sesión: %s ]", name, c.currentRole, remaining)
}

// ── Menús ─────────────────────────────────────────────────────────────────────

func (c *client) menuSinSesion() {
	choice := ui.PrintMenu("Sistema de Salud Seguro — Data Space", []string{
		"Iniciar sesión",
		"Registrar usuario",
		"Salir",
	})
	switch choice {
	case 1:
		c.loginUser()
	case 2:
		c.registerUser()
	case 3:
		os.Exit(0)
	}
	ui.Pause("Pulsa [Enter] para continuar...")
}

func (c *client) menuAdmin() {
	choice := ui.PrintMenu(c.titulo(), []string{
		"Listar usuarios",
		"Dar de alta médico/hospital",
		"Dar de alta investigador",
		"Dar de alta paciente",
		"Eliminar usuario",
		"Cambiar rol de usuario",
		"Ver consultas de investigadores",
		"Autorizar petición",
		"Cambiar contraseña",
		"Cerrar sesión",
		"Salir",
	})
	switch choice {
	case 1:
		c.adminListUsers()
	case 2:
		c.adminCreateUser(api.RoleMedico)
	case 3:
		c.adminCreateUser(api.RoleInvestigador)
	case 4:
		c.adminCreateUser(api.RolePaciente)
	case 5:
		c.adminDeleteUser()
	case 6:
		c.adminChangeRole()
	case 7:
		c.adminVerConsultas()
	case 8:
		c.adminAuthorize()
	case 9:
		c.changePassword()
	case 10:
		c.logoutUser()
	case 11:
		os.Exit(0)
	}
	ui.Pause("Pulsa [Enter] para continuar...")
}

func (c *client) menuMedico() {
	choice := ui.PrintMenu(c.titulo(), []string{
		"Introducir datos de paciente (DB local)",
		"Ver mis pacientes",
		"Buscar paciente concreto",
		"Ver historial de versiones de un paciente",
		"Subir registros al servidor central (anónimo)",
		"Configurar URL del servidor central",
		"Cambiar contraseña",
		"Cerrar sesión",
		"Salir",
	})
	switch choice {
	case 1:
		c.medicoIntroducir()
	case 2:
		c.medicoImportar("")
	case 3:
		pid := ui.ReadInput("ID del paciente")
		c.medicoImportar(pid)
	case 4:
		c.medicoVerHistorial()
	case 5:
		c.medicoSubir("")
	case 6:
		c.centralURL = ui.ReadInput("URL del servidor central (ej: https://192.168.1.10:8443/api)")
		fmt.Printf("✅ URL configurada: %s\n", c.centralURL)
	case 7:
		c.changePassword()
	case 8:
		c.logoutUser()
	case 9:
		os.Exit(0)
	}
	ui.Pause("Pulsa [Enter] para continuar...")
}

func (c *client) menuPaciente() {
	choice := ui.PrintMenu(c.titulo(), []string{
		"Ver mis datos clínicos",
		"Revocar permisos de uso de datos",
		"Solicitar eliminación de mis datos",
		"Cambiar contraseña",
		"Cerrar sesión",
		"Salir",
	})
	switch choice {
	case 1:
		c.fetchData()
	case 2:
		c.revokeConsent()
	case 3:
		c.requestDeletion()
	case 4:
		c.changePassword()
	case 5:
		c.logoutUser()
	case 6:
		os.Exit(0)
	}
	ui.Pause("Pulsa [Enter] para continuar...")
}

func (c *client) menuInvestigador() {
	choice := ui.PrintMenu(c.titulo(), []string{
		"Hacer petición de consulta al administrador",
		"Ver mis consultas",
		"Ejecutar consulta aprobada",
		"Exportar resultados",
		"Cambiar contraseña",
		"Cerrar sesión",
		"Salir",
	})
	switch choice {
	case 1:
		c.investigadorPedirConsulta()
	case 2:
		c.investigadorVerConsultas()
	case 3:
		c.investigadorEjecutar()
	case 4:
		c.investigadorExportar()
	case 5:
		c.changePassword()
	case 6:
		c.logoutUser()
	case 7:
		os.Exit(0)
	}
	ui.Pause("Pulsa [Enter] para continuar...")
}

// ── Sesión ────────────────────────────────────────────────────────────────────

func (c *client) checkAndRefreshToken() {
	remaining := time.Until(c.tokenExpiresAt)
	if remaining <= 0 {
		fmt.Println("\n⚠️  Tu sesión ha expirado. Inicia sesión de nuevo.")
		c.clearSession()
		ui.Pause("Pulsa [Enter] para continuar...")
		return
	}
	if remaining < 10*time.Minute {
		fmt.Printf("\n⚠️  Sesión expira en %s. Renovando...\n", remaining.Round(time.Second))
		res := c.send(api.Request{Action: api.ActionRefreshToken, Token: c.authToken})
		if res.Success && res.Token != "" {
			c.authToken = res.Token
			c.tokenExpiresAt = time.Now().Add(time.Duration(res.TokenExpiresIn) * time.Second)
			fmt.Println("✅ Token renovado.")
		}
	}
}

func (c *client) clearSession() {
	c.currentUser = ""
	c.authToken = ""
	c.currentRole = ""
	c.hospitalName = ""
	c.tokenExpiresAt = time.Time{}
}

func (c *client) registerUser() {
	ui.ClearScreen()
	fmt.Println("── Registro de usuario ──")
	username := ui.ReadInput("Nombre de usuario")
	password, err := ui.ReadPassword("Contraseña")
	if err != nil {
		return
	}
	roleChoice := ui.PrintMenu("Rol", []string{"Paciente", "Médico/Hospital", "Investigador"})
	roles := []string{api.RolePaciente, api.RoleMedico, api.RoleInvestigador}
	role := roles[roleChoice-1]

	hospitalName := ""
	if role == api.RoleMedico {
		hospitalName = ui.ReadInput("Nombre del hospital")
	}
	res := c.send(api.Request{
		Action: api.ActionRegister, Username: username,
		Password: password, Role: role, HospitalName: hospitalName,
	})
	fmt.Println(res.Message)
	if res.Success {
		c.doLogin(username, password)
	}
}

func (c *client) loginUser() {
	ui.ClearScreen()
	fmt.Println("── Inicio de sesión ──")
	username := ui.ReadInput("Nombre de usuario")
	password, err := ui.ReadPassword("Contraseña")
	if err != nil {
		return
	}
	c.doLogin(username, password)
}

func (c *client) doLogin(username, password string) {
	res := c.send(api.Request{Action: api.ActionLogin, Username: username, Password: password})

	// Primera fase: si el servidor pide el código 2FA
	if res.Needs2FA {
		fmt.Println(res.Message)
		code := ui.ReadInput("Código 2FA (mostrado en la consola del servidor)")
		res = c.send(api.Request{
			Action:    api.ActionLoginVerify2FA,
			TempToken: res.TempToken,
			Code2FA:   code,
		})
	}

	fmt.Println(res.Message)
	if res.Success {
		c.currentUser = username
		c.authToken = res.Token
		c.currentRole = res.Role
		c.hospitalName = res.HospitalName
		c.tokenExpiresAt = time.Now().Add(time.Duration(res.TokenExpiresIn) * time.Second)

		switch res.Role {
		case api.RoleAdmin:
			fmt.Println("👑 Bienvenido, administrador.")
		case api.RoleMedico:
			name := res.HospitalName
			if name == "" {
				name = username
			}
			fmt.Printf("🏥 Bienvenido, %s.\n", name)
		case api.RoleInvestigador:
			fmt.Println("🔬 Bienvenido, investigador.")
		case api.RolePaciente:
			fmt.Println("👤 Bienvenido.")
		}
		if res.MustChangePass {
			fmt.Println("⚠️  Aviso: debes cambiar tu contraseña (disponible en el menú).")
		}
	}
}

func (c *client) logoutUser() {
	res := c.send(api.Request{Action: api.ActionLogout, Token: c.authToken})
	fmt.Println(res.Message)
	c.clearSession()
}

func (c *client) changePassword() {
	ui.ClearScreen()
	fmt.Println("── Cambiar contraseña ──")
	current, _ := ui.ReadPassword("Contraseña actual")
	nuevo, _ := ui.ReadPassword("Nueva contraseña")
	confirm, _ := ui.ReadPassword("Confirmar nueva contraseña")
	if nuevo != confirm {
		fmt.Println("❌ Las contraseñas no coinciden.")
		return
	}
	res := c.send(api.Request{
		Action:      api.ActionChangePassword,
		Username:    c.currentUser,
		Token:       c.authToken,
		Password:    current,
		NewPassword: nuevo,
	})
	fmt.Println(res.Message)
}

// ── Datos clínicos ────────────────────────────────────────────────────────────

func (c *client) fetchData() {
	ui.ClearScreen()
	fmt.Println("── Mis datos clínicos ──")
	res := c.send(api.Request{Action: api.ActionFetchData, Username: c.currentUser, Token: c.authToken})
	if res.Success {
		if res.Data == "" {
			fmt.Println("No tienes datos clínicos guardados.")
		} else {
			fmt.Println(res.Data)
		}
	} else {
		fmt.Println("Error:", res.Message)
	}
}

// ── Paciente ──────────────────────────────────────────────────────────────────

func (c *client) revokeConsent() {
	ui.ClearScreen()
	fmt.Println("── Revocar consentimiento ──")
	fmt.Println("Si revocas el consentimiento, tus datos NO podrán enviarse al Data Space.")
	fmt.Println("Los datos ya enviados de forma anónima no se pueden recuperar.")
	if !ui.Confirm("¿Confirmas la revocación?") {
		fmt.Println("Cancelado.")
		return
	}
	res := c.send(api.Request{Action: api.ActionRevokeConsent, Token: c.authToken})
	fmt.Println(res.Message)
}

func (c *client) requestDeletion() {
	ui.ClearScreen()
	fmt.Println("── Solicitar eliminación de datos ──")
	fmt.Println("Se enviará una solicitud al administrador para eliminar tu cuenta.")
	if !ui.Confirm("¿Confirmas la solicitud?") {
		fmt.Println("Cancelado.")
		return
	}
	res := c.send(api.Request{Action: api.ActionRequestDeletion, Token: c.authToken})
	fmt.Println(res.Message)
}

// ── Médico / Hospital ─────────────────────────────────────────────────────────

func (c *client) medicoIntroducir() {
	ui.ClearScreen()
	fmt.Println("── Introducir datos de paciente (DB local del hospital) ──")
	fmt.Println("Los datos quedan guardados en la base de datos local del hospital,")
	fmt.Println("identificados. Para enviarlos al servidor central, usa la opción de subida.")
	fmt.Println()

	pid := ui.ReadInput("ID interno del paciente (solo visible en este hospital)")
	edad := ui.ReadInt("Edad")
	sexo := ui.ReadInput("Sexo (M/F)")
	diagnostico := ui.ReadInput("Diagnóstico")
	notas := ui.ReadInput("Notas adicionales (vacío si no hay)")

	record := api.ClinicalRecord{Edad: edad, Sexo: sexo, Diagnostico: diagnostico, Notas: notas}
	xmlData, err := record.ToXML()
	if err != nil {
		fmt.Println("❌ Error de validación:", err)
		return
	}

	fmt.Println("\nDatos XML generados:\n")
	fmt.Println(xmlData)

	if !ui.Confirm("¿Guardar en la DB local del hospital?") {
		fmt.Println("Cancelado.")
		return
	}

	res := c.send(api.Request{
		Action:    api.ActionMedicoSaveLocal,
		Token:     c.authToken,
		PatientID: pid,
		Data:      xmlData,
	})
	if res.Success {
		fmt.Println("✅", res.Message)
	} else {
		fmt.Println("❌", res.Message)
	}
}

func (c *client) medicoVerHistorial() {
	ui.ClearScreen()
	fmt.Println("── Historial de versiones de un paciente ──")
	fmt.Println("Muestra las versiones anteriores del registro antes de cada actualización.")
	fmt.Println()
	pid := ui.ReadInput("ID del paciente")
	res := c.send(api.Request{
		Action:    api.ActionMedicoGetHistory,
		Token:     c.authToken,
		PatientID: pid,
	})
	if res.Success {
		fmt.Println()
		fmt.Println(res.Data)
	} else {
		fmt.Println("❌", res.Message)
	}
}

func (c *client) medicoImportar(pid string) {
	ui.ClearScreen()
	if pid == "" {
		fmt.Println("── Todos los pacientes del hospital ──")
	} else {
		fmt.Printf("── Datos del paciente: %s ──\n", pid)
	}
	res := c.send(api.Request{
		Action:    api.ActionMedicoImport,
		Token:     c.authToken,
		PatientID: pid,
	})
	if res.Success {
		fmt.Println(res.Data)
	} else {
		fmt.Println("❌", res.Message)
	}
}

func (c *client) medicoSubir(pid string) {
	ui.ClearScreen()
	fmt.Println("── Subir datos al servidor central (anonimizado) ──")
	fmt.Printf("URL del servidor central: %s\n\n", c.centralURL)
	fmt.Println("Los datos se enviarán SIN ningún identificador de hospital ni paciente.")
	fmt.Println("Esta operación es IRREVERSIBLE y unidireccional.")
	fmt.Println()

	if pid == "" {
		choice := ui.PrintMenu("¿Qué deseas subir?", []string{
			"Todos los registros del hospital",
			"Un paciente concreto",
		})
		if choice == 2 {
			pid = ui.ReadInput("ID del paciente")
		}
	}

	if !ui.Confirm("¿Confirmas la subida anónima al servidor central?") {
		fmt.Println("Cancelado.")
		return
	}

	res := c.send(api.Request{
		Action:    api.ActionMedicoUpload,
		Token:     c.authToken,
		PatientID: pid,
		ServerURL: c.centralURL,
	})
	if res.Success {
		fmt.Println("✅", res.Message)
	} else {
		fmt.Println("❌", res.Message)
	}
}

// ── Investigador ──────────────────────────────────────────────────────────────

func (c *client) investigadorPedirConsulta() {
	ui.ClearScreen()
	fmt.Println("── Solicitar consulta al administrador ──")
	fmt.Println("El administrador debe aprobar tu petición antes de que puedas ejecutarla.")
	fmt.Println()
	descripcion := ui.ReadInput("Describe la consulta que necesitas")
	res := c.send(api.Request{Action: api.ActionRequestQuery, Token: c.authToken, Data: descripcion})
	fmt.Println(res.Message)
}

func (c *client) investigadorVerConsultas() {
	ui.ClearScreen()
	fmt.Println("── Mis consultas ──")
	choice := ui.PrintMenu("Filtrar por estado", []string{
		"Todas", "Pendientes", "Aprobadas", "Denegadas",
	})
	filtros := []string{"", api.QueryPending, api.QueryApproved, api.QueryDenied}
	res := c.send(api.Request{Action: api.ActionListMyQueries, Token: c.authToken, Data: filtros[choice-1]})
	if res.Success {
		fmt.Println()
		fmt.Println(res.Data)
	} else {
		fmt.Println("❌", res.Message)
	}
}

func (c *client) investigadorEjecutar() {
	ui.ClearScreen()
	fmt.Println("── Ejecutar consulta aprobada ──")
	fmt.Println("Solo puedes ejecutar consultas que el administrador haya aprobado.")
	fmt.Println()

	// Mostramos primero las aprobadas para que el investigador elija
	listRes := c.send(api.Request{Action: api.ActionListMyQueries, Token: c.authToken, Data: api.QueryApproved})
	if listRes.Success && listRes.Data != "" && listRes.Data != "No tienes consultas en este estado." {
		fmt.Println("Tus consultas aprobadas:\n")
		fmt.Println(listRes.Data)
	}

	qid := ui.ReadInput("ID de la consulta")
	res := c.send(api.Request{Action: api.ActionQuerySpace, Token: c.authToken, QueryID: qid})
	if res.Success {
		fmt.Println("\n── Resultado ──")
		fmt.Println(res.Data)
	} else {
		fmt.Println("❌", res.Message)
	}
}

func (c *client) investigadorExportar() {
	ui.ClearScreen()
	fmt.Println("── Exportar resultados ──")
	qid := ui.ReadInput("ID de la consulta")
	res := c.send(api.Request{Action: api.ActionExportQuery, Token: c.authToken, QueryID: qid})
	if !res.Success {
		fmt.Println("❌", res.Message)
		return
	}
	filename := fmt.Sprintf("data/consulta_%s_%s.txt", qid, time.Now().Format("20060102_150405"))
	if err := os.WriteFile(filename, []byte(res.Data), 0644); err != nil {
		fmt.Println("❌ Error al guardar fichero:", err)
		return
	}
	fmt.Printf("✅ Exportado a: %s\n\n", filename)
	fmt.Println(res.Data)
}

// ── Administrador ─────────────────────────────────────────────────────────────

func (c *client) adminListUsers() {
	ui.ClearScreen()
	fmt.Println("── Usuarios del sistema ──")
	res := c.send(api.Request{Action: api.ActionAdminListUsers, Token: c.authToken})
	if res.Success {
		fmt.Println(res.Data)
	} else {
		fmt.Println("❌", res.Message)
	}
}

func (c *client) adminCreateUser(role string) {
	ui.ClearScreen()
	fmt.Printf("── Dar de alta: %s ──\n", role)
	username := ui.ReadInput("Nombre de usuario")
	password, err := ui.ReadPassword("Contraseña inicial")
	if err != nil {
		return
	}
	hospitalName := ""
	if role == api.RoleMedico {
		hospitalName = ui.ReadInput("Nombre del hospital")
	}
	res := c.send(api.Request{
		Action:       api.ActionAdminCreateUser,
		Token:        c.authToken,
		TargetUser:   username,
		Password:     password,
		Role:         role,
		HospitalName: hospitalName,
	})
	fmt.Println(res.Message)
}

func (c *client) adminDeleteUser() {
	ui.ClearScreen()
	fmt.Println("── Eliminar usuario ──")
	listRes := c.send(api.Request{Action: api.ActionAdminListUsers, Token: c.authToken})
	if listRes.Success {
		fmt.Println(listRes.Data)
	}
	username := ui.ReadInput("Nombre de usuario a eliminar")
	if !ui.Confirm(fmt.Sprintf("¿Eliminar a '%s'?", username)) {
		fmt.Println("Cancelado.")
		return
	}
	res := c.send(api.Request{Action: api.ActionAdminDeleteUser, Token: c.authToken, TargetUser: username})
	fmt.Println(res.Message)
}

func (c *client) adminChangeRole() {
	ui.ClearScreen()
	fmt.Println("── Cambiar rol de usuario ──")
	listRes := c.send(api.Request{Action: api.ActionAdminListUsers, Token: c.authToken})
	if listRes.Success {
		fmt.Println(listRes.Data)
	}
	username := ui.ReadInput("Nombre de usuario")
	choice := ui.PrintMenu("Nuevo rol", []string{"Paciente", "Médico", "Investigador", "Admin"})
	roles := []string{api.RolePaciente, api.RoleMedico, api.RoleInvestigador, api.RoleAdmin}
	res := c.send(api.Request{
		Action:     api.ActionAdminChangeRole,
		Token:      c.authToken,
		TargetUser: username,
		Role:       roles[choice-1],
	})
	fmt.Println(res.Message)
}

func (c *client) adminVerConsultas() {
	ui.ClearScreen()
	fmt.Println("── Consultas de investigadores ──")
	choice := ui.PrintMenu("Filtrar", []string{"Todas", "Pendientes", "Aprobadas", "Denegadas"})
	filtros := []string{"", api.QueryPending, api.QueryApproved, api.QueryDenied}
	res := c.send(api.Request{Action: api.ActionAdminListQueries, Token: c.authToken, Data: filtros[choice-1]})
	if res.Success {
		fmt.Println(res.Data)
	} else {
		fmt.Println("❌", res.Message)
	}
}

func (c *client) adminAuthorize() {
	ui.ClearScreen()
	fmt.Println("── Autorizar petición ──")
	choice := ui.PrintMenu("¿Qué tipo de petición?", []string{
		"Consulta de investigador",
		"Solicitud de eliminación de usuario",
	})
	if choice == 1 {
		// Mostrar pendientes antes de pedir el ID
		listRes := c.send(api.Request{Action: api.ActionAdminListQueries, Token: c.authToken, Data: api.QueryPending})
		if listRes.Success {
			fmt.Println(listRes.Data)
		}
		qid := ui.ReadInput("ID de la consulta")
		accion := "denegar"
		if ui.PrintMenu("Acción", []string{"Aprobar", "Denegar"}) == 1 {
			accion = "aprobar"
		}
		res := c.send(api.Request{Action: api.ActionAdminAuthorize, Token: c.authToken, QueryID: qid, Data: accion})
		fmt.Println(res.Message)
	} else {
		listRes := c.send(api.Request{Action: api.ActionAdminListUsers, Token: c.authToken})
		if listRes.Success {
			fmt.Println(listRes.Data)
		}
		username := ui.ReadInput("Username del usuario que solicita eliminación")
		if !ui.Confirm(fmt.Sprintf("¿Aprobar eliminación de '%s'?", username)) {
			fmt.Println("Cancelado.")
			return
		}
		res := c.send(api.Request{Action: api.ActionAdminAuthorize, Token: c.authToken, QueryID: username})
		fmt.Println(res.Message)
	}
}

// ── HTTP ──────────────────────────────────────────────────────────────────────

func (c *client) send(req api.Request) api.Response {
	if req.Username == "" {
		req.Username = c.currentUser
	}
	jsonData, _ := json.Marshal(req)
	httpReq, err := http.NewRequest(http.MethodPost, c.serverURL, bytes.NewBuffer(jsonData))
	if err != nil {
		return api.Response{Success: false, Message: "Error interno del cliente"}
	}
	httpReq.Header.Set("Content-Type", "application/json")
	resp, err := c.httpClient.Do(httpReq)
	if err != nil {
		return api.Response{Success: false, Message: "Error de conexión — ¿está el servidor activo?"}
	}
	defer resp.Body.Close()
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return api.Response{Success: false, Message: "Respuesta inválida del servidor"}
	}
	var res api.Response
	if err := json.Unmarshal(body, &res); err != nil {
		return api.Response{Success: false, Message: "Respuesta inválida del servidor"}
	}
	return res
}
