var app = rpc("localhost", "gestion_peregrinos");

var obtenerRutas= app.procedure("obtenerRutas");
var obtenerEtapas= app.procedure("obtenerEtapas");
var loginPeregrino= app.procedure("loginPeregrino");
var crearPeregrino= app.procedure("crearPeregrino");
var actualizarPeregrino= app.procedure("actualizarPeregrino");
var obtenerPeregrino= app.procedure("obtenerPeregrino");

var obtenerViajes= app.procedure("obtenerViajes");
var obtenerJornadas= app.procedure("obtenerJornadas");
var crearViaje=app.procedure("crearViaje");
var eliminarViaje= app.procedure("eliminarViaje");
var obtenerViaje= app.procedure("obtenerViaje");
var obtenerJornadas= app.procedure("obtenerJornadas");
var obtenerMensajes= app.procedure("obtenerMensajes");
var crearMensaje= app.procedure("crearMensaje");
var eliminarMensaje= app.procedure("eliminarMensaje");
var finalizarViaje=app.procedure("finalizarViaje");
var iniciarJornada=app.procedure("iniciarJornada");
var finalizarJornada=app.procedure("finalizarJornada");

var seccionActual="acceso";
function cambiarSeccion(seccion){

    document.getElementById(seccionActual).classList.remove("activa");
    document.getElementById(seccion).classList.add("activa");
    seccionActual=seccion;
    if (seccion === 'registro') limpiarFormularioRegistro();

};

function cambiarSeccionLogin(){

    var codigo=document.getElementById("codigo").value;

    if (codigo){
        loginPeregrino(codigo, function(id){
            if (id){
                cambiarSeccion("inicio");
                document.getElementById("avisosPeregrino").innerHTML = "";
                obtenerNombrePeregrino(id);
                cargarViajes(id);
                cargarRutas();
                console.log("El peregrino con id " + id + " ha iniciado sesión");
                localStorage.setItem("idPeregrino", id);
                conectarWebSocketPeregrino(id);


            }else {
                alert("Código incorrecto");
            }


        });

    }else {
        alert("Introduce un código");
    }

    

};

function obtenerNombrePeregrino(id){
    obtenerPeregrino(id, function(peregrino){
        document.getElementById("nombrePeregrino").innerText = peregrino.nombre + " " + peregrino.apellidos;

        // ⚠️ Aquí añadimos esto:
        localStorage.setItem("nombrePeregrino", peregrino.nombre + " " + peregrino.apellidos);
    });
}


function cargarViajes(idPeregrino){
    obtenerViajes(idPeregrino ,function(viajes){

        if (viajes.length>0){
            var tbody= document.getElementById("viajesActivos");
            tbody.innerHTML="";

            obtenerRutas(function(rutas){

            viajes.forEach(viaje => {

                var ruta= rutas.find(ruta=> ruta.id === viaje.ruta);

                var formattedStartDate =new Date(viaje.fecha_inicio).toLocaleDateString();
                var formattedEndDate = viaje.fecha_fin ? new Date(viaje.fecha_fin).toLocaleDateString() : "Not Finished";


                tbody.innerHTML += "<tr id= '"+viaje.id+"' ><td>" + ruta.nombre + "</td><td>"
                + formattedStartDate + "</td><td>" + formattedEndDate +
                "</td><td><button onclick='abrirViaje(\"" + new Date(viaje.fecha_inicio).toISOString() + "\",\"" + new Date(viaje.fecha_fin).toISOString() + "\"," + ruta.id + "," + viaje.id + ")'>Abrir</button></td><td><button onclick='eliminarFila("+viaje.id+")'>Eliminar</button></td></tr>";
                
            
          })
        });
       }
    });
   };

function abrirViaje(InicioViaje, finalViaje, rutaId, idViaje) {
    localStorage.setItem("rutaId", rutaId);
    cambiarSeccion("viaje");
    localStorage.setItem("idViaje", idViaje);

    obtenerRutas(function(rutas) {
        var nombreRuta = document.getElementById("rutaViaje");
        var ruta = rutas.find(r => r.id === rutaId);
        nombreRuta.innerHTML = ruta.nombre;
        

        document.getElementById("fechaInicio").innerHTML = new Date(InicioViaje).toLocaleDateString();

        var fechaFinElem = document.getElementById("fechaFin");
        var btnFinalizar = document.getElementById("btnFinalizarViaje");

        if (finalViaje && !isNaN(new Date(finalViaje).getTime())) {
            // Si hay fecha fin válida
            fechaFinElem.innerHTML = new Date(finalViaje).toLocaleDateString();
            btnFinalizar.style.display = "none"; // Ocultar botón
        } else {
            // No hay fecha fin aún
            fechaFinElem.innerHTML = "";
            btnFinalizar.style.display = "inline-block"; // Mostrar botón
        }

        rellenarEtapas(ruta.id, idViaje);
        rellenarMensaje(idViaje);
    });
}



function rellenarEtapas(rutaId, idViaje) {
    var tbody = document.getElementById("tablaEtapas");
    tbody.innerHTML = "";

    obtenerEtapas(rutaId, function(etapas) {
        obtenerJornadas(idViaje, function(jornadas) {
            etapas.forEach(etapa => {
                var jornada = jornadas.find(j => j.etapa === etapa.orden);

                if (!jornada) {
                    // Si no hay jornada asociada, mostrar opción de iniciar
                    tbody.innerHTML += "<tr><td>" + etapa.orden + "</td><td>"
                        + etapa.origen + "</td><td>" + etapa.destino +
                        "</td><td>" + etapa.distancia + "</td><td>" + etapa.dificultad +
                        "</td><td>" + etapa.desnivel +
                        "</td><td><button onclick='iniciarJornadaM(" + idViaje + "," + etapa.orden + ")'>Iniciar</button></td><td></td><td></td></tr>";
                } else if (jornada.fecha_inicio && !jornada.fecha_fin) {
                    // Jornada iniciada pero no finalizada
                    var fechaInicioJornada = new Date(jornada.fecha_inicio).toLocaleDateString();
                    tbody.innerHTML += "<tr><td>" + etapa.orden + "</td><td>"
                        + etapa.origen + "</td><td>" + etapa.destino +
                        "</td><td>" + etapa.distancia + "</td><td>" + etapa.dificultad +
                        "</td><td>" + etapa.desnivel +
                        "</td><td>" + fechaInicioJornada +
                        "</td><td><button onclick='finalizarJornadaM(" + idViaje + "," + etapa.orden + ")'>Finalizar</button></td><td></td></tr>";
                } else if (jornada.fecha_inicio && jornada.fecha_fin) {
                    // Jornada completa
                    var fechaInicioJornada = new Date(jornada.fecha_inicio).toLocaleDateString();
                    var fechaFinJornada = new Date(jornada.fecha_fin).toLocaleDateString();
                    var duracionMinutos = Math.floor((new Date(jornada.fecha_fin) - new Date(jornada.fecha_inicio)) / (1000 * 60));
                    tbody.innerHTML += "<tr><td>" + etapa.orden + "</td><td>"
                        + etapa.origen + "</td><td>" + etapa.destino +
                        "</td><td>" + etapa.distancia + "</td><td>" + etapa.dificultad +
                        "</td><td>" + etapa.desnivel +
                        "</td><td>" + fechaInicioJornada +
                        "</td><td>" + fechaFinJornada +
                        "</td><td>" + duracionMinutos + " min</td></tr>";
                }
            });
        });
    });
};


function eliminarFila(idViaje) {
    // 1. Llamamos al servidor para eliminar
    eliminarViaje(idViaje, function(ok) {
        if (ok) {
            // 2. Si se eliminó bien, borramos la fila del DOM
            var fila = document.getElementById(idViaje);
            if (fila) fila.remove();
        } else {
            alert("No se pudo eliminar el viaje. 😥");
        }
    });
}

function registrarPeregrino(){
    var nombre= document.getElementById("nombre").value;
    var apellidos= document.getElementById("apellidos").value;
    var fNacimiento= document.getElementById("fecha_nacimiento").value;
    //Ahora voy a coger el option que se ha elegido de género.
    var genero= document.getElementById("genero").value;
    var altura= document.getElementById("altura").value;
    var peso= document.getElementById("peso").value;
    var codigo= document.getElementById("codigoReg").value;
    
if (nombre && apellidos && fNacimiento && genero && altura && peso && codigo){
    var datosPeregrino={"nombre": nombre, "apellidos": apellidos, "fecha_nacimiento": fNacimiento, "genero": genero, "altura": altura, "peso": peso, "codigo_acceso": codigo};

    crearPeregrino(datosPeregrino,function(codigo){

        if (codigo){
            alert( "Peregrino registrado con éxito");
            cambiarSeccion("acceso"); //Puedes cambiar sección a acceso o a inicio.
        }else{
            alert("No se pudo registrar el peregrino porque posiblemente has puesto un código que ya existe ");
        }

    });

}else{
    alert("Introduce todos los campos");
}
};


function irARegistro(){
    cambiarSeccion("registro");
    document.getElementById("guardar").onclick= editarDatos;
    document.getElementById("guardar").textContent="Actualizar";
}
function editarDatos(){
    var idPeregrino=parseInt( localStorage.getItem("idPeregrino"));
    var nombre= document.getElementById("nombre").value;
    var apellidos= document.getElementById("apellidos").value;
    var fNacimiento= document.getElementById("fecha_nacimiento").value;
    var genero= document.getElementById("genero").value;
    var altura= document.getElementById("altura").value;
    var peso= document.getElementById("peso").value;
    var codigo= document.getElementById("codigoReg").value;

    var datosPeregrino={ "nombre": nombre, "apellidos": apellidos,
         "fecha_nacimiento": fNacimiento, "genero": genero, "altura": altura, "peso": peso, "codigo_acceso": codigo};
    
    actualizarPeregrino(idPeregrino, datosPeregrino, function(peregrino){

        if (peregrino){
            cambiarSeccion("inicio");
            obtenerNombrePeregrino(idPeregrino);
            cargarViajes(idPeregrino);

        } else {
            alert("No se pudo actualizar el peregrino");
        }

        document.getElementById("guardar").onclick= registrarPeregrino; 
        document.getElementById("guardar").textContent="Guardar";

    });
    

}

function cargarRutas() {
    var select = document.getElementById("ruta");  // Aquí seleccionamos el select de rutas
    select.innerHTML = "";  // Limpiamos las opciones existentes
    console.log("ejecutando cargar rutas");

    obtenerRutas(function(rutas) {
        // Si hay rutas, las agregamos
        rutas.forEach(ruta => {
            var option = document.createElement("option");  // Creamos un nuevo <option>
            option.value = ruta.id;  // Asignamos el valor
            option.textContent = ruta.nombre;  // Asignamos el nombre visible
    
            select.appendChild(option);  // Agregamos el <option> al <select>
        });
    });
};

function cargarEtapas(){
    var rutaId= document.getElementById("ruta").value;
    var selectOrigen= document.getElementById("etapaOrigen");
    var selectDestino= document.getElementById("etapaDestino");
    selectOrigen.innerHTML="";
    selectDestino.innerHTML="";
    console.log("ejecutando cargar etapas de la ruta " + rutaId);
    obtenerEtapas(rutaId, function(etapas){
        etapas.forEach(etapa=>{
            
            var optionOrigen= document.createElement("option");
            optionOrigen.value= etapa.orden;
            optionOrigen.textContent= etapa.origen;
            selectOrigen.appendChild(optionOrigen);

            var optionDestino= document.createElement("option");
            optionDestino.value= etapa.orden;
            optionDestino.textContent= etapa.destino;
            selectDestino.appendChild(optionDestino);
        });
    });




};

function guardarViaje() {
    var rutaId = parseInt(document.getElementById("ruta").value);  // Asegúrate de que rutaId sea un número
    var idPeregrino = parseInt(localStorage.getItem("idPeregrino"));
    var etapaOrigen = document.getElementById("etapaOrigen").value;
    var etapaDestino = document.getElementById("etapaDestino").value;
    var fechaInicio = document.getElementById("fechaInicioNV").value;

    console.log("La fecha de inicio es:" + fechaInicio);

    // Llamamos a la función crearViaje pasando todos los parámetros
    crearViaje(idPeregrino, rutaId, etapaOrigen, etapaDestino, fechaInicio, function(idViaje) {
        if (idViaje) {
            alert("Viaje creado con éxito");
            // Llama a la función añadirViaje después de crear el viaje
            cargarViajes(idPeregrino);  // Pasa también la rutaId para obtener la ruta
            cambiarSeccion("inicio");
            console.log("Viaje creado con id " + idViaje + " de peregrino " + idPeregrino + " con ruta " + rutaId);
        }
    });
};


function abrirViaje(InicioViaje, finalViaje ,rutaId, idViaje){
    localStorage.setItem("rutaId" ,rutaId)

    cambiarSeccion("viaje");
    localStorage.setItem("idViaje", idViaje);

    obtenerRutas(function(rutas){
        var nombreRuta = document.getElementById("rutaViaje");
        var ruta = rutas.find(ruta => ruta.id === rutaId);
        nombreRuta.innerHTML = ruta.nombre;

        var inicioViajef = new Date(InicioViaje).toLocaleDateString(); 
        var fecha_inicio = document.getElementById("fechaInicio");
        fecha_inicio.innerHTML = inicioViajef;

        if (finalViaje) {
            var finalViajef = new Date(finalViaje).toLocaleDateString();
            var fecha_fin = document.getElementById("fechaFin");
            fecha_fin.innerHTML = finalViajef;
        };

        rellenarEtapas(ruta.id, idViaje);
        rellenarMensaje(idViaje);  // Aquí se cargan los mensajes del viaje
    });
}




function finalizarViajeM() {
    var idViaje = parseInt(localStorage.getItem("idViaje"));

    obtenerViaje(idViaje, function(viaje) {
        if (viaje && viaje.fecha_fin) {
            alert("Este viaje ya fue finalizado.");
        } else {
            finalizarViaje(idViaje, function(ok) {
                if (ok) {
                    alert("Viaje finalizado");
                    var fecha_fin = document.getElementById("fechaFin");
                    var fechaFin = new Date().toLocaleDateString();
                    fecha_fin.innerHTML = fechaFin;
                    document.getElementById("btnFinalizarViaje").style.display = "none"; // Ocultar el botón
                } else {
                    alert("No es posible finalizar el viaje");
                }
            });
        }
    });
}



function volverAViajes(){
    var idPeregrino= parseInt(localStorage.getItem("idPeregrino"));
    cargarViajes(idPeregrino);
    console.log("El id del peregrino es: " + idPeregrino);
    cambiarSeccion("inicio");
}


function rellenarMensajes(idViaje) {
    var tbody = document.getElementById("tablaMensajes");
    tbody.innerHTML = "";
    
    var idPeregrinoLogueado = parseInt(localStorage.getItem("idPeregrino"));

    obtenerMensajes(idViaje, function(mensajes) {
        console.log("Mensajes del viaje:", mensajes);  // Para depuración
        mensajes.forEach(mensaje => {
            obtenerSanitario(mensaje.sanitario, function(sanitario) {
                var fechaMensaje = new Date(mensaje.fecha).toLocaleDateString();
                var esSanitario = mensaje.sanitario !== null;  // Si el mensaje tiene sanitario asociado
                var nombreSanitario = esSanitario && sanitario ? `${sanitario.nombre} ${sanitario.apellidos}` : "Peregrino";

                var botonEliminar = "";

                // 👉 Ahora controlamos de verdad:
                if (mensaje.sanitario === null) { // Solo si es mensaje de peregrino
                    obtenerViaje(mensaje.viaje, function(viaje) {
                        if (viaje.peregrino === idPeregrinoLogueado) {
                            // Solo si el peregrino del viaje es el logueado
                            botonEliminar = `<button onclick='eliminarFilaMensaje(${mensaje.id})'>X</button>`;
                        }
                        tbody.innerHTML += `<tr id="${mensaje.id}T">
                            <td>${fechaMensaje}</td>
                            <td>${mensaje.etapa}</td>
                            <td>${nombreSanitario}</td>
                            <td>${mensaje.texto}</td>
                            <td>${botonEliminar}</td>
                        </tr>`;
                    });
                } else {
                    // 🔥 Mensaje de sanitario => nunca ponemos botón
                    tbody.innerHTML += `<tr id="${mensaje.id}T">
                        <td>${fechaMensaje}</td>
                        <td>${mensaje.etapa}</td>
                        <td>${nombreSanitario}</td>
                        <td>${mensaje.texto}</td>
                        <td></td>
                    </tr>`;
                }
            });
        });
    });
}





function eliminarFilaMensaje(idMensaje) {
    obtenerMensajes(parseInt(localStorage.getItem("idViaje")), function(mensajes) {
        var mensaje = mensajes.find(m => m.id === idMensaje);

        if (!mensaje) {
            alert("❌ No se ha encontrado el mensaje.");
            return;
        }

        var idPeregrinoLogueado = parseInt(localStorage.getItem("idPeregrino"));

        if (mensaje.sanitario !== null) {
            // 🚫 Es un mensaje de sanitario, NO puedes eliminarlo
            alert("❌ No puedes eliminar mensajes de sanitarios.");
            return;
        }

        // Ahora verificamos que el peregrino es el mismo que el del viaje
        obtenerViaje(mensaje.viaje, function(viaje) {
            if (viaje.peregrino !== idPeregrinoLogueado) {
                // 🚫 No eres el peregrino del viaje
                alert("❌ No puedes eliminar mensajes de otros peregrinos.");
                return;
            }

            // ✅ Si todo es correcto, entonces sí puedes eliminar
            eliminarMensaje(idMensaje, function(ok) {
                if (ok) {
                    alert("✅ Mensaje eliminado correctamente.");
                    rellenarMensajes(localStorage.getItem("idViaje"));
                } else {
                    alert("❌ Error al eliminar el mensaje.");
                }
            });
        });
    });
}


function añadirMensaje(){
    cambiarSeccion("MensajeNuevo");
    var idRuta = parseInt(localStorage.getItem("rutaId"));
    obtenerEtapas(idRuta , function(etapas){
          
        var select= document.getElementById("etapa");
        select.innerHTML="";
        etapas.forEach(etapa=>{
            var option= document.createElement("option");
            option.value= etapa.orden;
            option.textContent= etapa.origen + " - " + etapa.destino;
            select.appendChild(option);
        });

    });



}

function guardarMensaje() {
    var idViaje = parseInt(localStorage.getItem("idViaje"));
    var texto = document.getElementById("texto").value; // Usa 'value' para obtener el texto de un <textarea>
    var etapa = document.getElementById("etapa").value;

    // Verificar si la etapa tiene un valor válido
    if (!etapa) {
        alert("Debe seleccionar una etapa.");
        return;
    }

    console.log("Texto del mensaje:", texto);  // Para depuración
    console.log("Etapa seleccionada:", etapa);  // Para depuración

    // Crear el mensaje pasando la etapa seleccionada
    crearMensaje(idViaje, texto, etapa, function (idMensaje) {
        console.log("ID del mensaje creado:", idMensaje);  // Para depuración
        if (idMensaje) {
            // Guardamos el id del mensaje en localStorage después de crear el mensaje
            localStorage.setItem("idMensaje", idMensaje);
            alert("Mensaje creado con éxito");
            socket?.send(JSON.stringify({
                operacion: "aviso_mensaje_peregrino",
                peregrino: localStorage.getItem("nombrePeregrino")

            }));
            
            volverAMensajes();
        } else {
            alert("Mensaje no creado");
        }
    });
}


function volverAMensajes() {
    // Cambia la sección a "viaje" (donde se muestran los mensajes del viaje)
    cambiarSeccion("viaje");

    // Obtener el ID del viaje desde localStorage
    var idViaje = parseInt(localStorage.getItem("idViaje"));

    // Llamamos a la función para rellenar los mensajes del viaje
    rellenarMensaje(idViaje);
}



function rellenarMensaje(idViaje){
    var tbody = document.getElementById("tablaMensajes"); 
    tbody.innerHTML = "";  // Limpiar los mensajes actuales antes de agregar los nuevos

    obtenerMensajes(idViaje, function(mensajes){
        mensajes.forEach(mensaje => {
            obtenerSanitario(mensaje.sanitario, function(sanitario){
                // Formateamos la fecha del mensaje
                var fechaMensaje = new Date(mensaje.fecha).toLocaleDateString() + " " + new Date(mensaje.fecha).toLocaleTimeString();

                var esSanitario= mensaje.sanitario !== null; // Verificamos si es un mensaje de sanitario o peregrino

                // Verificamos si es un mensaje de sanitario o peregrino
                var esSanitario2 = sanitario != null; 
                
                // Determinar el color de fondo dependiendo de quién es el autor
                var colorFondo = esSanitario ? "background-color: #b6e9b6;" : "background-color: #f8d7da;"; // Verde para sanitario, rojo para peregrino

                var nombreSanitario = esSanitario && sanitario ? sanitario.nombre : "Peregrino";


                // Si es del sanitario, deshabilitamos el botón de eliminación
                var eliminarBoton = esSanitario ? "" : "<button onclick='eliminarFilaMensaje(" + mensaje.id + ")'>X</button>";

                // Insertamos el mensaje en la tabla con el color de fondo adecuado
                tbody.innerHTML += "<tr style='" + colorFondo + "' id='" + mensaje.id + "T'>" +
                    "<td>" + fechaMensaje + "</td>" +
                    "<td>" + mensaje.etapa + "</td>" +
                    "<td>" + nombreSanitario + "</td>" +
                    "<td>" + mensaje.texto + "</td>" +
                    "<td>" + eliminarBoton + "</td>" +
                    "</tr>";
            });
        });
    });
}

function limpiarFormularioRegistro(){
    document.getElementById("nombre").value = "";
    document.getElementById("apellidos").value = "";
    document.getElementById("fecha_nacimiento").value = "";
    document.getElementById("genero").value = "";
    document.getElementById("altura").value = "";
    document.getElementById("peso").value = "";
    document.getElementById("codigoReg").value = "";

}

function iniciarJornadaM(idViaje, numEtapa) {
    const rutaId = localStorage.getItem("rutaId");

    obtenerRutas(function(rutas) {
        const rutaEncontrada = rutas.find(ruta => ruta.id === parseInt(rutaId));
        const nombreRuta = rutaEncontrada ? rutaEncontrada.nombre : "Ruta desconocida";


        obtenerEtapas(rutaId, function(etapas) {
            const etapaEncontrada = etapas.find(e => e.orden == numEtapa);
            if (!etapaEncontrada) {
                alert("Etapa no encontrada");
                return;
            }

            const nombreEtapa = etapaEncontrada.origen + " - " + etapaEncontrada.destino;

            iniciarJornada(idViaje, numEtapa, function() {
                // 💬 Solo después de iniciar correctamente, enviamos el aviso
                socket?.send(JSON.stringify({
                    operacion: "aviso_jornada",
                    peregrino: document.getElementById("nombrePeregrino").innerText,
                    ruta: rutaId,
                    nombreR: nombreRuta,
                    etapa: nombreEtapa,
                    accion: "inicio"
                }));

                rellenarEtapas(rutaId, idViaje);
            });
        });
    });
}



function finalizarJornadaM(idViaje, numEtapa) {
    const rutaId = localStorage.getItem("rutaId");

    obtenerRutas(function(rutas) {
        var rutaEncontrada = rutas.find(ruta => ruta.id === parseInt(rutaId));
        var nombreRuta = rutaEncontrada ? rutaEncontrada.nombre : "Ruta desconocida";


        obtenerEtapas(rutaId, function(etapas) {
            const etapaEncontrada = etapas.find(e => e.orden == numEtapa);
            if (!etapaEncontrada) {
                alert("Etapa no encontrada");
                return;
            }

            const nombreEtapa = etapaEncontrada.origen + " - " + etapaEncontrada.destino;

            socket?.send(JSON.stringify({
                operacion: "aviso_jornada",
                peregrino: document.getElementById("nombrePeregrino").innerText,
                ruta: rutaId,
                nombreR: nombreRuta,
                etapa: nombreEtapa,
                accion: "fin"
            }));
        });
    });

            finalizarJornada(idViaje, numEtapa, function() {
                rellenarEtapas(rutaId, idViaje);
            });
        
}

function obtenerSanitario(sanitarioId, callback) {
    fetch(`http://localhost:3000/api/sanitarios/${sanitarioId}`)
        .then(res => {
            if (!res.ok) return null;
            return res.json();
        })
        .then(sanitario => callback(sanitario))
        .catch(err => {
            console.error("Error al obtener el sanitario:", err);
            callback(null);
        });
}




var socket;

function conectarWebSocketPeregrino(idPeregrino) {
    // 🧼 Si ya hay una conexión previa, la cerramos
    if (socket && socket.readyState !== WebSocket.CLOSED) {
        socket.close();
    }

    socket = new WebSocket("ws://localhost:4444", "avisos");

    socket.onopen = function () {
        socket.send(JSON.stringify({
            operacion: "identificarse",
            tipo: "peregrino",
            id: idPeregrino
        }));
    };

    socket.onmessage = function (event) {
        const aviso = JSON.parse(event.data);
        mostrarAviso(aviso);
    };
}

function mostrarAviso(aviso) {
    const tbody = document.getElementById("avisosPeregrino");
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
        fila.style.backgroundColor = "#f8d7da"; // fondo rosado
    } else if (aviso.tipo === "mensaje_sanitario") {
        fila.innerHTML = `<td>${fecha}</td><td>El sanitario ${aviso.sanitario} ha escrito un mensaje</td>`;
        fila.style.backgroundColor = "#b6e9b6"; // fondo verde
    }
    
    

    tbody.appendChild(fila);
}



