import admin from "firebase-admin";
import path from "path";
import fs from "fs";

let serviceAccountPath;

if (fs.existsSync("/etc/secrets/firebaseKeys.json")) {
  serviceAccountPath = "/etc/secrets/firebaseKeys.json";
} else {
  serviceAccountPath = path.resolve("secrets/firebaseKeys.json");
}

const serviceAccount = require(serviceAccountPath);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const db = admin.firestore();

db.settings({ ignoreUndefinedProperties: true });


export { admin };
