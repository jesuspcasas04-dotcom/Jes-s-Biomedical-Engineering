// Crear servidor HTTP si no tienes uno
var http = require("http");
var httpServer = http.createServer();
httpServer.listen(4444, () => console.log("Servidor WebSocket escuchando en puerto 4444"));

var WebSocketServer = require("websocket").server;
var wsServer = new WebSocketServer({
    httpServer: httpServer
});

var conexiones = []; // [{conexion, tipo: "peregrino"/"sanitario", id}]

wsServer.on("request", function (request) {
    var connection = request.accept("avisos", request.origin);
    var cliente = { conexion: connection, tipo: null, id: null };
    conexiones.push(cliente);
    console.log("Cliente conectado. Total:", conexiones.length);

    connection.on("message", function (message) {
        if (message.type === "utf8") {
            var msg = JSON.parse(message.utf8Data);

            switch (msg.operacion) {
                case "identificarse":
                    cliente.tipo = msg.tipo; // "peregrino" o "sanitario"
                    cliente.id = msg.id;
                    console.log(`Se ha identificado: ${cliente.tipo} ID=${cliente.id}`);
                    break;

                case "aviso_jornada":
                     console.log("📢 Aviso de jornada recibido");
                     conexiones.forEach(c => {
                            c.conexion.sendUTF(JSON.stringify({
                                tipo: "jornada",
                                peregrino: msg.peregrino,
                                ruta: msg.ruta,
                                nombreR : msg.nombreR,
                                etapa: msg.etapa,
                                accion: msg.accion // 👈 reenviar la acción
                            }));
                        });
                        break;
                    

                case "aviso_mensaje_peregrino":
                    console.log("📢 Aviso de mensaje de peregrino recibido");
                    conexiones.forEach(c => {
                        if (c.tipo === "sanitario") {
                            c.conexion.sendUTF(JSON.stringify({
                                tipo: "mensaje_peregrino",
                                peregrino: msg.peregrino
                            }));
                        }
                    });
                    break;

                case "aviso_mensaje_sanitario":
                    console.log("📢 Aviso de mensaje de sanitario recibido");
                    conexiones.forEach(c => {
                        if (c.tipo === "peregrino" && c.id == msg.idPeregrino) {
                            c.conexion.sendUTF(JSON.stringify({
                                tipo: "mensaje_sanitario",
                                sanitario: msg.sanitario
                            }));
                        }
                    });
                    break;
            }
        }
    });

    connection.on("close", function () {
        conexiones.splice(conexiones.indexOf(cliente), 1);
        console.log("Cliente desconectado. Total:", conexiones.length);
    });
});
