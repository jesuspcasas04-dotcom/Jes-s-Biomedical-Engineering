package api

import (
	"encoding/xml"
	"fmt"
)

// ── Acciones ──────────────────────────────────────────────────────────────────
const (
	ActionRegister       = "register"
	ActionLogin          = "login"
	ActionLoginVerify2FA = "loginVerify2FA" // Segunda fase del login (código 2FA)
	ActionFetchData      = "fetchData"
	ActionUpdateData     = "updateData"
	ActionLogout         = "logout"
	ActionChangePassword = "changePassword"
	ActionRefreshToken   = "refreshToken"

	// Administrador
	ActionAdminCreateUser  = "adminCreateUser"
	ActionAdminDeleteUser  = "adminDeleteUser"
	ActionAdminChangeRole  = "adminChangeRole"
	ActionAdminListUsers   = "adminListUsers"
	ActionAdminAuthorize   = "adminAuthorizeRequest"
	ActionAdminListQueries = "adminListQueries"
	ActionAdminUnlockUser  = "adminUnlockUser"  // Desbloquear cuenta
	ActionAdminSetMinAnon  = "adminSetMinAnon"  // Configurar mínimo de registros para anonimato

	// Paciente
	ActionRevokeConsent   = "revokeConsent"
	ActionRequestDeletion = "requestDeletion"

	// Médico / Hospital (DB local)
	ActionMedicoSaveLocal = "medicoSaveLocal"
	ActionMedicoImport    = "medicoImport"
	ActionMedicoUpload    = "medicoUpload"

	// Servidor central
	ActionReceiveAnonData = "receiveAnonData"

	// Notificaciones y estado del sistema
	ActionGetNotifications  = "getNotifications"   // Alertas pendientes por rol

	// Historial de versiones de registros clínicos
	ActionMedicoGetHistory  = "medicoGetHistory"   // Ver versiones anteriores de un paciente

	// Investigador
	ActionRequestQuery  = "requestQuery"
	ActionListMyQueries = "listMyQueries"
	ActionQuerySpace    = "queryDataSpace"
	ActionExportQuery   = "exportQuery"
)

// ── Roles ─────────────────────────────────────────────────────────────────────
const (
	RoleAdmin        = "admin"
	RolePaciente     = "paciente"
	RoleMedico       = "medico"
	RoleInvestigador = "investigador"
)

// ── Estados de consulta ───────────────────────────────────────────────────────
const (
	QueryPending  = "pendiente"
	QueryApproved = "aprobada"
	QueryDenied   = "denegada"
)

// ── Modos ─────────────────────────────────────────────────────────────────────
const (
	ModeServer   = "server"
	ModeHospital = "hospital"
)

// ── ClinicalRecord ────────────────────────────────────────────────────────────
// IDHash es el SHA-256 del identificador original del paciente, calculado
// en el hospital antes de eliminar el ID real. Permite al servidor central
// detectar duplicados sin conocer la identidad del paciente.
type ClinicalRecord struct {
	XMLName     xml.Name `xml:"RegistroClinico" json:"-"`
	Edad        int      `xml:"Edad"            json:"edad"`
	Sexo        string   `xml:"Sexo"            json:"sexo"`
	Diagnostico string   `xml:"Diagnostico"     json:"diagnostico"`
	Notas       string   `xml:"Notas,omitempty" json:"notas,omitempty"`
	IDHash      string   `xml:"IDHash,omitempty" json:"id_hash,omitempty"` // SHA-256 del ID original
}

func (r ClinicalRecord) Validate() error {
	if r.Edad < 0 || r.Edad > 130 {
		return fmt.Errorf("edad inválida: %d", r.Edad)
	}
	if r.Sexo != "M" && r.Sexo != "F" {
		return fmt.Errorf("sexo inválido: debe ser M o F")
	}
	if r.Diagnostico == "" {
		return fmt.Errorf("el diagnóstico no puede estar vacío")
	}
	return nil
}

func (r ClinicalRecord) ToXML() (string, error) {
	if err := r.Validate(); err != nil {
		return "", err
	}
	b, err := xml.MarshalIndent(r, "", "  ")
	if err != nil {
		return "", err
	}
	return xml.Header + string(b), nil
}

func ParseClinicalXML(data string) (ClinicalRecord, error) {
	var rec ClinicalRecord
	if err := xml.Unmarshal([]byte(data), &rec); err != nil {
		return rec, err
	}
	return rec, rec.Validate()
}

// ── QueryRequest ──────────────────────────────────────────────────────────────
type QueryRequest struct {
	ID           string      `json:"id"`
	Investigador string      `json:"investigador"`
	Descripcion  string      `json:"descripcion"`
	Estado       string      `json:"estado"`
	Filtros      QueryFilter `json:"filtros,omitempty"`
	Resultado    string      `json:"resultado,omitempty"`
}

// QueryFilter permite al investigador acotar su consulta al Data Space.
type QueryFilter struct {
	Diagnostico string `json:"diagnostico,omitempty"` // vacío = todos
	Sexo        string `json:"sexo,omitempty"`        // "M", "F" o vacío = todos
	EdadMin     int    `json:"edad_min,omitempty"`    // 0 = sin límite inferior
	EdadMax     int    `json:"edad_max,omitempty"`    // 0 = sin límite superior
}

// DataSpaceStats contiene estadísticas agregadas del Data Space.
type DataSpaceStats struct {
	Total           int            `json:"total"`
	PorDiagnostico  map[string]int `json:"por_diagnostico"`
	PorSexo         map[string]int `json:"por_sexo"`
	PorRangoEdad    map[string]int `json:"por_rango_edad"`
}

// ── Request / Response ────────────────────────────────────────────────────────
type Request struct {
	Action       string      `json:"action"`
	Username     string      `json:"username"`
	Password     string      `json:"password,omitempty"`
	NewPassword  string      `json:"new_password,omitempty"`
	Token        string      `json:"token,omitempty"`
	TempToken    string      `json:"temp_token,omitempty"`
	Code2FA      string      `json:"code_2fa,omitempty"`
	Data         string      `json:"data,omitempty"`
	DataSig      string      `json:"data_sig,omitempty"` // HMAC-SHA256 del campo Data (integridad)
	Role         string      `json:"role,omitempty"`
	HospitalName string      `json:"hospital_name,omitempty"`
	TargetUser   string      `json:"target_user,omitempty"`
	QueryID      string      `json:"query_id,omitempty"`
	PatientID    string      `json:"patient_id,omitempty"`
	ServerURL    string      `json:"server_url,omitempty"`
	Filtros      QueryFilter `json:"filtros,omitempty"`
	MinAnon      int         `json:"min_anon,omitempty"`
}

type Response struct {
	Success        bool   `json:"success"`
	Message        string `json:"message"`
	Token          string `json:"token,omitempty"`
	TempToken      string `json:"temp_token,omitempty"` // Token temporal pendiente de 2FA
	Data           string `json:"data,omitempty"`
	Role           string `json:"role,omitempty"`
	HospitalName   string `json:"hospital_name,omitempty"`
	MustChangePass bool   `json:"must_change_pass,omitempty"`
	TokenExpiresIn int64  `json:"token_expires_in,omitempty"`
	Needs2FA       bool   `json:"needs_2fa,omitempty"` // El cliente debe pedir el código
}
