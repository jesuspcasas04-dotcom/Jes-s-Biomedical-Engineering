package server

import (
	"bytes"
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"crypto/tls"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"math/big"
	"net"
	"net/http"
	"os"
	"sprout/pkg/api"
	"sprout/pkg/store"
	"strings"
	"sync"
	"time"

	"github.com/dgrijalva/jwt-go"
	"golang.org/x/crypto/scrypt"
)

// ── Constantes de seguridad ───────────────────────────────────────────────────

const (
	maxFailedLogins    = 5
	lockoutDuration    = 15 * time.Minute
	jwtSecret          = "mi-secreto-muy-secreto"
	hmacSecret         = "hmac-secreto-integridad-2026"
	tokenDuration      = 1 * time.Hour
	temp2FADuration    = 5 * time.Minute
	defaultMinAnon     = 5
	rateMaxRequests    = 20
	rateWindow         = 1 * time.Minute
	inactivityTimeout  = 30 * time.Minute // Expiración de sesión por inactividad
)

// ipBucket lleva el contador de peticiones por IP.
type ipBucket struct {
	count     int
	windowEnd time.Time
}

// ── Tipos internos ────────────────────────────────────────────────────────────

type authEntry struct {
	Hash            []byte    `json:"hash"`
	Salt            []byte    `json:"salt"`
	Role            string    `json:"role"`
	MustChangePass  bool      `json:"must_change_pass"`
	LoginCount      int       `json:"login_count"`
	ConsentRevoked  bool      `json:"consent_revoked"`
	DeleteRequested bool      `json:"delete_requested"`
	HospitalName    string    `json:"hospital_name,omitempty"`
	FailedLogins    int       `json:"failed_logins"`
	LockedUntil     time.Time `json:"locked_until,omitempty"`
	LastActivity    time.Time `json:"last_activity,omitempty"` // Para expiración por inactividad
}

// patientRecord almacena una versión de un registro clínico con metadata.
type patientRecord struct {
	Data      string    `json:"data"`       // XML clínico
	Timestamp time.Time `json:"timestamp"`  // Cuándo se creó esta versión
	Author    string    `json:"author"`     // Usuario que la creó
}

func (e authEntry) isLocked() bool {
	return e.FailedLogins >= maxFailedLogins && time.Now().Before(e.LockedUntil)
}

type Payload struct {
	Username string `json:"username"`
	Role     string `json:"role"`
	jwt.StandardClaims
}

// pending2FA guarda el estado de un login pendiente de verificación 2FA.
type pending2FA struct {
	username  string
	code      string
	expiresAt time.Time
}

type server struct {
	db          store.Store
	mode        string
	secuLog     *log.Logger
	pending2FA  map[string]pending2FA
	mu2FA       sync.Mutex
	minAnon     int
	rateLimiter map[string]*ipBucket // IP -> contador de peticiones
	muRate      sync.Mutex
}

var tlsSkipVerify = &tls.Config{InsecureSkipVerify: true}

// ── Arranque ──────────────────────────────────────────────────────────────────

func Run(masterKey []byte, mode string) error {
	if err := os.MkdirAll("data", 0755); err != nil {
		return fmt.Errorf("no se pudo crear carpeta data: %v", err)
	}

	dbPath := map[string]string{
		api.ModeServer:   "data/server.db",
		api.ModeHospital: "data/hospital.db",
	}[mode]
	if dbPath == "" {
		return fmt.Errorf("modo desconocido: %s", mode)
	}

	_, errStat := os.Stat(dbPath)
	dbExiste := !os.IsNotExist(errStat)

	db, err := store.NewStore("bbolt", dbPath, masterKey)
	if err != nil {
		return fmt.Errorf("no se pudo abrir la DB: %v", err)
	}

	const checkKey = "master_check"
	const expected = "VALIDO_2026"
	if !dbExiste {
		db.Put("system", []byte(checkKey), []byte(expected))
		createDefaultAdmin(db)
		fmt.Printf("[INFO] Nueva DB creada: %s (usuario: admin / contraseña: admin)\n", dbPath)
	} else {
		val, err := db.Get("system", []byte(checkKey))
		if err != nil || string(val) != expected {
			db.Close()
			return fmt.Errorf("CLAVE MAESTRA INCORRECTA: no se pudo descifrar la marca de seguridad")
		}
	}

	secuFile, err := os.OpenFile("data/security.log", os.O_CREATE|os.O_APPEND|os.O_WRONLY, 0600)
	if err != nil {
		return fmt.Errorf("no se pudo abrir el log de seguridad: %v", err)
	}

	srv := &server{
		db:          db,
		mode:        mode,
		secuLog:     log.New(io.MultiWriter(secuFile, os.Stdout), "[SECU] ", log.LstdFlags),
		pending2FA:  make(map[string]pending2FA),
		minAnon:     defaultMinAnon,
		rateLimiter: make(map[string]*ipBucket),
	}
	srv.secuLog.Printf("=== SERVIDOR INICIADO (modo: %s, db: %s) ===", mode, dbPath)

	mux := http.NewServeMux()
	mux.Handle("/api", http.HandlerFunc(srv.apiHandler))
	return http.ListenAndServeTLS(":8080", "cert.pem", "key.pem", mux)
}

func createDefaultAdmin(db store.Store) {
	salt := make([]byte, 16)
	rand.Read(salt)
	hash, _ := scrypt.Key([]byte("admin"), salt, 16384, 8, 1, 32)
	data, _ := json.Marshal(authEntry{Hash: hash, Salt: salt, Role: api.RoleAdmin, MustChangePass: true})
	db.Put("auth", []byte("admin"), data)
}

// ── Dispatcher ────────────────────────────────────────────────────────────────

func (s *server) apiHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	// Rate limiting por IP
	ip, _, _ := net.SplitHostPort(r.RemoteAddr)
	if ip == "" {
		ip = r.RemoteAddr
	}
	if !s.allowRequest(ip) {
		s.secuLog.Printf("RATE_LIMIT ip='%s'", ip)
		http.Error(w, "Demasiadas peticiones. Espera un momento.", http.StatusTooManyRequests)
		return
	}

	r.Body = http.MaxBytesReader(w, r.Body, 1<<20)
	var req api.Request
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Error en el formato JSON", http.StatusBadRequest)
		return
	}

	var res api.Response
	switch req.Action {
	case api.ActionRegister:
		res = s.registerUser(req)
	case api.ActionLogin:
		res = s.loginUser(req)
	case api.ActionLoginVerify2FA:
		res = s.loginVerify2FA(req)
	case api.ActionLogout:
		res = s.logoutUser(req)
	case api.ActionChangePassword:
		res = s.changePassword(req)
	case api.ActionRefreshToken:
		res = s.refreshToken(req)
	case api.ActionAdminCreateUser:
		res = s.adminCreateUser(req)
	case api.ActionAdminDeleteUser:
		res = s.adminDeleteUser(req)
	case api.ActionAdminChangeRole:
		res = s.adminChangeRole(req)
	case api.ActionAdminListUsers:
		res = s.adminListUsers(req)
	case api.ActionAdminAuthorize:
		res = s.adminAuthorizeRequest(req)
	case api.ActionAdminUnlockUser:
		res = s.adminUnlockUser(req)
	case api.ActionAdminSetMinAnon:
		res = s.adminSetMinAnon(req)
	default:
		if s.mode == api.ModeHospital {
			res = s.dispatchHospital(req)
		} else {
			res = s.dispatchCentral(req)
		}
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(res)
}

// allowRequest comprueba si la IP puede hacer otra petición en la ventana actual.
func (s *server) allowRequest(ip string) bool {
	s.muRate.Lock()
	defer s.muRate.Unlock()
	now := time.Now()
	b, exists := s.rateLimiter[ip]
	if !exists || now.After(b.windowEnd) {
		s.rateLimiter[ip] = &ipBucket{count: 1, windowEnd: now.Add(rateWindow)}
		return true
	}
	b.count++
	return b.count <= rateMaxRequests
}

// SignData calcula el HMAC-SHA256 del dato con el secreto compartido.
// El hospital lo usa antes de enviar; el servidor central lo verifica al recibir.
func SignData(data string) string {
	mac := hmac.New(sha256.New, []byte(hmacSecret))
	mac.Write([]byte(data))
	return hex.EncodeToString(mac.Sum(nil))
}

// VerifyDataSig verifica que la firma corresponde al dato.
func VerifyDataSig(data, sig string) bool {
	expected := SignData(data)
	return hmac.Equal([]byte(expected), []byte(sig))
}

// hashPatientID calcula el SHA-256 del ID del paciente para deduplicación anónima.
func hashPatientID(patientID string) string {
	h := sha256.Sum256([]byte(patientID))
	return hex.EncodeToString(h[:])
}

func (s *server) dispatchHospital(req api.Request) api.Response {
	switch req.Action {
	case api.ActionFetchData:
		return s.fetchData(req)
	case api.ActionMedicoSaveLocal:
		return s.medicoSaveLocal(req)
	case api.ActionMedicoImport:
		return s.medicoImport(req)
	case api.ActionMedicoUpload:
		return s.medicoUpload(req)
	case api.ActionMedicoGetHistory:
		return s.medicoGetHistory(req)
	case api.ActionGetNotifications:
		return s.getNotifications(req)
	case api.ActionRevokeConsent:
		return s.revokeConsent(req)
	case api.ActionRequestDeletion:
		return s.requestDeletion(req)
	default:
		return api.Response{Success: false, Message: "Acción no disponible en modo hospital"}
	}
}

func (s *server) dispatchCentral(req api.Request) api.Response {
	switch req.Action {
	case api.ActionReceiveAnonData:
		return s.receiveAnonData(req)
	case api.ActionQuerySpace:
		return s.queryDataSpace(req)
	case api.ActionExportQuery:
		return s.exportQuery(req)
	case api.ActionRequestQuery:
		return s.requestQuery(req)
	case api.ActionListMyQueries:
		return s.listMyQueries(req)
	case api.ActionAdminListQueries:
		return s.adminListQueries(req)
	case api.ActionGetNotifications:
		return s.getNotifications(req)
	default:
		return api.Response{Success: false, Message: "Acción no disponible en el servidor central"}
	}
}

// ── Helpers ───────────────────────────────────────────────────────────────────

func (s *server) generateJWT(username, role string) (string, error) {
	claims := &Payload{
		Username: username, Role: role,
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: time.Now().Add(tokenDuration).Unix(),
			IssuedAt:  time.Now().Unix(),
			Id:        username,
		},
	}
	return jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString([]byte(jwtSecret))
}

func (s *server) validateJWT(tok string) (username, role string, expiresIn int64, valid bool) {
	claims := &Payload{}
	t, err := jwt.ParseWithClaims(tok, claims, func(t *jwt.Token) (interface{}, error) {
		return []byte(jwtSecret), nil
	})
	if err != nil || !t.Valid {
		return "", "", 0, false
	}
	rem := claims.ExpiresAt - time.Now().Unix()
	if rem <= 0 {
		return "", "", 0, false
	}

	// Comprobar inactividad: si el usuario no ha hecho ninguna petición en
	// inactivityTimeout minutos, invalidamos la sesión aunque el JWT siga vigente.
	e, err := s.getAuth(claims.Username)
	if err == nil && !e.LastActivity.IsZero() {
		if time.Since(e.LastActivity) > inactivityTimeout {
			s.secuLog.Printf("SESION_INACTIVA usuario='%s' inactividad='%s'",
				claims.Username, time.Since(e.LastActivity).Round(time.Second))
			return "", "", 0, false
		}
	}

	// Actualizar última actividad
	if err == nil {
		e.LastActivity = time.Now()
		s.saveAuth(claims.Username, e)
	}

	return claims.Username, claims.Role, rem, true
}

func (s *server) hashPassword(pw string) ([]byte, []byte, error) {
	salt := make([]byte, 16)
	rand.Read(salt)
	hash, err := scrypt.Key([]byte(pw), salt, 16384, 8, 1, 32)
	return hash, salt, err
}

func (s *server) getAuth(username string) (authEntry, error) {
	raw, err := s.db.Get("auth", []byte(username))
	if err != nil {
		return authEntry{}, err
	}
	var e authEntry
	return e, json.Unmarshal(raw, &e)
}

func (s *server) saveAuth(username string, e authEntry) error {
	data, _ := json.Marshal(e)
	return s.db.Put("auth", []byte(username), data)
}

func (s *server) userExists(username string) bool {
	_, err := s.db.Get("auth", []byte(username))
	return err == nil
}

func (s *server) requireRole(tok string, roles ...string) (string, string, bool) {
	u, role, _, valid := s.validateJWT(tok)
	if !valid {
		return "", "", false
	}
	for _, r := range roles {
		if role == r {
			return u, role, true
		}
	}
	return "", "", false
}

func (s *server) hospitalLabel(username string) string {
	e, err := s.getAuth(username)
	if err == nil && e.HospitalName != "" {
		return e.HospitalName
	}
	return username
}

// generate2FACode genera un código numérico de 6 dígitos.
func generate2FACode() string {
	n, _ := rand.Int(rand.Reader, big.NewInt(1000000))
	return fmt.Sprintf("%06d", n.Int64())
}

// generateTempToken genera un token temporal para el flujo 2FA.
func generateTempToken() string {
	b := make([]byte, 16)
	rand.Read(b)
	return fmt.Sprintf("%x", b)
}

// ── Login con 2FA ─────────────────────────────────────────────────────────────

func (s *server) loginUser(req api.Request) api.Response {
	e, err := s.getAuth(req.Username)
	if err != nil {
		s.secuLog.Printf("LOGIN FALLIDO usuario='%s' motivo='no encontrado'", req.Username)
		return api.Response{Success: false, Message: "Usuario no encontrado"}
	}

	// Comprobar bloqueo
	if e.isLocked() {
		remaining := time.Until(e.LockedUntil).Round(time.Second)
		s.secuLog.Printf("LOGIN BLOQUEADO usuario='%s' restante='%s'", req.Username, remaining)
		return api.Response{Success: false, Message: fmt.Sprintf(
			"Cuenta bloqueada por %d intentos fallidos. Espera %s o contacta al administrador.",
			maxFailedLogins, remaining)}
	}

	// Verificar contraseña
	h, _ := scrypt.Key([]byte(req.Password), e.Salt, 16384, 8, 1, 32)
	if !bytes.Equal(e.Hash, h) {
		e.FailedLogins++
		if e.FailedLogins >= maxFailedLogins {
			e.LockedUntil = time.Now().Add(lockoutDuration)
			s.saveAuth(req.Username, e)
			s.secuLog.Printf("CUENTA_BLOQUEADA usuario='%s' intentos=%d", req.Username, e.FailedLogins)
			return api.Response{Success: false, Message: fmt.Sprintf(
				"Cuenta bloqueada tras %d intentos fallidos. Desbloqueo en %s.",
				maxFailedLogins, lockoutDuration)}
		}
		s.saveAuth(req.Username, e)
		s.secuLog.Printf("LOGIN FALLIDO usuario='%s' intentos=%d/%d", req.Username, e.FailedLogins, maxFailedLogins)
		return api.Response{Success: false, Message: fmt.Sprintf(
			"Credenciales inválidas (%d/%d intentos)", e.FailedLogins, maxFailedLogins)}
	}

	// Contraseña correcta — resetear contador de fallos
	e.FailedLogins = 0
	e.LockedUntil = time.Time{}
	e.LoginCount++
	if e.LoginCount >= 3 {
		e.MustChangePass = true
		e.LoginCount = 0
	}
	s.saveAuth(req.Username, e)

	// Generar código 2FA y token temporal
	code := generate2FACode()
	tempToken := generateTempToken()

	s.mu2FA.Lock()
	s.pending2FA[tempToken] = pending2FA{
		username:  req.Username,
		code:      code,
		expiresAt: time.Now().Add(temp2FADuration),
	}
	s.mu2FA.Unlock()

	// El código se imprime en el log del servidor (simula envío por SMS/email)
	s.secuLog.Printf("2FA_CODE usuario='%s' codigo='%s' (válido %s)", req.Username, code, temp2FADuration)

	return api.Response{
		Success:   true,
		Message:   "Contraseña correcta. Introduce el código 2FA mostrado en el servidor.",
		TempToken: tempToken,
		Needs2FA:  true,
	}
}

func (s *server) loginVerify2FA(req api.Request) api.Response {
	s.mu2FA.Lock()
	p, exists := s.pending2FA[req.TempToken]
	s.mu2FA.Unlock()

	if !exists || time.Now().After(p.expiresAt) {
		s.mu2FA.Lock()
		delete(s.pending2FA, req.TempToken)
		s.mu2FA.Unlock()
		return api.Response{Success: false, Message: "Código 2FA expirado o inválido. Inicia sesión de nuevo."}
	}

	if req.Code2FA != p.code {
		s.secuLog.Printf("2FA_FALLIDO usuario='%s'", p.username)
		return api.Response{Success: false, Message: "Código 2FA incorrecto."}
	}

	// 2FA correcto — limpiar y emitir JWT real
	s.mu2FA.Lock()
	delete(s.pending2FA, req.TempToken)
	s.mu2FA.Unlock()

	e, err := s.getAuth(p.username)
	if err != nil {
		return api.Response{Success: false, Message: "Error interno"}
	}

	tok, err := s.generateJWT(p.username, e.Role)
	if err != nil {
		return api.Response{Success: false, Message: "Error al crear sesión"}
	}

	s.secuLog.Printf("LOGIN OK usuario='%s' rol='%s'", p.username, e.Role)
	return api.Response{
		Success:        true,
		Message:        "Autenticación completada",
		Token:          tok,
		Role:           e.Role,
		HospitalName:   e.HospitalName,
		MustChangePass: e.MustChangePass,
		TokenExpiresIn: int64(tokenDuration.Seconds()),
	}
}

// ── Acciones comunes ──────────────────────────────────────────────────────────

func (s *server) registerUser(req api.Request) api.Response {
	if req.Username == "" || req.Password == "" {
		return api.Response{Success: false, Message: "Faltan credenciales"}
	}
	if s.userExists(req.Username) {
		return api.Response{Success: false, Message: "El usuario ya existe"}
	}
	validRoles := map[string]bool{
		api.RolePaciente: true, api.RoleMedico: true,
		api.RoleInvestigador: true, api.RoleAdmin: true,
	}
	role := req.Role
	if !validRoles[role] {
		role = api.RolePaciente
	}
	hash, salt, err := s.hashPassword(req.Password)
	if err != nil {
		return api.Response{Success: false, Message: "Error al procesar contraseña"}
	}
	e := authEntry{Hash: hash, Salt: salt, Role: role, MustChangePass: true}
	if role == api.RoleMedico {
		e.HospitalName = req.HospitalName
	}
	if err := s.saveAuth(req.Username, e); err != nil {
		return api.Response{Success: false, Message: "Error al guardar credenciales"}
	}
	s.secuLog.Printf("REGISTRO usuario='%s' rol='%s'", req.Username, role)
	return api.Response{Success: true, Message: fmt.Sprintf("Usuario '%s' registrado como '%s'", req.Username, role)}
}

func (s *server) logoutUser(req api.Request) api.Response {
	u, _, _, valid := s.validateJWT(req.Token)
	if !valid {
		return api.Response{Success: false, Message: "Token inválido"}
	}
	s.secuLog.Printf("LOGOUT usuario='%s'", u)
	return api.Response{Success: true, Message: "Sesión cerrada"}
}

func (s *server) changePassword(req api.Request) api.Response {
	var username string
	if req.Token != "" {
		u, _, _, valid := s.validateJWT(req.Token)
		if !valid {
			return api.Response{Success: false, Message: "Sesión inválida"}
		}
		username = u
	} else {
		username = req.Username
	}
	if req.NewPassword == "" {
		return api.Response{Success: false, Message: "La nueva contraseña no puede estar vacía"}
	}
	e, err := s.getAuth(username)
	if err != nil {
		return api.Response{Success: false, Message: "Usuario no encontrado"}
	}
	if req.Password != "" {
		h, _ := scrypt.Key([]byte(req.Password), e.Salt, 16384, 8, 1, 32)
		if !bytes.Equal(e.Hash, h) {
			s.secuLog.Printf("CAMBIO_PASS FALLIDO usuario='%s'", username)
			return api.Response{Success: false, Message: "Contraseña actual incorrecta"}
		}
	}
	newHash, newSalt, err := s.hashPassword(req.NewPassword)
	if err != nil {
		return api.Response{Success: false, Message: "Error al procesar nueva contraseña"}
	}
	e.Hash = newHash
	e.Salt = newSalt
	e.MustChangePass = false
	e.LoginCount = 0
	s.saveAuth(username, e)
	s.secuLog.Printf("CAMBIO_PASS OK usuario='%s'", username)
	return api.Response{Success: true, Message: "Contraseña actualizada correctamente"}
}

func (s *server) refreshToken(req api.Request) api.Response {
	u, role, rem, valid := s.validateJWT(req.Token)
	if !valid {
		return api.Response{Success: false, Message: "Token inválido o expirado"}
	}
	if rem > 15*60 {
		return api.Response{Success: true, Token: req.Token, TokenExpiresIn: rem}
	}
	tok, err := s.generateJWT(u, role)
	if err != nil {
		return api.Response{Success: false, Message: "Error al renovar token"}
	}
	s.secuLog.Printf("TOKEN_RENOVADO usuario='%s'", u)
	return api.Response{Success: true, Message: "Token renovado", Token: tok, TokenExpiresIn: int64(tokenDuration.Seconds())}
}

// ── Administrador ─────────────────────────────────────────────────────────────

func (s *server) adminCreateUser(req api.Request) api.Response {
	caller, _, ok := s.requireRole(req.Token, api.RoleAdmin)
	if !ok {
		return api.Response{Success: false, Message: "Acceso denegado: se requiere rol admin"}
	}
	if req.TargetUser == "" || req.Password == "" {
		return api.Response{Success: false, Message: "Faltan usuario o contraseña"}
	}
	if s.userExists(req.TargetUser) {
		return api.Response{Success: false, Message: "El usuario ya existe"}
	}
	validRoles := map[string]bool{
		api.RolePaciente: true, api.RoleMedico: true,
		api.RoleInvestigador: true, api.RoleAdmin: true,
	}
	role := req.Role
	if !validRoles[role] {
		role = api.RolePaciente
	}
	hash, salt, _ := s.hashPassword(req.Password)
	e := authEntry{Hash: hash, Salt: salt, Role: role, MustChangePass: true}
	if role == api.RoleMedico {
		e.HospitalName = req.HospitalName
	}
	s.saveAuth(req.TargetUser, e)
	s.secuLog.Printf("ADMIN_CREA admin='%s' nuevo='%s' rol='%s'", caller, req.TargetUser, role)
	return api.Response{Success: true, Message: fmt.Sprintf("Usuario '%s' creado con rol '%s'", req.TargetUser, role)}
}

func (s *server) adminDeleteUser(req api.Request) api.Response {
	caller, _, ok := s.requireRole(req.Token, api.RoleAdmin)
	if !ok {
		return api.Response{Success: false, Message: "Acceso denegado: se requiere rol admin"}
	}
	if req.TargetUser == "" || req.TargetUser == "admin" {
		return api.Response{Success: false, Message: "Usuario no válido para eliminar"}
	}
	if !s.userExists(req.TargetUser) {
		return api.Response{Success: false, Message: "Usuario no encontrado"}
	}
	s.db.Delete("auth", []byte(req.TargetUser))
	s.db.Delete("userdata", []byte(req.TargetUser))
	s.secuLog.Printf("ADMIN_ELIMINA admin='%s' usuario='%s'", caller, req.TargetUser)
	return api.Response{Success: true, Message: fmt.Sprintf("Usuario '%s' eliminado", req.TargetUser)}
}

func (s *server) adminChangeRole(req api.Request) api.Response {
	caller, _, ok := s.requireRole(req.Token, api.RoleAdmin)
	if !ok {
		return api.Response{Success: false, Message: "Acceso denegado: se requiere rol admin"}
	}
	e, err := s.getAuth(req.TargetUser)
	if err != nil {
		return api.Response{Success: false, Message: "Usuario no encontrado"}
	}
	validRoles := map[string]bool{
		api.RolePaciente: true, api.RoleMedico: true,
		api.RoleInvestigador: true, api.RoleAdmin: true,
	}
	if !validRoles[req.Role] {
		return api.Response{Success: false, Message: "Rol no válido"}
	}
	old := e.Role
	e.Role = req.Role
	s.saveAuth(req.TargetUser, e)
	s.secuLog.Printf("ADMIN_CAMBIA_ROL admin='%s' usuario='%s' %s->%s", caller, req.TargetUser, old, req.Role)
	return api.Response{Success: true, Message: fmt.Sprintf("Rol de '%s': %s → %s", req.TargetUser, old, req.Role)}
}

func (s *server) adminListUsers(req api.Request) api.Response {
	_, _, ok := s.requireRole(req.Token, api.RoleAdmin)
	if !ok {
		return api.Response{Success: false, Message: "Acceso denegado: se requiere rol admin"}
	}
	keys, err := s.db.ListKeys("auth")
	if err != nil && !errors.Is(err, store.ErrNamespaceNotFound) {
		return api.Response{Success: false, Message: "Error al listar usuarios"}
	}
	result := fmt.Sprintf("Usuarios (%s):\n\n", s.mode)
	for _, k := range keys {
		e, err := s.getAuth(string(k))
		if err != nil {
			continue
		}
		extra := ""
		if e.HospitalName != "" {
			extra += fmt.Sprintf(" (%s)", e.HospitalName)
		}
		if e.isLocked() {
			extra += fmt.Sprintf(" 🔒 BLOQUEADA hasta %s", e.LockedUntil.Format("15:04:05"))
		} else if e.FailedLogins > 0 {
			extra += fmt.Sprintf(" ⚠ %d intento(s) fallido(s)", e.FailedLogins)
		}
		if e.ConsentRevoked {
			extra += " [sin consentimiento]"
		}
		if e.DeleteRequested {
			extra += " ⚠ solicita eliminación"
		}
		if e.MustChangePass {
			extra += " [debe cambiar contraseña]"
		}
		result += fmt.Sprintf("  %-20s  %-14s%s\n", string(k), e.Role, extra)
	}
	return api.Response{Success: true, Data: result}
}

func (s *server) adminUnlockUser(req api.Request) api.Response {
	caller, _, ok := s.requireRole(req.Token, api.RoleAdmin)
	if !ok {
		return api.Response{Success: false, Message: "Acceso denegado: se requiere rol admin"}
	}
	if req.TargetUser == "" {
		return api.Response{Success: false, Message: "Falta el usuario a desbloquear"}
	}
	e, err := s.getAuth(req.TargetUser)
	if err != nil {
		return api.Response{Success: false, Message: "Usuario no encontrado"}
	}
	e.FailedLogins = 0
	e.LockedUntil = time.Time{}
	s.saveAuth(req.TargetUser, e)
	s.secuLog.Printf("ADMIN_DESBLOQUEA admin='%s' usuario='%s'", caller, req.TargetUser)
	return api.Response{Success: true, Message: fmt.Sprintf("Cuenta '%s' desbloqueada", req.TargetUser)}
}

func (s *server) adminSetMinAnon(req api.Request) api.Response {
	_, _, ok := s.requireRole(req.Token, api.RoleAdmin)
	if !ok {
		return api.Response{Success: false, Message: "Acceso denegado: se requiere rol admin"}
	}
	if req.MinAnon < 1 {
		return api.Response{Success: false, Message: "El mínimo debe ser al menos 1"}
	}
	old := s.minAnon
	s.minAnon = req.MinAnon
	s.secuLog.Printf("MIN_ANON cambiado de %d a %d", old, s.minAnon)
	return api.Response{Success: true, Message: fmt.Sprintf("Mínimo de registros para estadísticas: %d → %d", old, s.minAnon)}
}

func (s *server) adminAuthorizeRequest(req api.Request) api.Response {
	caller, _, ok := s.requireRole(req.Token, api.RoleAdmin)
	if !ok {
		return api.Response{Success: false, Message: "Acceso denegado: se requiere rol admin"}
	}
	if req.QueryID == "" {
		return api.Response{Success: false, Message: "Falta el ID de la petición"}
	}
	e, err := s.getAuth(req.QueryID)
	if err == nil && e.DeleteRequested {
		s.db.Delete("auth", []byte(req.QueryID))
		s.db.Delete("userdata", []byte(req.QueryID))
		s.secuLog.Printf("ADMIN_APRUEBA_ELIMINACION admin='%s' usuario='%s'", caller, req.QueryID)
		return api.Response{Success: true, Message: fmt.Sprintf("Usuario '%s' eliminado por solicitud propia", req.QueryID)}
	}
	raw, err := s.db.Get("queries", []byte(req.QueryID))
	if err != nil {
		return api.Response{Success: false, Message: "Petición no encontrada"}
	}
	var qr api.QueryRequest
	json.Unmarshal(raw, &qr)
	if req.Data == "aprobar" {
		qr.Estado = api.QueryApproved
	} else {
		qr.Estado = api.QueryDenied
	}
	data, _ := json.Marshal(qr)
	s.db.Put("queries", []byte(req.QueryID), data)
	s.secuLog.Printf("ADMIN_AUTORIZA admin='%s' queryID='%s' accion='%s'", caller, req.QueryID, req.Data)
	return api.Response{Success: true, Message: fmt.Sprintf("Consulta '%s' → %s", req.QueryID, qr.Estado)}
}

func (s *server) adminListQueries(req api.Request) api.Response {
	_, _, ok := s.requireRole(req.Token, api.RoleAdmin)
	if !ok {
		return api.Response{Success: false, Message: "Acceso denegado: se requiere rol admin"}
	}
	keys, err := s.db.ListKeys("queries")
	if err != nil && !errors.Is(err, store.ErrNamespaceNotFound) {
		return api.Response{Success: false, Message: "Error al listar consultas"}
	}
	if len(keys) == 0 {
		return api.Response{Success: true, Data: "No hay consultas registradas."}
	}
	filter := req.Data
	result := "Consultas de investigadores:\n\n"
	count := 0
	for _, k := range keys {
		raw, _ := s.db.Get("queries", k)
		var qr api.QueryRequest
		json.Unmarshal(raw, &qr)
		if filter != "" && qr.Estado != filter {
			continue
		}
		count++
		filtroInfo := ""
		if qr.Filtros.Diagnostico != "" || qr.Filtros.Sexo != "" || qr.Filtros.EdadMin > 0 || qr.Filtros.EdadMax > 0 {
			filtroInfo = fmt.Sprintf("\n    Filtros: diag='%s' sexo='%s' edad=[%d-%d]",
				qr.Filtros.Diagnostico, qr.Filtros.Sexo, qr.Filtros.EdadMin, qr.Filtros.EdadMax)
		}
		result += fmt.Sprintf("  ID: %s  |  Investigador: %s  |  Estado: %s\n  Descripción: %s%s\n\n",
			qr.ID, qr.Investigador, qr.Estado, qr.Descripcion, filtroInfo)
	}
	if count == 0 {
		return api.Response{Success: true, Data: "No hay consultas en ese estado."}
	}
	return api.Response{Success: true, Data: result}
}

// ── Hospital: DB local ────────────────────────────────────────────────────────

func (s *server) fetchData(req api.Request) api.Response {
	u, _, _, valid := s.validateJWT(req.Token)
	if !valid || u != req.Username {
		return api.Response{Success: false, Message: "Sesión inválida"}
	}
	raw, err := s.db.Get("userdata", []byte(req.Username))
	if err != nil {
		return api.Response{Success: false, Message: "Error al obtener datos"}
	}
	return api.Response{Success: true, Data: string(raw)}
}

func (s *server) medicoSaveLocal(req api.Request) api.Response {
	hospital, role, _, valid := s.validateJWT(req.Token)
	if !valid || role != api.RoleMedico {
		return api.Response{Success: false, Message: "Sesión inválida o rol incorrecto"}
	}
	if req.PatientID == "" || req.Data == "" {
		return api.Response{Success: false, Message: "Faltan datos o ID de paciente"}
	}
	if _, err := api.ParseClinicalXML(req.Data); err != nil {
		return api.Response{Success: false, Message: "XML clínico inválido: " + err.Error()}
	}
	label := s.hospitalLabel(hospital)
	key := fmt.Sprintf("%s|%s", hospital, req.PatientID)

	// Guardar versión actual en el historial antes de sobrescribir
	existing, err := s.db.Get("patients", []byte(key))
	if err == nil && len(existing) > 0 {
		// Recuperar historial previo o crear uno nuevo
		histKey := fmt.Sprintf("history|%s|%s", hospital, req.PatientID)
		var versions []patientRecord
		if raw, err := s.db.Get("history", []byte(histKey)); err == nil {
			json.Unmarshal(raw, &versions)
		}
		// Añadir la versión actual al historial
		versions = append(versions, patientRecord{
			Data:      string(existing),
			Timestamp: time.Now(),
			Author:    hospital,
		})
		// Mantener máximo 10 versiones
		if len(versions) > 10 {
			versions = versions[len(versions)-10:]
		}
		histData, _ := json.Marshal(versions)
		s.db.Put("history", []byte(histKey), histData)
	}

	if err := s.db.Put("patients", []byte(key), []byte(req.Data)); err != nil {
		return api.Response{Success: false, Message: "Error al guardar en DB local"}
	}
	s.secuLog.Printf("LOCAL_GUARDA hospital='%s' paciente='%s'", label, req.PatientID)
	return api.Response{Success: true, Message: fmt.Sprintf("Registro de '%s' guardado en DB local", req.PatientID)}
}

func (s *server) medicoImport(req api.Request) api.Response {
	hospital, role, _, valid := s.validateJWT(req.Token)
	if !valid || role != api.RoleMedico {
		return api.Response{Success: false, Message: "Sesión inválida o rol incorrecto"}
	}
	label := s.hospitalLabel(hospital)

	if req.PatientID != "" {
		key := fmt.Sprintf("%s|%s", hospital, req.PatientID)
		raw, err := s.db.Get("patients", []byte(key))
		if err != nil || len(raw) == 0 {
			return api.Response{Success: false, Message: fmt.Sprintf("Paciente '%s' no encontrado en este hospital", req.PatientID)}
		}
		return api.Response{Success: true, Data: string(raw)}
	}

	prefix := []byte(hospital + "|")
	keys, err := s.db.KeysByPrefix("patients", prefix)
	if err != nil || len(keys) == 0 {
		return api.Response{Success: true, Data: fmt.Sprintf("'%s' no tiene pacientes registrados.", label)}
	}
	result := fmt.Sprintf("Pacientes de '%s' (%d registros):\n\n", label, len(keys))
	for _, k := range keys {
		pid := string(k[len(prefix):])
		raw, _ := s.db.Get("patients", k)
		result += fmt.Sprintf("── Paciente: %s ──\n%s\n\n", pid, string(raw))
	}
	return api.Response{Success: true, Data: result}
}

func (s *server) medicoUpload(req api.Request) api.Response {
	hospital, role, _, valid := s.validateJWT(req.Token)
	if !valid || role != api.RoleMedico {
		return api.Response{Success: false, Message: "Sesión inválida o rol incorrecto"}
	}
	label := s.hospitalLabel(hospital)
	serverURL := req.ServerURL
	if serverURL == "" {
		serverURL = "https://localhost:8443/api"
	}

	prefix := []byte(hospital + "|")
	var keysToUpload [][]byte
	if req.PatientID != "" {
		keysToUpload = [][]byte{[]byte(fmt.Sprintf("%s|%s", hospital, req.PatientID))}
	} else {
		var err error
		keysToUpload, err = s.db.KeysByPrefix("patients", prefix)
		if err != nil || len(keysToUpload) == 0 {
			return api.Response{Success: false, Message: "No hay registros que subir"}
		}
	}

	httpClient := &http.Client{
		Timeout:   10 * time.Second,
		Transport: &http.Transport{TLSClientConfig: tlsSkipVerify},
	}

	ok, fail, dupes := 0, 0, 0
	for _, k := range keysToUpload {
		raw, err := s.db.Get("patients", k)
		if err != nil {
			fail++
			continue
		}

		// Extraer el ID del paciente de la clave (hospital|patientID)
		keyStr := string(k)
		sep := strings.Index(keyStr, "|")
		patientID := ""
		if sep >= 0 {
			patientID = keyStr[sep+1:]
		}

		// Parsear el XML y añadir el IDHash antes de subir
		rec, err := api.ParseClinicalXML(string(raw))
		if err != nil {
			fail++
			continue
		}
		if patientID != "" {
			rec.IDHash = hashPatientID(patientID)
		}
		xmlConHash, err := rec.ToXML()
		if err != nil {
			fail++
			continue
		}

		// Firmar el contenido con HMAC para garantizar integridad en tránsito
		sig := SignData(xmlConHash)

		body, _ := json.Marshal(api.Request{
			Action:  api.ActionReceiveAnonData,
			Token:   req.Token,
			Data:    xmlConHash,
			DataSig: sig,
		})
		resp, err := httpClient.Post(serverURL, "application/json", bytes.NewBuffer(body))
		if err != nil {
			fail++
			s.secuLog.Printf("UPLOAD_ERROR hospital='%s' err='%v'", label, err)
			continue
		}
		var res api.Response
		json.NewDecoder(resp.Body).Decode(&res)
		resp.Body.Close()

		if !res.Success && strings.Contains(res.Message, "duplicado") {
			dupes++
		} else if res.Success {
			ok++
		} else {
			fail++
		}
	}

	s.secuLog.Printf("UPLOAD hospital='%s' ok=%d fail=%d dupes=%d", label, ok, fail, dupes)
	msg := fmt.Sprintf("%d/%d registros subidos al servidor central de forma anónima", ok, len(keysToUpload))
	if dupes > 0 {
		msg += fmt.Sprintf(" (%d duplicados omitidos)", dupes)
	}
	if fail > 0 {
		msg += fmt.Sprintf(" (%d errores)", fail)
	}
	return api.Response{Success: ok > 0 || dupes > 0, Message: msg}
}

// ── Servidor central ──────────────────────────────────────────────────────────

func (s *server) receiveAnonData(req api.Request) api.Response {
	_, role, _, valid := s.validateJWT(req.Token)
	if !valid || role != api.RoleMedico {
		return api.Response{Success: false, Message: "Acceso denegado"}
	}

	// 1. Verificar firma HMAC — garantiza integridad del dato en tránsito
	if req.DataSig != "" && !VerifyDataSig(req.Data, req.DataSig) {
		s.secuLog.Printf("INTEGRIDAD_FALLIDA: firma HMAC incorrecta")
		return api.Response{Success: false, Message: "Error de integridad: la firma del dato no coincide"}
	}

	rec, err := api.ParseClinicalXML(req.Data)
	if err != nil {
		return api.Response{Success: false, Message: "XML clínico inválido: " + err.Error()}
	}

	// 2. Deduplicación por IDHash — si ya existe un registro con ese hash, lo rechazamos
	if rec.IDHash != "" {
		existingKeys, _ := s.db.ListKeys("data_space")
		for _, k := range existingKeys {
			raw, err := s.db.Get("data_space", k)
			if err != nil {
				continue
			}
			existing, err := api.ParseClinicalXML(string(raw))
			if err != nil {
				continue
			}
			if existing.IDHash == rec.IDHash {
				s.secuLog.Printf("DATA_SPACE_DUPLICADO idHash='%s'", rec.IDHash)
				return api.Response{Success: false, Message: fmt.Sprintf("duplicado: ya existe un registro con IDHash '%s'", rec.IDHash)}
			}
		}
	}

	// 3. Almacenar con clave aleatoria — el IDHash no permite recuperar el ID original
	id := make([]byte, 16)
	rand.Read(id)
	anonID := fmt.Sprintf("%x", id)
	if err := s.db.Put("data_space", []byte(anonID), []byte(req.Data)); err != nil {
		return api.Response{Success: false, Message: "Error al guardar en Data Space"}
	}
	s.secuLog.Printf("DATA_SPACE_RECIBE anonID='%s' idHash='%s' firma=%v",
		anonID, rec.IDHash, req.DataSig != "")
	return api.Response{Success: true}
}

// queryDataSpace ejecuta una consulta con filtros opcionales sobre el Data Space.
// Respeta el mínimo de registros para proteger el anonimato.
func (s *server) queryDataSpace(req api.Request) api.Response {
	username, role, _, valid := s.validateJWT(req.Token)
	if !valid {
		return api.Response{Success: false, Message: "Sesión inválida"}
	}
	if role != api.RoleInvestigador && role != api.RoleAdmin {
		return api.Response{Success: false, Message: "Acceso denegado: se requiere rol investigador"}
	}

	var qr api.QueryRequest
	if role == api.RoleInvestigador {
		if req.QueryID == "" {
			return api.Response{Success: false, Message: "Debes indicar el ID de tu consulta aprobada"}
		}
		raw, err := s.db.Get("queries", []byte(req.QueryID))
		if err != nil {
			return api.Response{Success: false, Message: "Consulta no encontrada"}
		}
		json.Unmarshal(raw, &qr)
		if qr.Investigador != username {
			return api.Response{Success: false, Message: "Esta consulta no es tuya"}
		}
		if qr.Estado != api.QueryApproved {
			return api.Response{Success: false, Message: fmt.Sprintf("Consulta en estado '%s', aún no aprobada", qr.Estado)}
		}
		// Usar los filtros de la consulta aprobada
		req.Filtros = qr.Filtros
	}

	keys, err := s.db.ListKeys("data_space")
	if err != nil && !errors.Is(err, store.ErrNamespaceNotFound) {
		return api.Response{Success: false, Message: "Error al leer el Data Space"}
	}

	// Aplicar filtros y recoger registros
	var records []api.ClinicalRecord
	for _, k := range keys {
		raw, err := s.db.Get("data_space", k)
		if err != nil {
			continue
		}
		rec, err := api.ParseClinicalXML(string(raw))
		if err != nil {
			continue
		}
		if !matchesFilter(rec, req.Filtros) {
			continue
		}
		records = append(records, rec)
	}

	total := len(records)
	s.secuLog.Printf("CONSULTA_SPACE usuario='%s' total_filtrado=%d minAnon=%d", username, total, s.minAnon)

	// Protección de anonimato
	if total < s.minAnon {
		return api.Response{
			Success: false,
			Message: fmt.Sprintf(
				"Protección de anonimato: hay %d registro(s) que cumplen el filtro, pero se necesitan al menos %d para mostrar resultados.",
				total, s.minAnon),
		}
	}

	result := buildQueryResult(records, req.Filtros, total)

	// Guardar resultado en la consulta del investigador
	if role == api.RoleInvestigador && req.QueryID != "" {
		qr.Resultado = result
		data, _ := json.Marshal(qr)
		s.db.Put("queries", []byte(req.QueryID), data)
	}

	return api.Response{Success: true, Data: result}
}

// matchesFilter comprueba si un registro cumple los filtros indicados.
func matchesFilter(rec api.ClinicalRecord, f api.QueryFilter) bool {
	if f.Diagnostico != "" && !strings.EqualFold(rec.Diagnostico, f.Diagnostico) {
		return false
	}
	if f.Sexo != "" && rec.Sexo != f.Sexo {
		return false
	}
	if f.EdadMin > 0 && rec.Edad < f.EdadMin {
		return false
	}
	if f.EdadMax > 0 && rec.Edad > f.EdadMax {
		return false
	}
	return true
}

// buildQueryResult construye el informe de resultados con estadísticas y registros individuales.
func buildQueryResult(records []api.ClinicalRecord, f api.QueryFilter, total int) string {
	// Estadísticas agregadas
	diagCount := make(map[string]int)
	sexoCount := make(map[string]int)
	rangoEdad := map[string]int{
		"0-17":   0,
		"18-34":  0,
		"35-54":  0,
		"55-74":  0,
		"75+":    0,
	}

	for _, rec := range records {
		diagCount[rec.Diagnostico]++
		sexoCount[rec.Sexo]++
		switch {
		case rec.Edad <= 17:
			rangoEdad["0-17"]++
		case rec.Edad <= 34:
			rangoEdad["18-34"]++
		case rec.Edad <= 54:
			rangoEdad["35-54"]++
		case rec.Edad <= 74:
			rangoEdad["55-74"]++
		default:
			rangoEdad["75+"]++
		}
	}

	var sb strings.Builder
	sb.WriteString(fmt.Sprintf("━━━ RESULTADO DEL DATA SPACE (%d registros anónimos) ━━━\n", total))

	// Filtros activos
	if f.Diagnostico != "" || f.Sexo != "" || f.EdadMin > 0 || f.EdadMax > 0 {
		sb.WriteString("\nFiltros aplicados:\n")
		if f.Diagnostico != "" {
			sb.WriteString(fmt.Sprintf("  Diagnóstico : %s\n", f.Diagnostico))
		}
		if f.Sexo != "" {
			sb.WriteString(fmt.Sprintf("  Sexo        : %s\n", f.Sexo))
		}
		if f.EdadMin > 0 || f.EdadMax > 0 {
			sb.WriteString(fmt.Sprintf("  Rango edad  : %d - %d\n", f.EdadMin, f.EdadMax))
		}
	}

	// Por diagnóstico
	sb.WriteString("\nPor diagnóstico:\n")
	for diag, count := range diagCount {
		pct := float64(count) / float64(total) * 100
		sb.WriteString(fmt.Sprintf("  %-30s %d casos (%.1f%%)\n", diag, count, pct))
	}

	// Por sexo
	sb.WriteString("\nPor sexo:\n")
	for sexo, count := range sexoCount {
		label := map[string]string{"M": "Masculino", "F": "Femenino"}[sexo]
		pct := float64(count) / float64(total) * 100
		sb.WriteString(fmt.Sprintf("  %-12s %d casos (%.1f%%)\n", label, count, pct))
	}

	// Por rango de edad
	sb.WriteString("\nPor rango de edad:\n")
	for _, rango := range []string{"0-17", "18-34", "35-54", "55-74", "75+"} {
		count := rangoEdad[rango]
		if total > 0 {
			pct := float64(count) / float64(total) * 100
			sb.WriteString(fmt.Sprintf("  %-8s %d casos (%.1f%%)\n", rango, count, pct))
		}
	}

	// Registros individuales anónimos
	sb.WriteString(fmt.Sprintf("\nRegistros individuales (%d):\n", total))
	for i, rec := range records {
		sb.WriteString(fmt.Sprintf("\n── #%d ──\n", i+1))
		sb.WriteString(fmt.Sprintf("  Edad: %d | Sexo: %s | Diagnóstico: %s\n", rec.Edad, rec.Sexo, rec.Diagnostico))
		if rec.Notas != "" {
			sb.WriteString(fmt.Sprintf("  Notas: %s\n", rec.Notas))
		}
	}

	return sb.String()
}

func (s *server) exportQuery(req api.Request) api.Response {
	username, role, _, valid := s.validateJWT(req.Token)
	if !valid || role != api.RoleInvestigador {
		return api.Response{Success: false, Message: "Sesión inválida o rol insuficiente"}
	}
	raw, err := s.db.Get("queries", []byte(req.QueryID))
	if err != nil {
		return api.Response{Success: false, Message: "Consulta no encontrada"}
	}
	var qr api.QueryRequest
	json.Unmarshal(raw, &qr)
	if qr.Investigador != username || qr.Estado != api.QueryApproved || qr.Resultado == "" {
		return api.Response{Success: false, Message: "La consulta no tiene resultados exportables aún"}
	}
	s.secuLog.Printf("EXPORTA_CONSULTA usuario='%s' queryID='%s'", username, req.QueryID)
	return api.Response{Success: true, Data: qr.Resultado}
}

func (s *server) requestQuery(req api.Request) api.Response {
	username, role, _, valid := s.validateJWT(req.Token)
	if !valid || role != api.RoleInvestigador {
		return api.Response{Success: false, Message: "Sesión inválida o rol incorrecto"}
	}
	if req.Data == "" {
		return api.Response{Success: false, Message: "Debes describir la consulta"}
	}
	id := make([]byte, 8)
	rand.Read(id)
	qid := fmt.Sprintf("%x", id)
	qr := api.QueryRequest{
		ID: qid, Investigador: username,
		Descripcion: req.Data, Estado: api.QueryPending,
		Filtros: req.Filtros,
	}
	data, _ := json.Marshal(qr)
	s.db.Put("queries", []byte(qid), data)
	s.secuLog.Printf("PETICION_CONSULTA investigador='%s' queryID='%s'", username, qid)
	return api.Response{Success: true, Message: fmt.Sprintf("Petición enviada. ID de consulta: %s", qid)}
}

func (s *server) listMyQueries(req api.Request) api.Response {
	username, role, _, valid := s.validateJWT(req.Token)
	if !valid || role != api.RoleInvestigador {
		return api.Response{Success: false, Message: "Sesión inválida o rol incorrecto"}
	}
	keys, err := s.db.ListKeys("queries")
	if err != nil && !errors.Is(err, store.ErrNamespaceNotFound) {
		return api.Response{Success: false, Message: "Error al listar consultas"}
	}
	filter := req.Data
	result := ""
	count := 0
	for _, k := range keys {
		raw, _ := s.db.Get("queries", k)
		var qr api.QueryRequest
		json.Unmarshal(raw, &qr)
		if qr.Investigador != username || (filter != "" && qr.Estado != filter) {
			continue
		}
		count++
		result += fmt.Sprintf("ID: %s  |  Estado: %-10s  |  %s\n", qr.ID, qr.Estado, qr.Descripcion)
	}
	if count == 0 {
		return api.Response{Success: true, Data: "No tienes consultas en este estado."}
	}
	return api.Response{Success: true, Data: result}
}

// medicoGetHistory devuelve el historial de versiones anteriores de un paciente.
func (s *server) medicoGetHistory(req api.Request) api.Response {
	hospital, role, _, valid := s.validateJWT(req.Token)
	if !valid || role != api.RoleMedico {
		return api.Response{Success: false, Message: "Sesión inválida o rol incorrecto"}
	}
	if req.PatientID == "" {
		return api.Response{Success: false, Message: "Falta el ID del paciente"}
	}
	label := s.hospitalLabel(hospital)
	histKey := fmt.Sprintf("history|%s|%s", hospital, req.PatientID)
	raw, err := s.db.Get("history", []byte(histKey))
	if err != nil || len(raw) == 0 {
		return api.Response{Success: true, Data: fmt.Sprintf("No hay versiones anteriores del paciente '%s'.", req.PatientID)}
	}
	var versions []patientRecord
	if err := json.Unmarshal(raw, &versions); err != nil {
		return api.Response{Success: false, Message: "Error al leer historial"}
	}
	result := fmt.Sprintf("Historial de '%s' en '%s' (%d versiones anteriores):\n\n", req.PatientID, label, len(versions))
	for i, v := range versions {
		result += fmt.Sprintf("── Versión %d — %s (autor: %s) ──\n%s\n\n",
			i+1, v.Timestamp.Format("02/01/2006 15:04:05"), v.Author, v.Data)
	}
	s.secuLog.Printf("HISTORIAL_CONSULTADO hospital='%s' paciente='%s' versiones=%d", label, req.PatientID, len(versions))
	return api.Response{Success: true, Data: result}
}

// getNotifications devuelve alertas pendientes adaptadas al rol del usuario.
// Permite al cliente mostrar avisos en el menú sin hacer múltiples peticiones.
func (s *server) getNotifications(req api.Request) api.Response {
	username, role, _, valid := s.validateJWT(req.Token)
	if !valid {
		return api.Response{Success: false, Message: "Sesión inválida"}
	}

	var alerts []string

	switch role {
	case api.RoleAdmin:
		// Cuentas bloqueadas
		keys, _ := s.db.ListKeys("auth")
		blocked := 0
		deletions := 0
		for _, k := range keys {
			e, err := s.getAuth(string(k))
			if err != nil {
				continue
			}
			if e.isLocked() {
				blocked++
			}
			if e.DeleteRequested {
				deletions++
			}
		}
		if blocked > 0 {
			alerts = append(alerts, fmt.Sprintf("🔒 %d cuenta(s) bloqueada(s) esperan desbloqueo", blocked))
		}
		if deletions > 0 {
			alerts = append(alerts, fmt.Sprintf("🗑  %d solicitud(es) de eliminación pendientes", deletions))
		}
		// Consultas pendientes (solo en servidor central)
		if s.mode == api.ModeServer {
			qkeys, _ := s.db.ListKeys("queries")
			pending := 0
			for _, k := range qkeys {
				raw, err := s.db.Get("queries", k)
				if err != nil {
					continue
				}
				var qr api.QueryRequest
				json.Unmarshal(raw, &qr)
				if qr.Estado == api.QueryPending {
					pending++
				}
			}
			if pending > 0 {
				alerts = append(alerts, fmt.Sprintf("📋 %d consulta(s) de investigadores pendientes de revisión", pending))
			}
		}

	case api.RoleInvestigador:
		// Consultas aprobadas no ejecutadas (sin resultado)
		qkeys, _ := s.db.ListKeys("queries")
		ready := 0
		for _, k := range qkeys {
			raw, err := s.db.Get("queries", k)
			if err != nil {
				continue
			}
			var qr api.QueryRequest
			json.Unmarshal(raw, &qr)
			if qr.Investigador == username && qr.Estado == api.QueryApproved && qr.Resultado == "" {
				ready++
			}
		}
		if ready > 0 {
			alerts = append(alerts, fmt.Sprintf("✅ %d consulta(s) aprobadas listas para ejecutar", ready))
		}

	case api.RoleMedico:
		// Contar pacientes en DB local
		hospital := username
		prefix := []byte(hospital + "|")
		pkeys, _ := s.db.KeysByPrefix("patients", prefix)
		if len(pkeys) > 0 {
			alerts = append(alerts, fmt.Sprintf("👥 %d paciente(s) en la base de datos local", len(pkeys)))
		}
	}

	if len(alerts) == 0 {
		return api.Response{Success: true, Data: ""}
	}
	return api.Response{Success: true, Data: strings.Join(alerts, "\n")}
}

// ── Paciente ──────────────────────────────────────────────────────────────────

func (s *server) revokeConsent(req api.Request) api.Response {
	u, role, _, valid := s.validateJWT(req.Token)
	if !valid || role != api.RolePaciente {
		return api.Response{Success: false, Message: "Sesión inválida o rol incorrecto"}
	}
	e, err := s.getAuth(u)
	if err != nil {
		return api.Response{Success: false, Message: "Usuario no encontrado"}
	}
	e.ConsentRevoked = true
	s.saveAuth(u, e)
	s.secuLog.Printf("REVOCA_CONSENTIMIENTO usuario='%s'", u)
	return api.Response{Success: true, Message: "Consentimiento revocado."}
}

func (s *server) requestDeletion(req api.Request) api.Response {
	u, role, _, valid := s.validateJWT(req.Token)
	if !valid || role != api.RolePaciente {
		return api.Response{Success: false, Message: "Sesión inválida o rol incorrecto"}
	}
	e, err := s.getAuth(u)
	if err != nil {
		return api.Response{Success: false, Message: "Usuario no encontrado"}
	}
	e.DeleteRequested = true
	s.saveAuth(u, e)
	s.secuLog.Printf("SOLICITA_ELIMINACION usuario='%s'", u)
	return api.Response{Success: true, Message: "Solicitud de eliminación enviada al administrador."}
}
