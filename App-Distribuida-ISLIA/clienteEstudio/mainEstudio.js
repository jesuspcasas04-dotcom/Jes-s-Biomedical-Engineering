let chartVAS = null;
let chartConstantes = null;

window.onload = function() {
    console.log("Portal Investigador Iniciado");
    cargarPacientesEstudiador();
};

function cambiarSeccion(id) {
    document.querySelectorAll('.seccion').forEach(s => s.classList.remove('activa'));
    document.getElementById(id).classList.add('activa');
}

// --- NÚCLEO CLIENTE RPC ---
// Función auxiliar que simula al cliente enviando peticiones POST al endpoint dinámico
async function llamarRPC(procedimiento, parametros = []) {
    try {
        const url = `http://localhost:3501/RPC/estudiador/${procedimiento}`;
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(parametros) 
        });
        return await res.json();
    } catch (e) {
        console.error("Fallo RPC:", e);
        return null;
    }
}

// --- FUNCIONES DE INTERFAZ ---

async function cargarPacientesEstudiador() {
    // Llamada RPC sin parámetros
    const pacientes = await llamarRPC("obtenerPacientes");
    const tabla = document.getElementById('cuerpo-tabla-estudiador');
    
    if(!pacientes || !tabla) return;
    tabla.innerHTML = "";
    
    pacientes.forEach(p => {
        tabla.innerHTML += `
            <tr>
                <td>${p.nombre_id}</td>
                <td>${new Date(p.fecha_registro).toLocaleDateString()}</td>
                <td>
                    <button class="btn-seleccionar" onclick="verEvolucionPaciente(${p.id}, '${p.nombre_id}')">
                        VER GRÁFICAS 
                    </button>
                </td>
            </tr>
        `;
    });
}

function volverAlListado() {
    cambiarSeccion('seccion-listado');
}

// --- MOTOR DE GRÁFICAS (CHART.JS) ---

async function verEvolucionPaciente(id_paciente, nombre) {
    document.getElementById('nombre-paciente-dashboard').innerText = `Paciente: ${nombre}`;
    cambiarSeccion('seccion-dashboard');

    // Llamada RPC con un parámetro (el ID del paciente dentro de un array)
    const datos = await llamarRPC("obtenerDatosCompletosPaciente", [id_paciente]);
    
    if (!datos || datos.error) return alert("Error al obtener los datos del paciente.");
    
    renderizarGraficas(datos);
}

// Variables globales para almacenar y destruir las instancias de las gráficas
let gSalud = null, gAnsiedad = null, gAnimo = null, gStai = null, gDolor = null, gRichards = null, gCam = null;

 function renderizarGraficas(datos) {
    // Eje X común: Representa el histórico de sesiones cronológicas por las que ha pasado el paciente
    const etiquetas = datos.sesiones.map(s => `${s.num_sesion} (${s.momento})`);

    // --- PROCESAMIENTO DE VECTORES DE DATOS ---

    // 1º VAS SALUD (0-100)
    const dataSalud = datos.sesiones.map(s => {
        const item = datos.vas.find(v => v.sesion_id === s.id && v.tipo_vas === 'Salud');
        return item ? parseFloat(item.valor) : null;
    });

    // 2º VAS ANSIEDAD (Filtramos solo la Pregunta 1 que es la escala de 0 a 10)
    const dataAnsiedad = datos.sesiones.map(s => {
        const item = datos.vas.find(v => v.sesion_id === s.id && v.tipo_vas === 'Ansiedad');
        return item ? parseFloat(item.valor) : null;
    });

    // 3º VAS ESTADO DE ÁNIMO (0-10)
    const dataAnimo = datos.sesiones.map(s => {
        const item = datos.vas.find(v => v.sesion_id === s.id && v.tipo_vas === 'Animo');
        return item ? parseFloat(item.valor) : null;
    });

    // 5º VAS DOLOR (0-10)
    const dataDolor = datos.sesiones.map(s => {
        const item = datos.vas.find(v => v.sesion_id === s.id && v.tipo_vas === 'Dolor');
        return item ? parseFloat(item.valor) : null;
    });

    // 4º STAI-6: Cálculo matemático del sumatorio total por sesión
    const dataStai6 = datos.sesiones.map(s => {
        const item = datos.stai6.find(v => v.sesion_id === s.id);
        if (!item) return null;
        // Sumamos los 6 ítems individuales guardados en la BD
        return (item.item1 || 0) + (item.item2 || 0) + (item.item3 || 0) + (item.item4 || 0) + (item.item5 || 0) + (item.item6 || 0);
    });

    // 6º RICHARDS-CAMPBELL: Cálculo matemático del sumatorio total por sesión
    const dataRichards = datos.sesiones.map(s => {
        const item = datos.richards.find(v => v.sesion_id === s.id);
        if (!item) return null;
        // Sumamos las 5 dimensiones del sueño guardadas en la BD
        return parseFloat(item.item1 || 0) + parseFloat(item.item2 || 0) + parseFloat(item.item3 || 0) + parseFloat(item.item4 || 0) + parseFloat(item.item5 || 0);
    });

    // 8º ASE DEL CAM-ICU (Número de errores)
    const dataCamIcu = datos.sesiones.map(s => {
        const item = datos.cam_icu.find(v => v.sesion_id === s.id);
        return item ? item.errores_auditivos : null;
    });

    // --- RENDERIZACIÓN INDIVIDUAL DE LAS 7 GRÁFICAS (CHART.JS) ---

    // Función auxiliar para ahorrarnos líneas de código repetitivas
    function crearGraficaLineal(instancia, elementId, label, datosVect, color, maxVal) {
        if (instancia) instancia.destroy();
        const ctx = document.getElementById(elementId).getContext('2d');
        return new Chart(ctx, {
            type: 'line',
            data: {
                labels: etiquetas,
                datasets: [{
                    label: label,
                    data: datosVect,
                    borderColor: color,
                    backgroundColor: color + '1A', // Añade transparencia para el fondo
                    borderWidth: 3,
                    tension: 0.2,
                    fill: true,
                    spanGaps: true
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: maxVal // Ajusta el techo clínico de la gráfica según el cuestionario
                    }
                }
            }
        });
    }

    // Dibujamos cada gráfica aplicando sus rangos de escala correspondientes
    gSalud = crearGraficaLineal(gSalud, 'chartVasSalud', 'Puntuación Salud', dataSalud, '#2ecc71', 100); // 0-100
    gAnsiedad = crearGraficaLineal(gAnsiedad, 'chartVasAnsiedad', 'Nivel de Ansiedad', dataAnsiedad, '#9b59b6', 10); // 0-10
    gAnimo = crearGraficaLineal(gAnimo, 'chartVasAnimo', 'Estado de Ánimo', dataAnimo, '#3498db', 10); // 0-10
    gDolor = crearGraficaLineal(gDolor, 'chartVasDolor', 'Intensidad del Dolor', dataDolor, '#e74c3c', 10); // 0-10
    gCam = crearGraficaLineal(gCam, 'chartCamIcu', 'Errores Auditivos', dataCamIcu, '#e67e22', 10); // 0-10
    
    // El STAI-6 sumado va de 6 a 24 puntos (o de 0 a 24 según tu codificación)
    gStai = crearGraficaLineal(gStai, 'chartStai6', 'Puntuación Total STAI-6', dataStai6, '#1abc9c', 24);
    
    // Richards-Campbell sumado son 5 preguntas del 0 al 10, por lo que el máximo teórico es 50 puntos
    gRichards = crearGraficaLineal(gRichards, 'chartRichards', 'Puntuación Total Sueño RC', dataRichards, '#34495e', 50);
}


// Variable global para guardar los datos recibidos del servidor
let datosCachePaciente = null;

async function verEvolucionPaciente(id_paciente, nombre) {
    document.getElementById('nombre-paciente-dashboard').innerText = `Paciente: ${nombre}`;
    cambiarSeccion('seccion-dashboard');

    const datos = await llamarRPC("obtenerDatosCompletosPaciente", [id_paciente]);
    if (!datos || datos.error) return alert("Error al obtener datos.");

    datosCachePaciente = datos; // Guardamos en caché
    renderizarSelectorSesiones(datos.sesiones); // NUEVA FUNCIÓN
    renderizarGraficas(datos);
}

function renderizarSelectorSesiones(sesiones) {
    const contenedor = document.getElementById('selector-sesiones-grid');
    contenedor.innerHTML = "";

    sesiones.forEach(s => {
        const btn = document.createElement('button');
        btn.innerText = `Sesión ${s.num_sesion} (${s.momento})`;
        btn.className = 'btn-seleccionar';
        btn.onclick = () => mostrarDetalleSesion(s);
        contenedor.appendChild(btn);
    });
}

function mostrarDetalleSesion(sesion) {
    const contenedor = document.getElementById('detalle-sesion-tabla');
    
    // Filtramos los datos de esta sesión específica
    const vasSesion = datosCachePaciente.vas.filter(v => v.sesion_id === sesion.id);
    
    // Construimos una tabla simple con los resultados
    let html = `<h4>Resultados Sesión ${sesion.num_sesion}</h4>
                <table style="width:100%; border: 1px solid #ddd;">
                    <thead><tr><th>Cuestionario</th><th>Valor</th></tr></thead>
                    <tbody>`;
    
    vasSesion.forEach(v => {
        html += `<tr><td>${v.tipo_vas}</td><td>${v.valor}</td></tr>`;
    });
    
    html += `</tbody></table>`;
    contenedor.innerHTML = html;
}

function renderizarSelectorSesiones(sesiones) {
    const contenedor = document.getElementById('selector-sesiones-grid');
    contenedor.innerHTML = "";

    // 1. Crear un mapa para guardar solo la ÚLTIMA sesión de cada tipo
    // (O si prefieres, agruparlas por ID)
    const sesionesUnicas = [];
    const vistas = new Set();

    sesiones.forEach(s => {
        // Creamos una clave única: "1-Antes"
        const clave = `${s.num_sesion}-${s.momento}`;
        if (!vistas.has(clave)) {
            sesionesUnicas.push(s);
            vistas.add(clave);
        }
    });

    // 2. Renderizar solo las únicas
    sesionesUnicas.forEach(s => {
        const btn = document.createElement('button');
        btn.innerText = `Sesión ${s.num_sesion} (${s.momento})`;
        btn.className = 'btn-seleccionar'; // Asegúrate de tener estilo para esto
        btn.onclick = () => mostrarDetalleSesion(s);
        contenedor.appendChild(btn);
    });
}

function mostrarDetalleSesion(sesion) {
    const contenedor = document.getElementById('detalle-sesion-tabla');
    
    // Recuperamos los datos de todos los cuestionarios
    const vasSesion = datosCachePaciente.vas.filter(v => v.sesion_id === sesion.id);
    const staiSesion = datosCachePaciente.stai6.find(s => s.sesion_id === sesion.id);
    const rcSesion = datosCachePaciente.richards.find(s => s.sesion_id === sesion.id);
    const camSesion = datosCachePaciente.cam_icu.find(s => s.sesion_id === sesion.id);
    const constSesion = datosCachePaciente.constantes.find(c => c.sesion_id === sesion.id);
    
    // Iniciamos la construcción de la tabla
    let html = `<h4>Detalles de la Sesión ${sesion.num_sesion} - ${sesion.momento}</h4>
                <table class="tabla-detalles-sesion">
                    <thead>
                        <tr><th>Categoría</th><th>Detalle / Valor</th></tr>
                    </thead>
                    <tbody>`;

    // 1. VAS (Salud, Ansiedad, Animo, Dolor)
    vasSesion.forEach(v => {
        html += `<tr><td><strong>VAS: ${v.tipo_vas}</strong></td><td>${v.valor}</td></tr>`;
    });

    // 2. STAI-6
    if (staiSesion) {
        const totalStai = (staiSesion.item1 || 0) + (staiSesion.item2 || 0) + (staiSesion.item3 || 0) + (staiSesion.item4 || 0) + (staiSesion.item5 || 0) + (staiSesion.item6 || 0);
        html += `<tr><td><strong>STAI-6 (Total)</strong></td><td>${totalStai}</td></tr>`;
    }

    // 3. Richards-Campbell
    if (rcSesion) {
        const totalRC = parseFloat(rcSesion.item1 || 0) + parseFloat(rcSesion.item2 || 0) + parseFloat(rcSesion.item3 || 0) + parseFloat(rcSesion.item4 || 0) + parseFloat(rcSesion.item5 || 0);
        html += `<tr><td><strong>Richards-Campbell (Total)</strong></td><td>${totalRC}</td></tr>`;
    }

    // 4. CAM-ICU
    if (camSesion) {
        html += `<tr><td><strong>CAM-ICU (Errores)</strong></td><td>${camSesion.errores_auditivos}</td></tr>`;
    }

    // 5. Constantes Vitales
    if (constSesion) {
        html += `<tr><td><strong>Frec. Cardíaca</strong></td><td>${constSesion.frecuencia_cardiaca || '-'} ppm</td></tr>
                 <tr><td><strong>Tensión Sistólica</strong></td><td>${constSesion.tas || '-'} mmHg</td></tr>
                 <tr><td><strong>Tensión Diastólica</strong></td><td>${constSesion.tad || '-'} mmHg</td></tr>`;
    }

    html += `</tbody></table>`;
    
    // Inyectamos todo el bloque de una sola vez
    contenedor.innerHTML = html;
}