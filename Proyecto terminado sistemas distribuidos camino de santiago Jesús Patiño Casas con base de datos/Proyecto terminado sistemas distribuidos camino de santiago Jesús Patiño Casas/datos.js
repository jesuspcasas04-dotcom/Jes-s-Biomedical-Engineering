
var rutas= [{ "id": 1, "nombre": "Camino Francés", "distancia": 780 },
      { "id": 2, "nombre": "Camino Portugués", "distancia": 620 },
      { "id": 3, "nombre": "Camino del Ebro", "distancia": 930 },
      { "id": 4, "nombre": "Camino Primitivo", "distancia": 325 },
      { "id": 5, "nombre": "Camino de los Blendios", "distancia": 131 }
    ];
    

  
   var etapas= [
      { "ruta": 1, "orden": 1, "origen": "Saint-Jean-Pied-de-Port", "destino": "Roncesvalles", "dificultad": 7, "desnivel": 1400, "distancia": 25 },
      { "ruta": 1, "orden": 2, "origen": "Roncesvalles", "destino": "Zubiri", "dificultad": 5, "desnivel": 700, "distancia": 22 },
      { "ruta": 1, "orden": 3, "origen": "Zubiri", "destino": "Pamplona", "dificultad": 4, "desnivel": 300, "distancia": 20 },
      { "ruta": 1, "orden": 4, "origen": "Pamplona", "destino": "Puente la Reina", "dificultad": 3, "desnivel": 400, "distancia": 23 },
      { "ruta": 1, "orden": 5, "origen": "Puente la Reina", "destino": "Estella", "dificultad": 4, "desnivel": 350, "distancia": 22 },
  
      { "ruta": 2, "orden": 1, "origen": "Lisboa", "destino": "Alverca do Ribatejo", "dificultad": 4, "desnivel": 200, "distancia": 24 },
      { "ruta": 2, "orden": 2, "origen": "Alverca do Ribatejo", "destino": "Azambuja", "dificultad": 3, "desnivel": 150, "distancia": 20 },
      { "ruta": 2, "orden": 3, "origen": "Azambuja", "destino": "Santarém", "dificultad": 4, "desnivel": 250, "distancia": 32 },
  
      { "ruta": 3, "orden": 1, "origen": "Deltebre", "destino": "Tortosa", "dificultad": 5, "desnivel": 100, "distancia": 25 },
      { "ruta": 3, "orden": 2, "origen": "Tortosa", "destino": "Gandesa", "dificultad": 6, "desnivel": 400, "distancia": 35 },
  
      { "ruta": 4, "orden": 1, "origen": "Oviedo", "destino": "Grado", "dificultad": 6, "desnivel": 400, "distancia": 25 },
      { "ruta": 4, "orden": 2, "origen": "Grado", "destino": "Salas", "dificultad": 5, "desnivel": 350, "distancia": 22 },
  
      { "ruta": 5, "orden": 1, "origen": "Suances", "destino": "Torrelavega", "dificultad": 3, "desnivel": 150, "distancia": 18 },
      { "ruta": 5, "orden": 2, "origen": "Torrelavega", "destino": "Reinosa", "dificultad": 6, "desnivel": 800, "distancia": 42 }
    ];
  
  
    
  
  var sanitarios= [
      { "id": 1, "nombre": "Dr. Juan", "apellidos": "Pérez", "login": "juanp", "password": "1234" },
      { "id": 2, "nombre": "Dr. Javier", "apellidos": "López", "login": "javion", "password": "1234" },
      { "id": 3, "nombre": "Dr. Jesús", "apellidos": "Patiño", "login": "chess2", "password": "1234" }
    ];
  
  
    
  var peregrinos = [
    { "id": 101, "nombre": "María", "apellidos": "López", "fecha_nacimiento": new Date("1990-05-12"), "genero": "M", "altura": 165, "peso": 60, "codigo_acceso": "ABC123" },
    { "id": 102, "nombre": "Cristian", "apellidos": "Such", "fecha_nacimiento": new Date("2004-05-09"), "genero": "NS/ND", "altura": 183, "peso": 77, "codigo_acceso": "03680" },
    { "id": 103, "nombre": "Hugo", "apellidos": "Molina", "fecha_nacimiento": new Date("2003-11-07"), "genero": "M", "altura": 180, "peso": 74, "codigo_acceso": "03681" },
    { "id": 104, "nombre": "Javier", "apellidos": "López", "fecha_nacimiento": new Date("2004-05-13"), "genero": "H", "altura": 196, "peso": 100, "codigo_acceso": "696969" }
  ];

    
  var viajes = [
    { "id": 1, "peregrino": 101, "ruta": 1, "fecha_inicio": new Date("2024-02-01"), "fecha_fin": new Date("2024-03-10"), "etapa_origen": 1, "etapa_destino": 5 },
    { "id": 2, "peregrino": 102, "ruta": 2, "fecha_inicio": new Date("2024-02-05"), "fecha_fin": null, "etapa_origen": 1, "etapa_destino": 2 },
    { "id": 3, "peregrino": 103, "ruta": 3, "fecha_inicio": new Date("2024-01-20"), "fecha_fin": new Date("2024-02-15"), "etapa_origen": 1, "etapa_destino": 2 },
    { "id": 4, "peregrino": 104, "ruta": 4, "fecha_inicio": new Date("2024-02-10"), "fecha_fin": null, "etapa_origen": 1, "etapa_destino": 1 },
    { "id": 5, "peregrino": 101, "ruta": 5, "fecha_inicio": new Date("2024-01-15"), "fecha_fin": new Date("2024-01-25"), "etapa_origen": 1, "etapa_destino": 2 },
    { "id": 6, "peregrino": 102, "ruta": 1, "fecha_inicio": new Date("2024-01-30"), "fecha_fin": new Date("2024-03-05"), "etapa_origen": 2, "etapa_destino": 5 },
    { "id": 7, "peregrino": 103, "ruta": 2, "fecha_inicio": new Date("2024-02-12"), "fecha_fin": null, "etapa_origen": 1, "etapa_destino": 3 },
    { "id": 8, "peregrino": 104, "ruta": 3, "fecha_inicio": new Date("2024-02-15"), "fecha_fin": new Date("2024-03-10"), "etapa_origen": 1, "etapa_destino": 2 },
    { "id": 9, "peregrino": 101, "ruta": 2, "fecha_inicio": new Date("2024-03-01"), "fecha_fin": null, "etapa_origen": 1, "etapa_destino": 3 }
  ];

    
  var jornadas = [
    // Viaje 1 (María)
    { "viaje": 1, "etapa": 1, "fecha_inicio": new Date("2024-02-01T08:00:00"), "fecha_fin": new Date("2024-02-01T16:00:00") },
    { "viaje": 1, "etapa": 2, "fecha_inicio": new Date("2024-02-02T07:30:00"), "fecha_fin": new Date("2024-02-02T15:00:00") },
    { "viaje": 1, "etapa": 3, "fecha_inicio": new Date("2024-02-03T08:00:00"), "fecha_fin": new Date("2024-02-03T14:30:00") },
    { "viaje": 1, "etapa": 4, "fecha_inicio": new Date("2024-02-04T07:45:00"), "fecha_fin": new Date("2024-02-04T15:45:00") },
    { "viaje": 1, "etapa": 5, "fecha_inicio": new Date("2024-02-05T08:15:00"), "fecha_fin": new Date("2024-02-05T16:30:00") },

    // Viaje 2 (Cristian)
    { "viaje": 2, "etapa": 1, "fecha_inicio": new Date("2024-02-05T09:00:00"), "fecha_fin": new Date("2024-02-05T17:00:00") },
    { "viaje": 2, "etapa": 2, "fecha_inicio": new Date("2024-02-06T08:30:00"), "fecha_fin": new Date("2024-02-06T15:00:00") },
    { "viaje": 2, "etapa": 3, "fecha_inicio": new Date("2024-02-07T08:00:00"), "fecha_fin": new Date("2024-02-07T15:30:00") },
  
    // Viaje 3 (Hugo)
    { "viaje": 3, "etapa": 1, "fecha_inicio": new Date("2024-01-20T07:45:00"), "fecha_fin": new Date("2024-01-20T15:30:00") },
    { "viaje": 3, "etapa": 2, "fecha_inicio": new Date("2024-01-21T08:15:00"), "fecha_fin": new Date("2024-01-21T16:00:00") },
    { "viaje": 3, "etapa": 3, "fecha_inicio": new Date("2024-01-22T07:30:00"), "fecha_fin": new Date("2024-01-22T15:00:00") },
  
    // Viaje 4 (Javier)
    { "viaje": 4, "etapa": 1, "fecha_inicio": new Date("2024-02-10T08:00:00"), "fecha_fin": new Date("2024-02-10T16:30:00") },
    { "viaje": 4, "etapa": 2, "fecha_inicio": new Date("2024-02-11T07:45:00"), "fecha_fin": new Date("2024-02-11T15:00:00") },

    // Viaje 5 (María)
    { "viaje": 5, "etapa": 1, "fecha_inicio": new Date("2024-01-15T08:00:00"), "fecha_fin": new Date("2024-01-15T16:00:00") },
    { "viaje": 5, "etapa": 2, "fecha_inicio": new Date("2024-01-16T07:30:00"), "fecha_fin": new Date("2024-01-16T15:30:00") },

    // Viaje 6 (Cristian)
    { "viaje": 6, "etapa": 1, "fecha_inicio": new Date("2024-01-30T08:00:00"), "fecha_fin": new Date("2024-01-30T16:30:00") },
    { "viaje": 6, "etapa": 2, "fecha_inicio": new Date("2024-01-31T07:45:00"), "fecha_fin": new Date("2024-01-31T15:00:00") },

    // Viaje 7 (Hugo)
    { "viaje": 7, "etapa": 1, "fecha_inicio": new Date("2024-02-12T08:30:00"), "fecha_fin": new Date("2024-02-12T16:00:00") },
    { "viaje": 7, "etapa": 2, "fecha_inicio": new Date("2024-02-13T08:00:00"), "fecha_fin": new Date("2024-02-13T15:30:00") },

    // Viaje 8 (Javier)
    { "viaje": 8, "etapa": 1, "fecha_inicio": new Date("2024-02-15T08:00:00"), "fecha_fin": new Date("2024-02-15T16:00:00") },
    { "viaje": 8, "etapa": 2, "fecha_inicio": new Date("2024-02-16T07:30:00"), "fecha_fin": new Date("2024-02-16T15:00:00") },

    // Viaje 9 (María)
    { "viaje": 9, "etapa": 1, "fecha_inicio": new Date("2024-03-01T08:30:00"), "fecha_fin": new Date("2024-03-01T16:30:00") },
    { "viaje": 9, "etapa": 2, "fecha_inicio": new Date("2024-03-02T08:00:00"), "fecha_fin": new Date("2024-03-02T15:30:00") }
];



 var mensajes = [
    { "id": 1, "sanitario": null, "viaje": 1, "texto": "Llegué a Roncesvalles sin problemas.", "fecha": new Date("2024-02-01T18:00:00"), "etapa": 1 },
    { "id": 2, "sanitario": 1, "viaje": 1, "texto": "Revisión médica en Pamplona. Todo en orden.", "fecha": new Date("2024-02-03T19:30:00"), "etapa": 3 },
    { "id": 3, "sanitario": null, "viaje": 2, "texto": "Día duro, pero llegué a Alverca do Ribatejo.", "fecha": new Date("2024-02-05T20:00:00"), "etapa": 1 },
    { "id": 4, "sanitario": 2, "viaje": 3, "texto": "Peregrino con dolor muscular en Tortosa.", "fecha": new Date("2024-01-20T10:15:00"), "etapa": 1 },
    { "id": 5, "sanitario": null, "viaje": 4, "texto": "Primera etapa completada en Oviedo.", "fecha": new Date("2024-02-10T14:45:00"), "etapa": 1 }
];


module.exports.rutas=rutas;
module.exports.etapas=etapas;
module.exports.sanitarios=sanitarios;
module.exports.peregrinos=peregrinos;
module.exports.viajes=viajes;
module.exports.jornadas=jornadas;
module.exports.mensajes=mensajes;

