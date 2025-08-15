import admin from "firebase-admin";
import path from "path";

const serviceAccount = require(path.resolve("secrets/firebaseKeys.json"));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    //databaseURL: "https://PROJECT_ID.firebaseio.com" // Solo si uso Realtime DB
  });
}

export const db = admin.firestore(); // Para Firestore
// export const rtdb = admin.database(); // Para Realtime Database
