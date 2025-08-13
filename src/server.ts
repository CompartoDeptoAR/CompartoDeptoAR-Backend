// Importamos nuestras dependencias
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import process from 'process';
// Creamos nuestra app express
const app = express();
// Leemos el puerto de las variables de entorno,
// si no está, usamos uno por default
const port = process.env.PORT || 9000;
// Configuramos los plugins
// Más adelante intentaremos entender mejor cómo funcionan estos plugins
app.use(cors());
app.use(bodyParser.json());
app.use(helmet());
// Mis endpoints van acá
// ...
// Levantamos el servidor en el puerto que configuramos
app.listen(port, () => {
console.log(`Example app listening on port ${port}`);
});