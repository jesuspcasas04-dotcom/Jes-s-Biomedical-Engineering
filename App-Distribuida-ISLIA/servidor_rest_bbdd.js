var express = require("express");
var app = express();
var cors = require("cors");
var path = require("path");
var mysql = require("mysql");

app.use(cors());
app.use(express.json());

// --- CONFIGURACIÓN DE RUTAS ESTÁTICAS ---
// Asumo que tus archivos (index.html, mainPaciente.js, etc.) 
// están en una carpeta llamada "cliente"
app.use("/app", express.static(path.join(__dirname, "clientePaciente")));

// Redirigir raíz a la app
app.get("/", (req, res) => res.redirect("/app/"));

// --- CONFIGURACIÓN DE BASE DE DATOS (XAMPP) ---
var database = {
    host: "127.0.0.1",
    user: "root",
    password: "",
    database: "rvuci_v2",
    port: 3306
};

var conexion = mysql.createConnection(database);

console.log("Conectando con la base de datos rvuci...");
conexion.connect(function(err) {
    if (err) {
        console.log("Error al conectar a rvuci:", err);
        process.exit();
    } else {
        console.log("Base de datos rvuci conectada correctamente!!!");
    }
});

// --- API REST: PACIENTES ---

// Obtener todos los pacientes (para la tabla de 'Continuar Paciente')
app.get("/api/pacientes", function(req, res) {
    var sql = "SELECT * FROM pacientes ORDER BY fecha_registro DESC";
    conexion.query(sql, function(err, resultados) {
        if (err) return res.status(500).json({ error: "Error al obtener pacientes" });
        res.json(resultados);
    });
});

// Registrar nuevo paciente
app.post("/api/pacientes", function(req, res) {
    var nombre_id = req.body.nombre_id;
    // Usamos INSERT IGNORE o una lógica similar para evitar duplicados si fuera necesario
    var sql = "INSERT INTO pacientes (nombre_id) VALUES (?)";
    conexion.query(sql, [nombre_id], function(err, resultado) {
        if (err) {
            // Si el paciente ya existe, buscamos su ID
            if (err.code === 'ER_DUP_ENTRY') {
                conexion.query("SELECT id FROM pacientes WHERE nombre_id = ?", [nombre_id], function(err2, fila) {
                    return res.status(200).json({ id: fila[0].id, nombre_id: nombre_id });
                });
            } else {
                return res.status(500).json({ error: "Error al insertar paciente" });
            }
        } else {
            res.status(201).json({ id: resultado.insertId, nombre_id: nombre_id });
        }
    });
});

// --- API REST: SESIONES ---

// Crear una nueva sesión antes de empezar cuestionarios
app.post("/api/sesiones", function(req, res) {
    var { paciente_id, momento, num_sesion } = req.body;
    var sql = "INSERT INTO sesiones (paciente_id, momento, num_sesion) VALUES (?, ?, ?)";
    conexion.query(sql, [paciente_id, momento, num_sesion], function(err, resultado) {
        if (err) return res.status(500).json({ error: "Error al crear sesión" });
        res.status(201).json({ sesion_id: resultado.insertId });
    });
});

// --- API REST: RESULTADOS ---

// Guardar VAS (Salud, Ánimo, Dolor)
// Guardar VAS (Salud, Ánimo, Dolor)
app.post("/api/resultados/vas", function(req, res) {
    var { id_paciente, sesion_id, tipo_vas, momento, valor } = req.body;
    
    var sql = "INSERT INTO resultados_vas (id_paciente, sesion_id, tipo_vas, momento, valor) VALUES (?, ?, ?, ?, ?)";
    
    conexion.query(sql, [id_paciente, sesion_id, tipo_vas, momento, valor], function(err) {
        if (err) {
            console.error("Error SQL:", err);
            return res.status(500).json({ error: "Error al guardar VAS" });
        }
        res.status(201).json({ mensaje: "VAS guardado" });
    });
});
// Guardar Ansiedad
// 2. Guardar Ansiedad
app.post("/api/resultados/ansiedad", function(req, res) {
    var { sesion_id, momento, q1, q2 } = req.body;
    
    var sql = "INSERT INTO resultados_ansiedad (sesion_id, momento, pregunta1_num, pregunta2_lineal) VALUES (?, ?, ?, ?)";
    
    conexion.query(sql, [sesion_id, momento, q1, q2], function(err) {
        if (err) {
            console.error("Error SQL:", err);
            return res.status(500).json({ error: "Error al guardar Ansiedad" });
        }
        res.status(201).json({ mensaje: "Ansiedad guardada" });
    });
});

// Guardar STAI-6
app.post("/api/resultados/stai6", function(req, res) {
    var { id_paciente ,sesion_id, respuestas } = req.body; // respuestas es un array o objeto con 6 items
    var sql = "INSERT INTO resultados_stai6 (id_paciente, sesion_id, item1, item2, item3, item4, item5, item6) VALUES (?,?,?,?,?,?,?,?)";
    var params = [id_paciente ,sesion_id, respuestas[1], respuestas[2], respuestas[3], respuestas[4], respuestas[5], respuestas[6]];
    conexion.query(sql, params, function(err) {
        if (err) return res.status(500).json({ error: "Error al guardar STAI-6" });
        res.status(201).json({ mensaje: "STAI-6 guardado" });
    });
});

// Guardar Richards-Campbell
app.post("/api/resultados/richards", function(req, res) {
    var {id_paciente ,sesion_id, p1, p2, p3, p4, p5 } = req.body;
    var sql = "INSERT INTO resultados_sueno_rc (id_paciente ,sesion_id, item1, item2, item3, item4, item5) VALUES (?,?,?,?,?,?,?)";
    conexion.query(sql, [id_paciente,sesion_id, p1, p2, p3, p4, p5], function(err) {
        if (err) return res.status(500).json({ error: "Error al guardar Richards-Campbell" });
        res.status(201).json({ mensaje: "Sueño guardado" });
    });
});

// Guardar CAM-ICU (Auditivo + Visual)
app.post("/api/resultados/cam-icu", function(req, res) {
    // Ahora solo recibimos errores_auditivos
    const { id_paciente, sesion_id, errores_auditivos } = req.body;
    
    // Consulta SQL simplificada (solo 3 parámetros)
    const sql = "INSERT INTO resultados_cam_icu (id_paciente, sesion_id, errores_auditivos) VALUES (?, ?, ?)";
    
    conexion.query(sql, [id_paciente, sesion_id, errores_auditivos], function(err) {
        if (err) {
            console.error("Error al guardar CAM-ICU:", err);
            return res.status(500).json({ error: "Error en la base de datos" });
        }
        res.status(201).json({ mensaje: "CAM-ICU Auditivo guardado con éxito" });
    });
});

app.post("/api/resultados/tension-frc", function(req, res) {
    const { id_paciente, sesion_id, momento, frc, tas, tad } = req.body;
    
    const sql = "INSERT INTO resultados_tension_frc (id_paciente, sesion_id, momento, frc, tension_sistolica, tension_diastolica) VALUES (?, ?, ?, ?, ?, ?)";
    
    conexion.query(sql, [id_paciente, sesion_id, momento, frc, tas, tad], function(err) {
        if (err) {
            console.error("Error al guardar constantes:", err);
            return res.status(500).json({ error: "Error al guardar tensión y FRC" });
        }
        res.status(201).json({ mensaje: "Constantes guardadas con éxito" });
    });
});


// Guardar Satisfacción (USEQ)
app.post("/api/resultados/useq", function(req, res) {
    const { id_paciente, sesion_id, p1, p2, p3, p4, p5, p6, p7, p8 } = req.body;
    
    const sql = "INSERT INTO resultados_useq (id_paciente, sesion_id, p1, p2, p3, p4, p5, p6, p7_mejor, p8_peor) VALUES (?,?,?,?,?,?,?,?,?,?)";
    
    conexion.query(sql, [id_paciente, sesion_id, p1, p2, p3, p4, p5, p6, p7, p8], function(err) {
        if (err) {
            console.error("Error al guardar USEQ:", err);
            return res.status(500).json({ error: "Error en la base de datos al guardar USEQ" });
        }
        res.status(201).json({ mensaje: "USEQ guardado con éxito" });
    });
});

// --- INICIO DEL SERVIDOR ---
app.listen(3000, () => {
    console.log("Servidor UCI RV disponible en http://localhost:3000");
});
