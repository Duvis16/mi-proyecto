const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");

const app = express();
const PORT = 3000;

// Configuración de MySQL
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Duvis1620*", // ⚠️ Usa variables de entorno
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

// 📌 Ruta de Inicio de Sesión (Verificar usuario y comparar contraseña)
app.post("/login", (req, res) => {
    const { nit, password } = req.body;

    console.log("📌 NIT recibido:", nit);
    console.log("📌 Contraseña recibida:", password);

    const sql = "SELECT * FROM usuarios WHERE nit = ?";
    db.query(sql, [nit], async (err, result) => {
        if (err) {
            console.error("❌ Error en la consulta SQL:", err);
            return res.json({ success: false, message: "Error en el servidor" });
        }

        console.log("📌 Resultado de la consulta:", result);

        if (result.length > 0) {
            const user = result[0];
            const passwordMatch = await bcrypt.compare(password, user.password);

            console.log("📌 Coincide la contraseña:", passwordMatch);

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

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
app.post("/register", async (req, res) => {
    const { nit, email, phone, password } = req.body;

    // 🔍 Validaciones del servidor
    if (!nit || !email || !phone || !password) {
        return res.json({ success: false, message: "Todos los campos son obligatorios." });
    }

    // Encriptar contraseña antes de guardarla
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = "INSERT INTO usuarios (nit, email, phone, password) VALUES (?, ?, ?, ?)";
    db.query(sql, [nit, email, phone, hashedPassword], (err, result) => {
        if (err) {
            console.error("❌ Error en el registro:", err);
            return res.json({ success: false, message: "Error en el servidor o NIT ya registrado." });
        }
        res.json({ success: true, message: "Registro exitoso." });
    });
});