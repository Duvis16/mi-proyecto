const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3000;

// Simulación de base de datos con un JSON
let users = [];

app.use(cors());
app.use(bodyParser.json());

// Ruta de Login
app.post("/login", (req, res) => {
    const { username, password } = req.body;
    
    const user = users.find(u => u.nit === username);
    
    if (!user) {
        return res.json({ success: false, message: "NIT no registrado" });
    }

    if (user.password !== password) {
        return res.json({ success: false, message: "Contraseña incorrecta" });
    }

    res.json({ success: true, message: "Inicio de sesión exitoso" });
});

// Ruta de Registro
app.post("/register", (req, res) => {
    const { nit, email, phone, password } = req.body;

    if (users.find(u => u.nit === nit)) {
        return res.json({ success: false, message: "Este NIT ya está registrado" });
    }

    users.push({ nit, email, phone, password });
    console.log("Usuarios registrados:", users);
    res.json({ success: true, message: "Registro exitoso, ahora inicie sesión" });
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor corriendo en http://0.0.0.0:${PORT}`);
});