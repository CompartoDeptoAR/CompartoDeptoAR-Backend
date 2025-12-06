import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
  throw new Error(
    "FIREBASE_SERVICE_ACCOUNT_JSON no está definida. Crea la variable de entorno con el JSON completo."
  );
}

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "compartodeptoar-a6961.appspot.com", // <- nombre de tu bucket
  });
}

export const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true });

export const bucket = admin.storage().bucket(); // <- bucket de Storage
export { admin };
