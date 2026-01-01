import * as admin from "firebase-admin";
import * as fs from "fs";
import * as path from "path";

const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function exportCollection(collectionName: string): Promise<void> {
  const snapshot = await db.collection(collectionName).get();

  const data = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  const filePath = path.join(__dirname, `${collectionName}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

  console.log(`✅ Exported ${collectionName}`);
}

async function run(): Promise<void> {
  const collections = await db.listCollections();

  for (const collection of collections) {
    await exportCollection(collection.id);
  }

  console.log("🎉 Firestore export complete");
}

run().catch(err => {
  console.error("❌ Export failed:", err);
});
