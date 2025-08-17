import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import UsuarioRutas from './routes/UsuarioRutas';
import AuthRutas from './routes/AuthRutas';

const app = express();
const port = process.env.PORT || 9000;

app.use(cors());
app.use(express.json());
app.use(helmet());

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

// Estas si van...bueh, dos por ahora una je
app.use("/api/usuarios", UsuarioRutas);
app.use("/api/auth", AuthRutas);

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
