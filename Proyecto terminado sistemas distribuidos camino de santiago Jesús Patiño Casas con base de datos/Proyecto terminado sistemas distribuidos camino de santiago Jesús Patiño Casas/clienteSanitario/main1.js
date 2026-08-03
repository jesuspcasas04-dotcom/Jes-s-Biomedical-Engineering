var seccionActual="login";
function cambiarSeccion(seccion){

    document.getElementById(seccionActual).classList.remove("activa");
    document.getElementById(seccion).classList.add("activa");
    seccionActual=seccion;

};

function cambiarSeccionLogin(seccion){
    //En esta función, primero comprueba el usuario y contraseña introducido con el servidor y si devuelve 200 cambiaremos de sección.
    var login=document.getElementById("usuario").value;
    var password=document.getElementById("password").value;
    var datos={login:login, password:password};
    rest.post("http://localhost:3000/api/sanitarios/login",datos,function(estado,respuesta){
        var sanitarioId=null;

        if (estado==200){
            sanitarioId=respuesta.id;
            localStorage.setItem("sanitarioId",sanitarioId);
            conectarWebSocketSanitario(sanitarioId);
            console.log("SanitarioId: ",sanitarioId);
            cambiarSeccion(seccion);
            document.getElementById("avisosSanitario").innerHTML = "";
            getNombreyApellidos();
            cargarRutas();

        }
        else{
            //Tiene que mostrar el mensaje puesto en el servidor.
            alert(respuesta.error || "Error en el login");
        } 
    });
};


function guardarSanitario(){
    var nombre=document.getElementById("nombre").value;
    var apellidos=document.getElementById("apellidos").value;
    var login=document.getElementById("loginR").value;
    var password=document.getElementById("passwordR").value;

    var datos={nombre:nombre, apellidos:apellidos, login:login, password:password};

    if (nombre=="" || apellidos=="" || login=="" || password==""){
        alert("Rellene todos los campos");
        return;
    };

    rest.post("http://localhost:3000/api/sanitarios", datos, function(estado,respuesta){

        if (estado==201){
            console.log("Sanitario creado");
            cambiarSeccion("login");
            alert(respuesta.resultado);
        }
        else{
            alert(respuesta.error || "Error al registrar el sanitario");
        }


    });

};

function getNombreyApellidos(){
    var sanitarioId=localStorage.getItem("sanitarioId");
    if (sanitarioId){
        rest.get("http://localhost:3000/api/sanitarios/" + sanitarioId, function(estado,respuesta){

            if (estado==200){
                document.getElementById("nombreSanitario").innerText=respuesta.nombre + " " + respuesta.apellidos;
            }
            else if(estado==404){
                alert(respuesta.error || "Error al obtener el nombre y apellidos del sanitario");
            }

        });
    }
}

function editarDatos() {
    var sanitarioId = localStorage.getItem("sanitarioId");

    if (sanitarioId) {
        rest.get("http://localhost:3000/api/sanitarios/" + sanitarioId, function(estado, respuesta) {
            if (estado == 200) {
                document.getElementById("nombre").value = respuesta.nombre;
                document.getElementById("apellidos").value = respuesta.apellidos;
                document.getElementById("loginR").value = respuesta.login;
                document.getElementById("passwordR").value = ""; // Dejamos vacío por seguridad
                
                cambiarSeccion("registro");

                var botonGuardar = document.getElementById("guardar");
                botonGuardar.innerText = "Guardar cambios";

                // 🔹 Eliminar eventos previos para evitar conflictos
                botonGuardar.onclick = null;
                botonGuardar.onclick = function() {
                    actualizarSanitario(sanitarioId);
                };
            } else if (estado == 404) {
                alert(respuesta.error || "Error al obtener el nombre y apellidos del sanitario");
            }
        });
    }
}


function actualizarSanitario(sanitarioId) {
    var nombre = document.getElementById("nombre").value;
    var apellidos = document.getElementById("apellidos").value;
    var login = document.getElementById("loginR").value;
    var password = document.getElementById("passwordR").value;

    var datos = { nombre, apellidos, login, password };
    if (nombre == "" || apellidos == "" || login == "" || password == "") {
        alert("Rellene todos los campos");
        return;
    }
    rest.put("http://localhost:3000/api/sanitarios/" + sanitarioId, datos, function(estado, respuesta) {
        if (estado == 200) {
            console.log("Sanitario modificado correctamente");

            // 🔹 Actualizamos el login en LocalStorage para evitar problemas al volver a iniciar sesión
            localStorage.setItem("sanitarioLogin", login);

            alert("Datos actualizados. Vuelve a iniciar sesión con tus nuevos datos.");
            cambiarSeccion("inicio");
        } else {
            alert(respuesta.error || "Error al modificar el sanitario");
        }
    });
}



function cargarRutas(){
    rest.get("http://localhost:3000/api/rutas", function(estado,respuesta){
        if (estado==200){
            var listaRutas=respuesta;

            var select=document.getElementById("filtroRuta");
            listaRutas.forEach(ruta=>{

                var option=document.createElement("option");
                option.value=ruta.id;
                option.innerText=ruta.nombre;
                select.appendChild(option);

            });
        }
});

};

function cargarViajesActivos() {
    var idRuta = document.getElementById("filtroRuta").value;
    
    var URL = "http://localhost:3000/api/viajes-activos";

    if (idRuta != "todas") {
        URL += `?ruta=${idRuta}`;
    }

    rest.get(URL, function(estado, viajes) {
        var tbody = document.getElementById("listaPeregrinos");
        tbody.innerHTML = ""; // Limpiar la tabla

        if (estado == 200) {
            viajes.forEach(viaje => {
                var fila = `<tr>
                                <td>${viaje.nombre_peregrino}</td>
                                <td>${viaje.nombre_ruta}</td>
                                <td>${viaje.fecha_inicio}</td>
                                <td><button onclick="verPeregrino(${viaje.peregrino}); verViaje(${viaje.id}); rellenarListaViajes(${viaje.id}, ${viaje.peregrino}); rellenarTablasMensajes(${viaje.id})">Abrir</button></td>
                            </tr>`;
                            console.log(viaje.peregrino);
                tbody.innerHTML += fila;

            });
        } else {
            tbody.innerHTML = "<tr><td colspan='4'>No se encuentran viajes activos</td></tr>";
        }
    });
};
    
function verPeregrino(idPeregrino) {
    cambiarSeccion("viaje");
    localStorage.setItem("idPeregrinoS", idPeregrino);

    rest.get("http://localhost:3000/api/peregrinos/" + idPeregrino, function(estado, respuesta) {
        if (estado == 200) {
            let fechaNacimiento = new Date(respuesta.fecha_nacimiento).toLocaleDateString();

            document.getElementById("nombrePeregrino").innerHTML = respuesta.nombre;
            document.getElementById("apellidosPeregrino").innerHTML = respuesta.apellidos;
            document.getElementById("generoPeregrino").innerHTML = respuesta.genero;
            document.getElementById("fechaNacimientoPeregrino").innerHTML = fechaNacimiento;
            document.getElementById("pesoPeregrino").innerHTML = respuesta.peso;
            document.getElementById("alturaPeregrino").innerHTML = respuesta.altura;
        } else {
            alert(respuesta.error || "Error al obtener el peregrino");
        }
    });
}

function verViaje(idViaje) {
    rest.get("http://localhost:3000/api/viajes/" + idViaje, function(estado, viaje) {
        if (estado !== 200) {
            alert(viaje.error || "Error al obtener el viaje");
            return;
        }

        let fechaInicio = new Date(viaje.fecha_inicio).toLocaleDateString();
        let fechaFin = viaje.fecha_fin ? new Date(viaje.fecha_fin).toLocaleDateString() : "En curso";

        rest.get("http://localhost:3000/api/rutas/", function(estado2, rutas) {
            if (estado2 !== 200) {
                alert(rutas.error || "Error al obtener la ruta");
                return;
            }

            var ruta = rutas.find(r => r.id == viaje.ruta);
            document.getElementById("rutaPeregrino").innerHTML = ruta ? ruta.nombre : "Ruta no encontrada";
            document.getElementById("fechaInicioPeregrino").innerHTML = fechaInicio;
            document.getElementById("fechaFinPeregrino").innerHTML = fechaFin;
        });
    });
}


function rellenarListaViajes(idViaje, idPeregrino) {
    localStorage.setItem("viajeActual", String(idViaje)); // ✅ Usa el id ya conocido // Guardar el ID del viaje activo
    var tbody = document.getElementById("listaViajes");
    tbody.innerHTML = "<tr><td colspan='8'>Cargando...</td></tr>"; // Mensaje de carga

    rest.get(`http://localhost:3000/api/viajes/${idViaje}`, function(estado, viaje) {
        if (estado !== 200) {
            alert("Error al obtener el viaje.");
            tbody.innerHTML = "<tr><td colspan='8' style='color: red;'>Error al obtener el viaje.</td></tr>";
            return;
        }

        rest.get(`http://localhost:3000/api/rutas/${viaje.ruta}/etapas`, function(estadoEtapas, etapas) {
            if (estadoEtapas !== 200) {
                alert("Error al obtener las etapas de la ruta.");
                tbody.innerHTML = "<tr><td colspan='8' style='color: red;'>Error al obtener las etapas.</td></tr>";
                return;
            }

            rest.get(`http://localhost:3000/api/viajes/${idViaje}/jornadas`, function(estadoJornadas, jornadas) {
                if (estadoJornadas !== 200) {
                    alert("Error al obtener las jornadas del viaje.");
                    tbody.innerHTML = "<tr><td colspan='8' style='color: red;'>Error al obtener las jornadas.</td></tr>";
                    return;
                }


                tbody.innerHTML = ""; // Limpiar la tabla antes de llenar datos
                let filas = [];

                etapas.forEach((etapa) => {
                    var jornada = jornadas.find(j => j.etapa === etapa.orden);
                    
                    var fechaInicio = jornada ? new Date(jornada.fecha_inicio).toLocaleString() : "No registrado";
                    var fechaFin = jornada ? new Date(jornada.fecha_fin).toLocaleString() : "No registrado";
                    
                    var duracionHoras = "No registrado"; // Valor por defecto
                    
                    if (jornada && jornada.fecha_inicio && jornada.fecha_fin) {
                        let inicio = new Date(jornada.fecha_inicio);
                        let fin = new Date(jornada.fecha_fin);
                        let diffHoras = Math.round((fin - inicio) / (1000 * 60 * 60)); // Diferencia en horas
                        duracionHoras = !isNaN(diffHoras) ? diffHoras + " h" : "No registrado";
                    }

                    let fila = `<tr>
                        <td>${etapa.orden}</td>
                        <td>${etapa.origen}</td>
                        <td>${etapa.destino}</td>
                        <td>${etapa.distancia} km</td>
                        <td>${etapa.dificultad}</td>
                        <td>${etapa.desnivel}</td>
                        <td>${fechaInicio}</td>
                        <td>${fechaFin}</td>
                        <td>${duracionHoras}</td>
                    </tr>`;

                    filas.push(fila);
                });

                tbody.innerHTML = filas.join(""); // Agregar todas las filas de una sola vez
            });
        });
    });
};

function rellenarTablasMensajes(idViaje) {
    console.log("📡 Cargando mensajes del viaje:", idViaje);

    rest.get(`http://localhost:3000/api/viajes/${idViaje}/mensajes`, function(estado1, respuesta) {
        var tbody = document.getElementById("listaMensajes");
        tbody.innerHTML = ""; // ✅ Limpiar la tabla SIEMPRE

        if (estado1 !== 200 || !Array.isArray(respuesta)) {
            console.warn("⚠ No hay mensajes o respuesta inválida. Estado:", estado1);
            tbody.innerHTML = "<tr><td colspan='5' style='text-align: center;'>No hay mensajes.</td></tr>";
            return;
        }

        let idSanitarioActual = localStorage.getItem("sanitarioId");

        let promesas = respuesta.map(mensaje => {
            let fecha = new Date(mensaje.fecha).toLocaleString();

            return new Promise(resolve => {
                if (mensaje.sanitario) {
                    rest.get(`http://localhost:3000/api/sanitarios/${mensaje.sanitario}`, function(estado2, sanitario) {
                        let nombreSanitario = (estado2 === 200) ? `${sanitario.nombre} ${sanitario.apellidos}` : "Desconocido";
                        let esPropio = mensaje.sanitario == idSanitarioActual;

                        let fila = `<tr id="mensaje-${mensaje.id}" class="${esPropio ? "mensaje-propio" : "mensaje-otro"}">
                            <td>${fecha}</td>
                            <td>${mensaje.etapa}</td>
                            <td>${nombreSanitario}</td>
                            <td>${mensaje.texto}</td>
                            <td>${esPropio ? `<button onclick="borrarMensaje(${mensaje.id})">X</button>` : ""}</td>
                        </tr>`;
                        resolve(fila);
                    });
                } else {
                    // Mensaje del peregrino
                    let fila = `<tr id="mensaje-${mensaje.id}" class="mensaje-peregrino">
                        <td>${fecha}</td>
                        <td>${mensaje.etapa}</td>
                        <td>Peregrino</td>
                        <td>${mensaje.texto}</td>
                        <td></td>
                    </tr>`;
                    resolve(fila);
                }
            });
        });

        Promise.all(promesas).then(filas => {
            tbody.innerHTML = filas.join("");
            console.log("✅ Tabla de mensajes actualizada con", filas.length, "mensajes.");
        });
    });
}




function borrarMensaje(mensajeId) {
    rest.delete(`http://localhost:3000/api/mensajes/${mensajeId}`, function(estado, respuesta) {
        if (estado === 200) {
            let idViaje = parseInt(localStorage.getItem("viajeActual"));

            rellenarTablasMensajes(idViaje); // 🔁 refresca la tabla desde el servidor
        } else {
            alert("❌ Error al eliminar el mensaje.");
        }
    });
}



function añadirMensaje() {
    cambiarSeccion("Mensaje nuevo"); // Cambia a la sección del formulario de mensaje

   // Obtener el ID del viaje activo
    let idViaje = localStorage.getItem("viajeActual");


    let selectEtapa = document.getElementById("etapa");
    selectEtapa.innerHTML = "<option>Cargando etapas...</option>"; // Mensaje de carga temporal

    // Obtener las etapas de la ruta del viaje actual
    rest.get(`http://localhost:3000/api/viajes/${idViaje}`, function(estado, viaje) {
        if (estado !== 200) {
            alert("Error al obtener el viaje.");
            return;
        }

        rest.get(`http://localhost:3000/api/rutas/${viaje.ruta}/etapas`, function(estadoEtapas, etapas) {
            if (estadoEtapas !== 200) {
                alert("Error al obtener las etapas.");
                return;
            }

            selectEtapa.innerHTML = ""; // Limpiar opciones anteriores
            etapas.forEach(etapa => {
                let option = document.createElement("option");
                option.value = etapa.orden;
                option.innerText = `${etapa.orden}: ${etapa.origen} → ${etapa.destino}`;
                selectEtapa.appendChild(option);
            });
        });
    });

    // Limpiar el área de texto
    document.getElementById("texto").value = "";
};

function guardarMensaje() {
    let idViaje = localStorage.getItem("viajeActual");
    let idSanitario = localStorage.getItem("sanitarioId");
    let etapa = document.getElementById("etapa").value;
    let texto = document.getElementById("texto").value.trim();

    if (!idViaje|| !etapa || !texto) {
        alert("Todos los campos son obligatorios.");
        return;
    }

    let mensaje = { texto, etapa, sanitario: idSanitario || null };

    console.log("📡 Enviando mensaje al servidor:", mensaje);

    rest.post(`http://localhost:3000/api/viajes/${idViaje}/mensaje`, mensaje, function(estado, respuesta) {
        console.log("📡 Respuesta del servidor (guardar mensaje):", estado, respuesta);

        if (estado === 201) {
            alert("Mensaje enviado correctamente.");
            socket?.send(JSON.stringify({
                operacion: "aviso_mensaje_sanitario",
                sanitario: document.getElementById("nombreSanitario").innerText,
                idPeregrino: localStorage.getItem("idPeregrinoS")
                
            }));
            console.log("Mensaje de sanitario" + document.getElementById("nombreSanitario").innerText + " enviado al peregrino " + localStorage.getItem("viajeActual"));
            
            cambiarSeccion("viaje");

            // 🔹 Recargar toda la tabla para obtener los datos correctos del servidor
            rellenarTablasMensajes(idViaje);

        } else {
            alert("❌ Error al enviar el mensaje.");
        }
    });
};




var socket;

function conectarWebSocketSanitario(idSanitario) {
    // 🧼 Si ya hay una conexión previa, la cerramos
    if (socket && socket.readyState !== WebSocket.CLOSED) {
        socket.close();
    }

    socket = new WebSocket("ws://localhost:4444", "avisos");

    socket.onopen = function () {
        socket.send(JSON.stringify({
            operacion: "identificarse",
            tipo: "sanitario",
            id: idSanitario
        }));
    };

    socket.onmessage = function (event) {
        const aviso = JSON.parse(event.data);
        mostrarAviso(aviso);
    };
}

function mostrarAviso(aviso) {
    const tbody = document.getElementById("avisosSanitario");
    const fila = document.createElement("tr");

    const fecha = new Date().toLocaleString();

    console.log("🔔 Aviso recibido:", aviso); // 🔍 DEBUG para asegurarse de que llega 'accion'

    if (aviso.tipo === "jornada") { 
        
        if (aviso.accion === "inicio") {
           var accionTexto = "ha iniciado";
        }else{
           var accionTexto = "ha finalizado";
        }
    fila.innerHTML = `<td>${fecha}</td><td>${aviso.peregrino} ${accionTexto} una jornada en etapa ${aviso.etapa} de la ruta ${aviso.nombreR} (${aviso.ruta})</td>`;
    fila.style.backgroundColor = "#ec5252"; // fondo rojo claro
    } else if (aviso.tipo === "mensaje_peregrino") {
        fila.innerHTML = `<td>${fecha}</td><td>El peregrino ${aviso.peregrino} ha escrito un mensaje</td>`;
        fila.style.backgroundColor = "#ADD8E6"; // fondo azul claro
    } else if (aviso.tipo === "mensaje_sanitario") {
        fila.innerHTML = `<td>${fecha}</td><td>El sanitario ${aviso.sanitario} ha escrito un mensaje</td>`;
        fila.style.backgroundColor = "#b6e9b6"; // fondo verde
    }

    tbody.appendChild(fila);
}






