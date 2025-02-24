const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt"); // 🔥 Para encriptar contraseñas

const app = express();
const PORT = 3000;

// Configuración de MySQL
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Duvis1620*", // ⚠️ Reemplázalo con variables de entorno
    database: "mi_proyecto"
});

// Conectar a MySQL
db.connect(err => {
    if (err) {
        console.error("❌ Error conectando a MySQL:", err);
        return;
    }
    console.log("✅ Conectado a MySQL");
});

app.use(cors());
app.use(bodyParser.json());

// 📌 Ruta de Registro (Guardar usuario en MySQL con contraseña encriptada)
app.post("/register", async (req, res) => {
    const { nit, email, phone, password } = req.body;

    if (!nit || !email || !phone || !password) {
        return res.status(400).json({ success: false, message: "Todos los campos son obligatorios" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10); // 🔐 Encriptar contraseña
        const sql = "INSERT INTO usuarios (nit, email, phone, password) VALUES (?, ?, ?, ?)";
        
        db.query(sql, [nit, email, phone, hashedPassword], (err, result) => {
            if (err) {
                console.error("❌ Error al registrar usuario:", err);
                return res.status(500).json({ success: false, message: "Error al registrar usuario" });
            }
            res.json({ success: true, message: "Registro exitoso" });
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error interno del servidor" });
    }
});

// 📌 Ruta de Inicio de Sesión (Verificar usuario y comparar contraseña)
app.post("/login", (req, res) => {
    const { nit, password } = req.body;

    const sql = "SELECT * FROM usuarios WHERE nit = ?";
    db.query(sql, [nit], async (err, result) => {
        if (err) {
            console.error("❌ Error al iniciar sesión:", err);
            return res.json({ success: false, message: "Error en el servidor" });
        }

        if (result.length > 0) {
            const user = result[0];
            const passwordMatch = await bcrypt.compare(password, user.password); // 🔐 Comparar contraseñas

            if (passwordMatch) {
                res.json({ success: true, message: "Inicio de sesión exitoso" });
            } else {
                res.json({ success: false, message: "Contraseña incorrecta" });
            }
        } else {
            res.json({ success: false, message: "Usuario no encontrado" });
        }
    });
});

// 🔥 Iniciar el servidor (al final)
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
