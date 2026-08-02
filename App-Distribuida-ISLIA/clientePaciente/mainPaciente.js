/**
 * mainPaciente.js - Lógica Completa (FLUJO ESTRICTO)
 * Proyecto TFG Jesús Patiño Casas
 */

// --- VARIABLES DE ESTADO ---
let idPacienteActual = null;
let idSesionActual = null;
let momentoSeleccionado = null; 
let sesionSeleccionada = null;  
let cuestionarioPendiente = null; 
let erroresAuditivosGlobal = 0;
let estadoLetrasASE = [];

// --- 1. NAVEGACIÓN ---
function cambiarSeccion(idSeccion) {
    // 1. Limpiar campos si entramos en un cuestionario
    if (idSeccion.startsWith('Cuestionario') || idSeccion === 'TensionFrc' || idSeccion === 'ASE_CAM_ICU') {
        const contenedor = document.getElementById(idSeccion);
        if (contenedor) {
            // Limpia todos los inputs de texto/número
            contenedor.querySelectorAll('input').forEach(input => {
                if (input.type === 'radio' || input.type === 'checkbox') input.checked = false;
                else input.value = '';
            });
            // Limpia textareas
            contenedor.querySelectorAll('textarea').forEach(ta => ta.value = '');
            // Limpia clases activas/selected de los botones (opcional, pero recomendado)
            contenedor.querySelectorAll('.btn-likert, .btn-num, .btn-letra').forEach(b => b.classList.remove('active', 'selected'));
        }
    }

    // 2. Navegación normal
    document.querySelectorAll('.seccion').forEach(s => s.classList.remove('activa'));
    const destino = document.getElementById(idSeccion);
    if (destino) {
        destino.classList.add('activa');
        window.scrollTo(0, 0);
    }
}
// NUEVA FUNCIÓN PARA EL FLUJO ESTRICTO
function prepararCuestionario(nombreDiv) {
    cuestionarioPendiente = nombreDiv;
    
    // Llamamos al reset justo antes de mostrar la pantalla
    resetearSeleccionFase(); 
    
    cambiarSeccion('SeleccionFase');
}
// --- 2. COMUNICACIÓN REST ---
async function llamarAPI(ruta, metodo = 'GET', datos = null) {
    const config = { method: metodo, headers: { 'Content-Type': 'application/json' } };
    if (datos) config.body = JSON.stringify(datos);
    try {
        const res = await fetch(`http://localhost:3000/api${ruta}`, config);
        return await res.json();
    } catch (e) { console.error("Error API:", e); return null; }
}

// VAS DOLOR (llamada directa desde el HTML)
async function guardarVASDolor() {
    const val = document.getElementById('valor-vas-dolor').value;
    if (val === '') return alert("Introduce un valor de dolor");
    const res = await llamarAPI('/resultados/vas', 'POST', {
        id_paciente: idPacienteActual,
        sesion_id: idSesionActual,
        tipo_vas: 'Dolor',
        momento: momentoSeleccionado,
        valor: val
    });
    if (res) { alert("Guardado con éxito"); cambiarSeccion('paciente'); }
}

// VAS SALUD (llamada directa desde el HTML)
async function procesarGuardadoVAS() {
    const val = document.getElementById('valor-vas-salud').value;
    if (val === '') return alert("Introduce un valor de salud");
    const res = await llamarAPI('/resultados/vas', 'POST', {
        id_paciente: idPacienteActual,
        sesion_id: idSesionActual,
        tipo_vas: 'Salud',
        momento: momentoSeleccionado,
        valor: val
    });
    if (res) { alert("Guardado con éxito"); cambiarSeccion('paciente'); }
}

// --- 4. GESTIÓN DE CUESTIONARIOS (GUARDADO) ---

// VAS UNIFICADO (Salud, Ánimo, Dolor)
async function guardarVAS(tipo, inputId) {
    const val = document.getElementById(inputId).value;
    if (!val) return alert("Introduce un valor");

    const res = await llamarAPI('/resultados/vas', 'POST', {
        id_paciente: idPacienteActual,
        sesion_id: idSesionActual,
        tipo_vas: tipo,
        momento: momentoSeleccionado,
        valor: val
    });

    if (res) { alert("Guardado con éxito"); cambiarSeccion('paciente'); }
}

// VAS ÁNIMO (llamada directa desde el HTML)
async function guardarAnimo() {
    const val = document.getElementById('input-vas-animo').value;
    const res = await llamarAPI('/resultados/vas', 'POST', {
        id_paciente: idPacienteActual,
        sesion_id: idSesionActual,
        tipo_vas: 'Animo',
        momento: momentoSeleccionado,
        valor: val
    });
    if (res) { alert("Guardado con éxito"); cambiarSeccion('paciente'); }
}

// ANSIEDAD (Especial)
let ansiedadQ1 = null;
function seleccionarNumAnsiedad(num, elemento) {
    ansiedadQ1 = num;
    elemento.parentElement.querySelectorAll('.btn-num').forEach(b => b.classList.remove('selected'));
    elemento.classList.add('selected');
}

async function guardarAnsiedad() {
    if (ansiedadQ1 === null) return alert("Selecciona un valor");
    const res = await llamarAPI('/resultados/vas', 'POST', {
        id_paciente: idPacienteActual,
        sesion_id: idSesionActual,
        tipo_vas: 'Ansiedad',
        momento: momentoSeleccionado,
        valor: ansiedadQ1
    });
    if (res) { alert("Guardado"); cambiarSeccion('paciente'); }
}


// REGISTRAR NUEVO PACIENTE
async function guardarNuevoPaciente() {
    const nombre = document.getElementById('id-paciente-input').value.trim();
    if (!nombre) return alert("Introduce un nombre o ID de paciente");
    const res = await llamarAPI('/pacientes', 'POST', { nombre_id: nombre });
    if (res && res.id) {
        idPacienteActual = res.id;
        alert("Paciente registrado con éxito");
        cambiarSeccion('paciente');
    } else {
        alert("Error al registrar el paciente");
    }
}

// STAI-6
let respuestasSTAI = {};
function marcarSTAI(p, v, e) {
    respuestasSTAI[p] = v;
    e.parentElement.querySelectorAll('.btn-likert').forEach(b => b.classList.remove('active'));
    e.classList.add('active');
}

async function guardarSTAI6() {
    if (Object.keys(respuestasSTAI).length < 6) return alert("Responde a las 6 preguntas");
    const res = await llamarAPI('/resultados/stai6', 'POST', {
        id_paciente: idPacienteActual,
        sesion_id: idSesionActual,
        respuestas: respuestasSTAI
    });
    if (res) { alert("Guardado"); respuestasSTAI = {}; cambiarSeccion('paciente'); }
}

// RICHARDS-CAMPBELL
async function guardarRichardsCampbell() {
    const vals = { p1: document.getElementById('rc-p1').value, p2: document.getElementById('rc-p2').value, p3: document.getElementById('rc-p3').value, p4: document.getElementById('rc-p4').value, p5: document.getElementById('rc-p5').value };
    if (Object.values(vals).some(v => v === "")) return alert("Rellena las 5 valoraciones.");

    const res = await llamarAPI('/resultados/richards', 'POST', {
        id_paciente: idPacienteActual,
        sesion_id: idSesionActual,
        ...vals
    });
    if (res) { alert("Guardado"); cambiarSeccion('paciente'); }
}

// CAM-ICU
async function guardarCAM_Auditivo() {
    const res = await llamarAPI('/resultados/cam-icu', 'POST', {
        id_paciente: idPacienteActual,
        sesion_id: idSesionActual,
        errores_auditivos: erroresAuditivosGlobal
    });
    if (res) { alert("Guardado"); cambiarSeccion('paciente'); }
}

// TENSION Y FRC
async function guardarTensionFrc() {
    const res = await llamarAPI('/resultados/tension-frc', 'POST', {
        id_paciente: idPacienteActual,
        sesion_id: idSesionActual,
        momento: momentoSeleccionado,
        frc: document.getElementById('input-frc').value,
        tas: document.getElementById('input-tas').value,
        tad: document.getElementById('input-tad').value
    });
    if (res) { alert("Guardado"); cambiarSeccion('paciente'); }
}

// USEQ
async function guardarUSEQ() {
    const data = {
        id_paciente: idPacienteActual,
        sesion_id: idSesionActual,
        p1: document.querySelector('input[name="useq-p1"]:checked')?.value,
        p2: document.querySelector('input[name="useq-p2"]:checked')?.value,
        p3: document.querySelector('input[name="useq-p3"]:checked')?.value,
        p4: document.querySelector('input[name="useq-p4"]:checked')?.value,
        p5: document.querySelector('input[name="useq-p5"]:checked')?.value,
        p6: document.querySelector('input[name="useq-p6"]:checked')?.value,
        p7: document.getElementById('useq-p7').value,
        p8: document.getElementById('useq-p8').value
    };
    const res = await llamarAPI('/resultados/useq', 'POST', data);
    if (res) { alert("Guardado"); cambiarSeccion('paciente'); }
}

async function cargarListaPacientes() {
    cambiarSeccion("accesoPaciente");
    const pacientes = await llamarAPI('/pacientes');
    const tabla = document.getElementById('cuerpo-tabla-pacientes');
    if (!tabla || !pacientes) return;

    tabla.innerHTML = "";
    pacientes.forEach(p => {
        const fila = `
            <tr>
                <td>${p.nombre_id}</td>
                <td>${new Date(p.fecha_registro).toLocaleDateString()}</td>
                <td>
                    <button class="btn-seleccionar" onclick="seleccionarPaciente(${p.id})">
                        SELECCIONAR
                    </button>
                </td>
            </tr>
        `;
        tabla.innerHTML += fila;
    });
}

function seleccionarPaciente(id) {
    console.log("Paciente seleccionado con ID:", id);
    idPacienteActual = id;
    cambiarSeccion('paciente');
}

// --- 4. GESTIÓN DE SESIONES (SELECCIÓN) ---

function setMomento(valor) {
    momentoSeleccionado = valor;
    // Quitamos la clase 'seleccionado' a todos los botones de momento
    document.querySelectorAll('.btn-fase').forEach(b => b.classList.remove('seleccionado'));
    // Añadimos la clase al botón que se ha pulsado
    event.target.classList.add('seleccionado');
    console.log("Momento seleccionado:", momentoSeleccionado);
}

function setSesion(valor) {
    sesionSeleccionada = valor;
    // Quitamos la clase 'seleccionado' a todos los botones de sesión
    document.querySelectorAll('.btn-numero').forEach(b => b.classList.remove('seleccionado'));
    // Añadimos la clase al botón que se ha pulsado
    event.target.classList.add('seleccionado');
    console.log("Sesión seleccionada:", sesionSeleccionada);
}

async function confirmarFaseYEmpezar() {
    console.log("--- DEBUG CONFIRMACIÓN ---");
    console.log("Momento:", momentoSeleccionado);
    console.log("Sesión:", sesionSeleccionada);
    console.log("Cuestionario Pendiente:", cuestionarioPendiente);

    if (!momentoSeleccionado || !sesionSeleccionada) {
        return alert("Selecciona Momento y Sesión");
    }

    const res = await llamarAPI('/sesiones', 'POST', {
        paciente_id: idPacienteActual,
        momento: momentoSeleccionado,
        num_sesion: sesionSeleccionada
    });

    if (res && res.sesion_id) {
        idSesionActual = res.sesion_id;
        console.log("Sesión creada con ID:", idSesionActual);
        
        // Asegúrate de que las claves coincidan con lo que pones en el HTML
         const mapa = {
    "CuestionarioSTAI6": "CuestionarioSTAI6",
    "CuestionarioVASDolor": "CuestionarioVASDolor",
    "CuestionarioRichardsCampbell": "CuestionarioRichardsCampbell",
    "ASE_CAM_ICU": "ASE_CAM_ICU",
    "CuestionarioVASSalud": "CuestionarioVASSalud",
    "CuestionarioVASAnsiedad": "CuestionarioVASAnsiedad",
    "CuestionarioVASAnimo": "CuestionarioVASAnimo",
    "TensionFrc": "TensionFrc",
    "CuestionarioUSEQ": "CuestionarioUSEQ"
};
        
        const destino = mapa[cuestionarioPendiente];
        console.log("Destino mapeado:", destino);
        
        if (destino) {
            cambiarSeccion(destino);
        } else {
            alert("Error: No se encontró la página para " + cuestionarioPendiente);
        }
    } else {
        alert("Error al crear sesión en la base de datos.");
    }
}

function resetearSeleccionFase() {
    // 1. Resetear las variables de estado
    momentoSeleccionado = null;
    sesionSeleccionada = null;

    // 2. Quitar visualmente la clase 'seleccionado' de todos los botones en el HTML
    document.querySelectorAll('.btn-fase, .btn-numero').forEach(btn => {
        btn.classList.remove('seleccionado');
    });
    
    console.log("Selección de fase reseteada para nueva entrada.");
}

// CAM-ICU: lógica de los botones de letras
function resetearEstadoASE() {
    erroresAuditivosGlobal = 0;
    estadoLetrasASE = new Array(10).fill(false);
    document.getElementById('contador-errores-cam').innerText = '0';
}

function toggleLetra(indice, elemento) {
    // Las letras A están en posiciones 1, 5, 6, 8 (S-A-H-E-V-A-A-R-A-T)
    const letrasA = [1, 5, 6, 8];
    estadoLetrasASE[indice] = !estadoLetrasASE[indice];
    elemento.classList.toggle('activa');

    // Recalcular errores
    erroresAuditivosGlobal = 0;
    estadoLetrasASE.forEach((apretado, i) => {
        const deberiaApretar = letrasA.includes(i);
        if (deberiaApretar && !apretado) erroresAuditivosGlobal++; // No apretó en A
        if (!deberiaApretar && apretado) erroresAuditivosGlobal++; // Apretó en no-A
    });
    document.getElementById('contador-errores-cam').innerText = erroresAuditivosGlobal;
}

// Actualiza el indicador visual de categoría de dolor
function actualizarCategorizacionDolor(valor) {
    const status = document.getElementById('status-dolor');
    if (!status) return;
    const v = parseFloat(valor);
    if (isNaN(v)) { status.innerText = 'Esperando dato...'; status.className = 'status-box'; }
    else if (v <= 4) { status.innerText = '🟢 Dolor LEVE (0-4)'; status.className = 'status-box leve'; }
    else if (v <= 7) { status.innerText = '🟡 Dolor MODERADO (5-7)'; status.className = 'status-box moderado'; }
    else { status.innerText = '🔴 Dolor SEVERO (>7)'; status.className = 'status-box severo'; }
}