var express= require("express");
var app = express();
var cors = require("cors");
app.use(cors());
app.use(express.json());
const path = require("path");

// servir cliente Sanitario
app.use("/sanitario", express.static(path.join(__dirname, "clienteSanitario")));

// Peregrino con index2.html como archivo índice
app.use(
  "/peregrino",
  express.static(path.join(__dirname, "clientePeregrino"), { index: "index2.html" })
);

// opcional: redirigir raíz al cliente sanitario
app.get("/", (req, res) => res.redirect("/sanitario/"));


var mysql = require("mysql");
var database ={
    host:"localhost",
    user:"root",
    password:"",
    database:"base telemedicina",
    port:3306
};

var conexion = mysql.createConnection(database);
console.log("Conectando con la base de datos...");
conexion.connect(function(err){
    if(err){
        console.log("Se ha producido un error al conectar a la base de datos",err);
        process.exit();
    }else{
        console.log("Base de datos conectada correctamente!!!");
    }
});

app.get("/api/rutas", function(req,res){
    var sql = "SELECT * FROM rutas";
    conexion.query(sql, function(err, rutas){

        if (err){
            console.log("Error al realizar la select", err);
            res.status(500).json("Error al realizar la consulta");
        
        }else{
            console.log("Rutas:", rutas);
            res.json(rutas);
        }

    });
});

app.get("/api/rutas/:id/etapas", function(req,res){

    var idRuta = parseInt(req.params.id);
    var sql = "SELECT * FROM etapas WHERE ruta = ? ORDER BY orden";

    conexion.query(sql, [idRuta] , function(err, etapas){
        if (err){
            console.log("Error al realizar la select", err);
            res.status(500).json("Error al realizar la consulta");            
        }
        if (etapas.length ===0){
            console.log("No se han encontrado etapas para la ruta con id:", idRuta);
            res.status(404).json("No se han encontrado etapas para la ruta");
        }
        else{
            console.log("Etapas:", etapas);
            res.json(etapas);
        }
    })

});

app.post("/api/sanitarios/login",function(req,res){

    var login = req.body.login.trim();
    var password = req.body.password.trim();
    var sql = "SELECT * FROM sanitarios WHERE login = ? AND password = ?";
    
    conexion.query(sql, [login,password], function(err,sanitarios){
        if(err){
            console.log("Error al realizar la consulta", err);
            res.status(500).json("Error al realizar la consulta");
        }else{
            if(sanitarios.length ===1){
                console.log("Sanitario:", sanitarios[0]);
                res.status(200).json(sanitarios[0]);
            }else{
                console.log("No se ha encontrado el sanitario con login:", login);
                res.status(404).json("No se han encontrado el sanitario");
            }

        }
    });
});

app.post("/api/sanitarios", function(req,res){
    var nombre=req.body.nombre;
    var apellidos=req.body.apellidos;
    var login= req.body.login;
    var password= req.body.password;
    var sql = "INSERT INTO sanitarios (nombre, apellidos, login, password) VALUES(?,?,?,?)";
    conexion.query(sql, [nombre,apellidos,login,password], function(err,resultado){
        if(err){
            console.log("Error al realizar el insert", err);
            res.status(500).json("Error al realizar la insercion");
        }else{
            console.log("Sanitario insertado:", resultado);
            res.status(201).json(resultado.insertId);
        }
    });
});

// Ahora creamos un método put en el que se modifiquen los datos de un sanitario.
app.put("/api/sanitarios/:id", function(req, res) {
    var id = parseInt(req.params.id); // Cogemos el id de la api
    var { nombre, apellidos, login, password } = req.body; // Capturamos todos los nuevos datos del sanitario

    var sql= "UPDATE sanitarios SET nombre = ?, apellidos = ?, login = ?";
    var params=[nombre, apellidos, login]; // Creamos una lista con los nuevos parámetros introducidos por el sanitario.

    // 🔹 Solo actualizar la contraseña si se ha enviado
    if (password && password.trim() !== "") {
        sql += ", password = ?";
        params.push(password);
    }

    sql += " WHERE id = ?"; // Añadimos la condición a la sentencia.
    params.push(id); //Añadimos el id a los parámetros.

    conexion.query(sql,params, function(err, resultado) { //Creamos la conexión.

        if (err){
            console.error("Error al actualizar el sanitario:", err);
            return res.status(500).json({error: "Error al actualizar el sanitario"});
        } else if (resultado.affectedRows ===0){
            console.error("No se ha encontrado ningún sanitario con este id");
            return res.status(404).json({error:"Sanitario no encontrado"});
        } else{
            res.status(200).json({mensaje:"Sanitario modificado correctamente"});
        }
    });
});

app.get("/api/sanitarios/:id", function(req,res){

    //Primero buscamos en el html el id del sanitario.
    var id=parseInt(req.params.id);

    var sql= "SELECT id, nombre, apellidos, login, password FROM sanitarios WHERE id= ?";

    conexion.query(sql,[id], function(err, resultado){
        if (err){
            console.error("Error al encontrar el sanitario");
            return res.status(500).json({error:"Error al buscar el sanitario"});
        } else{
            return res.status(200).json(resultado[0]);
        }

    });

});

app.get("/api/peregrinos/:id", function(req,res){

    var id = parseInt(req.params.id);
    var sql = "SELECT * FROM peregrinos WHERE id =?";

    conexion.query(sql,[id], function(err,resultado){

        if (err){
            console.error("Error al encontrar el peregrino");
            return res.status(500).json({error:"Error al buscar el peregrino"});
        }else if (resultado.length ===0){

            console.error("No se ha encontrado ningún peregrino con este id");
            return res.status(404).json({error:"Peregrino no encontrado"});
        }
         else{
            return res.status(200).json(resultado[0]);
        }

    });

});

app.get("/api/viajes-activos", function(req,res){
    var sql = `
    SELECT 
      v.id,
      CONCAT(p.nombre, ' ', p.apellidos) AS nombre_peregrino,
      r.nombre AS nombre_ruta,
      v.fecha_inicio,
      v.peregrino AS peregrino
    FROM viajes v
    JOIN peregrinos p ON v.peregrino = p.id
    JOIN rutas r ON v.ruta = r.id
    WHERE v.fecha_fin IS NULL
  `;
    var idRuta = req.query.ruta;
    var params = [];
    if (idRuta){
        sql += " AND ruta = ?";
        params.push(idRuta);
    }
    
    conexion.query(sql, params ,function(err, viajes){
        if (err){
            console.error("Error al encontrar los viajes activos");
            return res.status(500).json({error:"Error al buscar los viajes activos"});
        }else if(viajes.length === 0){
            return res.status(404).json({error:"No se han encontrado viajes activos"});
        }
         else{
            return res.status(200).json(viajes);
        }
    });
});

app.get("/api/viajes/:id",function(req,res){
    var id = parseInt(req.params.id);
    var sql = "SELECT * FROM viajes WHERE id = ?";
    conexion.query(sql,[id], function(err,resultado){
        if (err){
            console.error("Error al encontrar el viaje");
            return res.status(500).json({error:"Error al buscar el viaje"});
        }else if (resultado.length ===0){
            console.error("No se ha encontrado ningún viaje con este id");
            return res.status(404).json({error:"Viaje no encontrado"});
        }else{
            return res.status(200).json(resultado[0]);
        }
});
});

app.get("/api/viajes/:id/jornadas", function(req,res){

    var id = parseInt(req.params.id);
    var sql = "SELECT * FROM jornadas WHERE viaje = ? ORDER BY fecha_inicio";
    var params = [id];

    conexion.query(sql,params, function(err,jornadas){

        if(err){
            console.error("Error al encontrar las jornadas");
            return res.status(500).json({error: "Error al buscar las jornadas"});

        }else if(jornadas.length === 0){
            console.error("No se han encontrado jornadas asociadas a ese viaje");
            return res.status(404).json({error: "Error no se han encontrado jornadas"});
        }else{
            return res.status(200).json(jornadas);
        }

    });

});

app.get("/api/viajes/:id/mensajes", function(req,res){

    var id = parseInt(req.params.id);
    var sql = "SELECT * FROM mensajes WHERE viaje= ?";
    var params = [id];

    conexion.query(sql,params, function(err,mensajes){
        if(err){
            console.error("Error al encontrar los mensajes");
            return res.status(500).json({error: "Error al buscar los mensajes"});
        }else if(mensajes.length === 0){
            console.error("No se han encontrado mensajes asociados a ese viaje");
            return res.status(404).json({error: "Error no se han encontrado mensajes"});
        }else{
            return res.status(200).json(mensajes);
        }
    });

});

app.post("/api/viajes/:id/mensaje", function(req,res){

    var idViaje = parseInt(req.params.id);
    var { texto, etapa, sanitario } = req.body;
    
    // Validaciones básicas
  if (!texto || !etapa) {
    return res.status(400).json({ error: "Faltan datos obligatorios" });
  }

  

  var params= [sanitario, idViaje, texto,etapa];
  var sql = "INSERT INTO mensajes (sanitario, viaje, texto, fecha, etapa) VALUES (?, ?, ?, NOW(), ?)";

    conexion.query(sql, params, function(err, resultado) {
        if (err) {
            console.error("Error al insertar el mensaje:", err);
            return res.status(500).json({ error: "Error al insertar el mensaje" });
        }else {
            console.log("Mensaje insertado:", resultado);
            return res.status(201).json({ mensaje: "Mensaje insertado correctamente", id: resultado.insertId });
        }
    });
});


app.delete("/api/mensajes/:id", function(req,res){

    var id = parseInt(req.params.id);
    var sql = "DELETE FROM mensajes WHERE id = ?";
    conexion.query(sql, [id], function(err, resultado){
        if (err){
            console.error("Error al eliminar el mensaje:", err);
            return res.status(500).json({error: "Error al eliminar el mensaje"});
        } else if (resultado.affectedRows ===0){
            console.error("No se ha encontrado ningún mensaje con este id");
            return res.status(404).json({error:"Mensaje no encontrado"});
        } else{
            return res.status(200).json({mensaje:"Mensaje eliminado correctamente"});
        }
    });


});

app.listen(3000, () => console.log("Servidor en http://localhost:3000"));





