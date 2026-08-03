// 1) Cargar librerías
const mysql = require("mysql");
const rpc = require("./rpc.js");
// 1) Crear servidor RPC y app
const servidor = rpc.server();
const app = servidor.createApp("gestion_peregrinos");

// 2) Crear el pool/conn a MySQL (mejor pool que conexión única)
const conexion = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "base telemedicina", // usa el mismo nombre que ya te funciona
  port: 3306,
  connectionLimit: 10,
});

// 3) Comprobación inicial (opcional pero útil)
conexion.getConnection((err, conn) => {
  if (err) {
    console.error("❌ Error conectando a MySQL:", err);
    process.exit(1);
  }
  console.log("✅ Conectado a MySQL (pool)!");
  conn.release();
});
function obtenerRutas(callback) {
  conexion.query("SELECT * FROM rutas", (err, rutas) => {
    if (err) {
      console.error("Error al obtener las rutas:", err);
      return callback([]);                 // lista => []
    }
    callback(rutas || []);
  });
}

function obtenerEtapas(idRuta, callback) {
  const sql = "SELECT * FROM etapas WHERE ruta = ? ORDER BY orden";
  conexion.query(sql, [idRuta], (err, etapas) => {
    if (err) {
      console.error("Error al obtener las etapas:", err);
      return callback([]);                 // lista => []
    }
    callback(etapas || []);
  });
}

function loginPeregrino(codigoAcceso, callback) {
  const sql = "SELECT id FROM peregrinos WHERE codigo_acceso = ?";
  conexion.query(sql, [String(codigoAcceso ?? "").trim()], (err, result) => {
    if (err) {
      console.error("Error al realizar el login del peregrino:", err);
      return callback(null);               // valor => null
    }
    if (!result || result.length === 0) return callback(null);
    callback(result[0].id);
  });
}

function crearPeregrino(datosPeregrino, callback) {
  const sqlCheck = "SELECT 1 FROM peregrinos WHERE codigo_acceso = ? LIMIT 1";
  conexion.query(sqlCheck, [datosPeregrino.codigo_acceso], (err, exist) => {
    if (err) {
      console.error("Error al verificar el código de acceso del peregrino:", err);
      return callback(null);               // valor => null
    }
    if (exist && exist.length > 0) return callback(null);

    const sqlInsert = `
      INSERT INTO peregrinos (nombre, apellidos, fecha_nacimiento, genero, altura, peso, codigo_acceso)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    conexion.query(sqlInsert, [
      datosPeregrino.nombre,
      datosPeregrino.apellidos,
      datosPeregrino.fecha_nacimiento,
      datosPeregrino.genero,
      datosPeregrino.altura,
      datosPeregrino.peso,
      datosPeregrino.codigo_acceso
    ], (err2) => {
      if (err2) {
        console.error("Error al crear el peregrino:", err2);
        return callback(null);             // valor => null
      }
      callback(datosPeregrino.codigo_acceso);
    });
  });
}

function actualizarPeregrino(idPeregrino, datosPeregrino, callback) {
  const sql = `
    UPDATE peregrinos
    SET nombre = ?, apellidos = ?, fecha_nacimiento = ?, genero = ?, altura = ?, peso = ?, codigo_acceso = ?
    WHERE id = ?
  `;
  conexion.query(sql, [
    datosPeregrino.nombre,
    datosPeregrino.apellidos,
    datosPeregrino.fecha_nacimiento,
    datosPeregrino.genero,
    datosPeregrino.altura,
    datosPeregrino.peso,
    datosPeregrino.codigo_acceso,
    idPeregrino
  ], (err, result) => {
    if (err) {
      console.error("Error al actualizar el peregrino:", err);
      return callback(null);               // objeto => null
    }
    if (!result || result.affectedRows === 0) return callback(null);
    callback({ id: idPeregrino, ...datosPeregrino });
  });
}

function obtenerPeregrino(idPeregrino, callback) {
  const sql = `
    SELECT id, nombre, apellidos, fecha_nacimiento, genero, altura, peso
    FROM peregrinos WHERE id = ? LIMIT 1
  `;
  conexion.query(sql, [idPeregrino], (err, rows) => {
    if (err) {
      console.error("Error al obtener el peregrino:", err);
      return callback(null);               // objeto => null
    }
    callback(rows && rows[0] ? rows[0] : null);
  });
}

function obtenerSanitario(idSanitario, callback) {
  const sql = "SELECT id, nombre, apellidos, login FROM sanitarios WHERE id = ? LIMIT 1";
  conexion.query(sql, [idSanitario], (err, rows) => {
    if (err) {
      console.error("Error al obtener el sanitario:", err);
      return callback(null);               // objeto => null
    }
    callback(rows && rows[0] ? rows[0] : null);
  });
}

function obtenerViajes(idPeregrino, callback) {
  const sql = "SELECT * FROM viajes WHERE peregrino = ? ORDER BY fecha_inicio DESC";
  conexion.query(sql, [idPeregrino], (err, rows) => {
    if (err) {
      console.error("Error al obtener los viajes:", err);
      return callback([]);                 // lista => []
    }
    callback(rows || []);
  });
}

function obtenerJornadas(idViaje, callback) {
  const sql = "SELECT * FROM jornadas WHERE viaje = ? ORDER BY fecha_inicio";
  conexion.query(sql, [idViaje], (err, jornadas) => {
    if (err) {
      console.error("Error al obtener las jornadas:", err);
      return callback([]);                 // lista => []
    }
    callback(jornadas || []);
  });
}

function crearViaje(idPeregrino, idRuta, idEtapaOrigen, idEtapaDestino, fechaInicio, callback) {
  const sql = `
    INSERT INTO viajes (peregrino, ruta, fecha_inicio, fecha_fin, etapa_origen, etapa_destino)
    VALUES (?, ?, ?, NULL, ?, ?)
  `;
  conexion.query(sql, [idPeregrino, idRuta, fechaInicio, idEtapaOrigen, idEtapaDestino], (err, result) => {
    if (err) {
      console.error("Error al crear el viaje:", err);
      return callback(null);               // valor => null
    }
    callback(result.insertId);
  });
}

function eliminarViaje(idViaje, callback) {
  const sql = "DELETE FROM viajes WHERE id = ?";
  conexion.query(sql, [idViaje], (err, result) => {
    if (err) {
      console.error("Error al eliminar el viaje:", err);
      return callback(false);              // booleano => false
    }
    callback(!!(result && result.affectedRows > 0));
  });
}

function obtenerViaje(idViaje, callback) {
  const sql = "SELECT * FROM viajes WHERE id = ? LIMIT 1";
  conexion.query(sql, [idViaje], (err, rows) => {
    if (err) {
      console.error("Error al encontrar el viaje:", err);
      return callback(null);               // objeto => null
    }
    callback(rows && rows[0] ? rows[0] : null);
  });
}

function obtenerMensajes(idViaje, callback) {
  const sql = "SELECT * FROM mensajes WHERE viaje = ? ORDER BY fecha ASC";
  conexion.query(sql, [idViaje], (err, mensajes) => {
    if (err) {
      console.error("Error al obtener mensajes:", err);
      return callback([]);                 // lista => []
    }
    callback(mensajes || []);
  });
}

function crearMensaje(idViaje, texto, etapa, callback) {
  const sql = "INSERT INTO mensajes (sanitario, viaje, texto, fecha, etapa) VALUES (NULL, ?, ?, NOW(), ?)";
  conexion.query(sql, [idViaje, texto, etapa], (err, result) => {
    if (err) {
      console.error("Error al crear el mensaje:", err);
      return callback(null);               // valor => null
    }
    callback(result.insertId);
  });
}

function eliminarMensaje(idMensaje, callback) {
  const sql = "DELETE FROM mensajes WHERE id = ?";
  conexion.query(sql, [idMensaje], (err, result) => {
    if (err) {
      console.error("Error al eliminar el mensaje:", err);
      return callback(false);              // booleano => false
    }
    if (!result || result.affectedRows === 0) return callback(false);
    callback(true);
  });
}

function finalizarViaje(idViaje, callback) {
  const sql = "UPDATE viajes SET fecha_fin = NOW() WHERE id = ?";
  conexion.query(sql, [idViaje], (err, result) => {
    if (err) {
      console.error("Error al finalizar el viaje:", err);
      return callback(false);              // booleano => false
    }
    callback(!!(result && result.affectedRows > 0));
  });
}

function iniciarJornada(idViaje, etapa, callback) {
  const sql = "INSERT INTO jornadas (viaje, etapa, fecha_inicio, fecha_fin) VALUES (?, ?, NOW(), NULL)";
  conexion.query(sql, [idViaje, etapa], (err, result) => {
    if (err) {
      console.error("Error al iniciar la jornada:", err);
      return callback(null);               // valor => null
    }
    callback(result.insertId);
  });
}

function finalizarJornada(idViaje, etapa, callback) {
  const sql = "UPDATE jornadas SET fecha_fin = NOW() WHERE viaje = ? AND etapa = ? AND fecha_fin IS NULL";
  conexion.query(sql, [idViaje, etapa], (err, result) => {
    if (err) {
      console.error("Error al finalizar la jornada:", err);
      return callback(false);              // booleano => false
    }
    callback(!!(result && result.affectedRows > 0));
  });
}





// 2) Registrar TODAS las funciones (las nuevas que consultan MySQL)
app.registerAsync(obtenerRutas);
app.registerAsync(obtenerEtapas);
app.registerAsync(loginPeregrino);
app.registerAsync(crearPeregrino);
app.registerAsync(actualizarPeregrino);
app.registerAsync(obtenerPeregrino);
app.registerAsync(obtenerSanitario);
app.registerAsync(obtenerViajes);
app.registerAsync(obtenerJornadas);
app.registerAsync(crearViaje);
app.registerAsync(eliminarViaje);
app.registerAsync(obtenerViaje);
app.registerAsync(obtenerMensajes);
app.registerAsync(crearMensaje);
app.registerAsync(eliminarMensaje);
app.registerAsync(finalizarViaje);
app.registerAsync(iniciarJornada);
app.registerAsync(finalizarJornada);

console.log("🚀 Servidor RPC iniciado (con MySQL)");




