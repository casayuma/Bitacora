/**
 * Migración de la Bitácora histórica (Excel) hacia Firestore.
 *
 * USO:
 *   1. npm install firebase-admin
 *   2. Descarga tu Service Account Key desde:
 *      Firebase Console > Configuración del proyecto > Cuentas de servicio
 *      > Generar nueva clave privada. Guárdala como "serviceAccountKey.json"
 *      en esta misma carpeta (NO la subas a GitHub, es privada).
 *   3. node migrate.js
 *
 * Este script solo AGREGA documentos nuevos a la colección "bitacora".
 * Todos quedan marcados con historico: true y pendienteVivo: false,
 * es decir, aparecen en el Historial pero NO en la bandeja de Pendientes
 * Abiertos (para no revivir cientos de pendientes ya resueltos en la
 * práctica pero nunca cerrados formalmente en el Excel).
 */

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
const records = require('./bitacora_historico.json');

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

async function migrar(){
  const BATCH_SIZE = 400;
  let migrados = 0;

  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const chunk = records.slice(i, i + BATCH_SIZE);
    const batch = db.batch();

    chunk.forEach(rec => {
      const ref = db.collection('bitacora').doc();
      const fecha = rec.fecha ? admin.firestore.Timestamp.fromDate(new Date(rec.fecha + 'T12:00:00')) : null;
      batch.set(ref, {
        fecha,
        turno: rec.turno,
        autor: rec.autor,
        asunto: rec.asunto,
        detalle: rec.detalle,
        seguimientoLegacy: rec.seguimientoLegacy,
        estatus: rec.estatus,
        responsable: rec.responsable,
        seguimientos: [],
        historico: true,
        pendienteVivo: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });

    await batch.commit();
    migrados += chunk.length;
    console.log(`Migrados ${migrados} / ${records.length}`);
  }

  console.log('Migración completa ✓');
}

migrar().catch(err => {
  console.error('Error en migración:', err);
  process.exit(1);
});
