import admin from "firebase-admin";
import path from "path";

const serviceAccount = require(path.resolve("secrets/serviceAccountKey.json"));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    // databaseURL: "https://PROJECT_ID.firebaseio.com" // Solo si usás Realtime DB
  });
}

export const db = admin.firestore();

// 🔑 Esto es lo importante:
db.settings({ ignoreUndefinedProperties: true });

// export const rtdb = admin.database(); // Para Realtime Database
