// Importamos nuestras dependencias
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import process from 'process';
import { db } from "./config/firebase";

const app = express();
const port = process.env.PORT || 9000;

app.use(cors());
app.use(bodyParser.json());
app.use(helmet());

// Mis endpoints van acá
// Crear un documento
app.post("/items", async (req, res) => {
  try {
    const docRef = await db.collection("items").add({
      name: req.body.name,
      price: req.body.price,
      createdAt: new Date()
    });
    res.status(201).json({ id: docRef.id });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Leer un documento
app.get("/items/:id", async (req, res) => {
  try {
    const snap = await db.collection("items").doc(req.params.id).get();
    if (!snap.exists) return res.status(404).send("No existe");
    res.json(snap.data());
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Listar todos
app.get("/items", async (_req, res) => {
  try {
    const querySnap = await db.collection("items").get();
    const items = querySnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});
// Levantamos el servidor en el puerto que configuramos
app.listen(port, () => {
console.log(`Example app listening on port ${port}`);
});