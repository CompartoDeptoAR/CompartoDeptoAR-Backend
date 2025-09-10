import admin from "firebase-admin";
import path from "path";
import fs from "fs";

let serviceAccountPath;

// 👇 Primero probamos si existe el secret file en Render
if (fs.existsSync("/etc/secrets/firebaseKeys.json")) {
  serviceAccountPath = "/etc/secrets/firebaseKeys.json";
} else {
  // 👇 Si no existe, usamos el de tu compu (local dev)
  serviceAccountPath = path.resolve("secrets/firebaseKeys.json");
}

const serviceAccount = require(serviceAccountPath);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    // databaseURL: "https://PROJECT_ID.firebaseio.com"
  });
}

export const db = admin.firestore();

// 🔑 Ignorar propiedades undefined
db.settings({ ignoreUndefinedProperties: true });


// export const rtdb = admin.database(); // Para Realtime Database
