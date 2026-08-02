const express = require("express");
const mysql = require("mysql");
const rpc = require("./rpc.js"); // Tu librería RPC

// --- CONFIGURACIÓN DE BASE DE DATOS ---
const conexion = mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "",
    database: "rvuci_v2",
    port: 3306
});

conexion.connect(err => {
    if (err) console.log("Error al conectar a rvuci:", err);
    else console.log("Base de datos rvuci conectada para INVESTIGADOR.");
});

// Wrapper para usar Promesas en MySQL (hace el código mucho más limpio)
const queryDB = (sql, params) => new Promise((resolve, reject) => {
    conexion.query(sql, params, (err, res) => err ? reject(err) : resolve(res));
});

// --- CONFIGURACIÓN DEL SERVIDOR RPC ---
// Levantamos el servidor RPC en el puerto 3501 (distinto al de pacientes)
const rpcServer = rpc.server(3501, () => {
    console.log("Servidor RPC Estudiador disponible en http://localhost:3501");
});

// Creamos la aplicación "estudiador" dentro del RPC
const appEstudiador = rpcServer.createApp("estudiador");

// PROCEDIMIENTO 1: Obtener todos los pacientes
appEstudiador.registerAsync("obtenerPacientes", async function(cb) {
    try {
        const pacientes = await queryDB("SELECT * FROM pacientes ORDER BY id ASC", []);
        cb(pacientes);
    } catch (e) {
        cb({ error: e.message });
    }
});

// PROCEDIMIENTO 2: Obtener absolutamente todos los datos de un paciente concreto
appEstudiador.registerAsync("obtenerDatosCompletosPaciente", async function(id_paciente, cb) {
    try {
        
        const sesiones = await queryDB("SELECT * FROM sesiones WHERE paciente_id = ? ORDER BY fecha_sesion ASC", [id_paciente]);
        
        // 2. Resultados VAS (Salud, Ansiedad, Animo, Dolor)
        const vas = await queryDB("SELECT * FROM resultados_vas WHERE id_paciente = ?", [id_paciente]);
        
        // 3. Constantes
        const constantes = await queryDB("SELECT * FROM resultados_tension_frc WHERE id_paciente = ?", [id_paciente]);
        
        // 4. USEQ (Cuestionario)
        const useq = await queryDB("SELECT * FROM resultados_useq WHERE id_paciente = ?", [id_paciente]);
        
        // 5. CAM-ICU (Errores)
        const cam_icu = await queryDB("SELECT * FROM resultados_cam_icu WHERE id_paciente = ?", [id_paciente]);
        
        // 6. STAI-6 (Sumatorio de 6 ítems)
        const stai6 = await queryDB("SELECT * FROM resultados_stai6 WHERE id_paciente = ?", [id_paciente]);
        
        // 7. Richards-Campbell (Sueño, 5 ítems)
        const richards = await queryDB("SELECT * FROM resultados_sueno_rc WHERE id_paciente = ?", [id_paciente]);

        // Enviamos todo el paquete de datos al clienteEstudio
        cb({
            sesiones: sesiones,
            vas: vas,
            constantes: constantes,
            useq: useq,
            cam_icu: cam_icu,
            stai6: stai6,
            richards: richards
        });
    } catch (e) {
        console.error("Error en servidor RPC:", e);
        cb({ error: e.message });
    }
});

