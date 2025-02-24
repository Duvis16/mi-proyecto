const express = require("express");
const mysql = require("mysql");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
const PORT = 3000;
const SECRET_KEY = "claveSecreta123"; // 🔑 Clave para firmar JWT

app.use(express.json());
app.use(cors());

// Configuración de la BD
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "funza_db"
});

db.connect(err => {
    if (err) {
        console.error("❌ Error al conectar con la base de datos:", err);
    } else {
        console.log("✅ Conexión a la BD exitosa.");
    }
});

// 🟢 Ruta de LOGIN
app.post("/login", (req, res) => {
    const { nit, password } = req.body;

    const sql = "SELECT * FROM usuarios WHERE nit = ?";
    db.query(sql, [nit], async (err, result) => {
        if (err) {
            console.error("❌ Error en la consulta SQL:", err);
            return res.json({ success: false, message: "Error en el servidor" });
        }

        if (result.length > 0) {
            const user = result[0];
            const passwordMatch = await bcrypt.compare(password, user.password);

            if (passwordMatch) {
                // 🔐 Generar JWT
                const token = jwt.sign({ nit: user.nit, id: user.id }, SECRET_KEY, { expiresIn: "1h" });

                res.json({ success: true, message: "Inicio de sesión exitoso", token });
            } else {
                res.json({ success: false, message: "Contraseña incorrecta" });
            }
        } else {
            res.json({ success: false, message: "Usuario no encontrado" });
        }
    });
});

// 🟢 Ruta protegida (ejemplo)
app.get("/perfil", verifyToken, (req, res) => {
    res.json({ message: "Bienvenido al perfil", user: req.user });
});

// Middleware para verificar token
function verifyToken(req, res, next) {
    const token = req.headers["authorization"];
    if (!token) return res.status(401).json({ message: "Acceso denegado" });

    jwt.verify(token.split(" ")[1], SECRET_KEY, (err, decoded) => {
        if (err) return res.status(403).json({ message: "Token inválido" });
        req.user = decoded;
        next();
    });
}

app.listen(PORT, () => console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`));
