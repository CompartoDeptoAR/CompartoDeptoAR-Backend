import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import UsuarioRutas from './routes/usuarioRutas';
import PublicacionRutas from "./routes/PublicacionRutas";
import FavoritoRutas from "./routes/FavoritoRutas";
import AuthRutas from './routes/AuthRutas';
import ChatRutas from './routes/MensajesRutas';
import RecuperacionRutas from './routes/RecuperacionRutas';
import CalificacionRutas from "./routes/CalificacionRutas";
import ModeracionRutas from './routes/ModeracionRutas';
import ReporteRutas from './routes/ReporteRutas';
import ContactoRutas from './routes/ContactoRutas'

const app = express();
const port = process.env.PORT || 9000;

app.use(cors({
  origin: ["https://compartodeptoar.com"],
  methods: "GET,POST,PUT,DELETE",
  credentials: true
}));
app.use(express.json());
app.use(helmet());

app.get("/", (req, res) => {
  res.send("🚀 API funcionando!");
});


//para check si anda la bd, spoiler: Si anda je
app.post("/items", async (req, res) => {
  try {
    res.status(201).json({ mensaje: "POST /items OK", datos: req.body });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.get("/items", (_req, res) => {
  res.json({ mensaje: "GET /items OK" });
});

// Estas si van...
app.use("/api/usuarios", UsuarioRutas);
app.use("/api/publicaciones", PublicacionRutas);
app.use("/api/favoritos",FavoritoRutas);
app.use("/api/auth", AuthRutas);
app.use("/api/chat", ChatRutas);
app.use("/api/recuperacion", RecuperacionRutas);
app.use("/api/calificaciones", CalificacionRutas);
app.use("/api/moderacion", ModeracionRutas);
app.use("/api/reportes", ReporteRutas);
app.use("/api/contacto", ContactoRutas);


app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
