/*
  One-time migration script.
  Migrates existing Firestore user docs from old schema to new schema:
    - displayName → username (if username doesn't exist, uses displayName)
    - stats → mindfulStats + globalStats
    - ccStats → counterStats
    - removes displayName field

  Run with: node scripts/migrateUsers.js

  Requires: firebase-admin with a service account key.
  1. Go to Firebase Console → Project Settings → Service Accounts
  2. Click "Generate new private key" → save as scripts/serviceAccountKey.json
  3. Run the script
*/

const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function migrate() {
  const usersSnap = await db.collection("users").get();
  let migrated = 0;
  let skipped = 0;

  for (const doc of usersSnap.docs) {
    const data = doc.data();

    // Skip if already migrated (has mindfulStats)
    if (data.mindfulStats) {
      skipped++;
      continue;
    }

    const oldStats = data.stats || {};
    const oldCcStats = data.ccStats || {};

    const updates = {
      // Username: use existing username, fall back to displayName, then "anonymous"
      username: data.username || (data.displayName || "anonymous").toLowerCase().replace(/[^a-z0-9_]/g, "_").slice(0, 30) || "anonymous",

      // New stat objects
      globalStats: {
        totalGamesPlayed: oldStats.totalGamesPlayed || 0,
        videosWatched: oldStats.videosWatched || 0,
      },
      mindfulStats: {
        blackjackGames: oldStats.blackjackGames || 0,
        rouletteGames: oldStats.rouletteGames || 0,
        totalWins: oldStats.totalWins || 0,
        totalLosses: oldStats.totalLosses || 0,
        biggestWin: oldStats.biggestWin || 0,
        totalWagered: oldStats.totalWagered || 0,
      },
      counterStats: {
        handsPlayed: oldCcStats.handsPlayed || 0,
        correctCounts: oldCcStats.correctCounts || 0,
        accuracy: oldCcStats.accuracy || 0,
      },
    };

    // Remove old fields
    await doc.ref.update({
      ...updates,
      displayName: admin.firestore.FieldValue.delete(),
      stats: admin.firestore.FieldValue.delete(),
      ccStats: admin.firestore.FieldValue.delete(),
    });

    migrated++;
    console.log(`Migrated: ${doc.id} → @${updates.username}`);
  }

  console.log(`\nDone. Migrated: ${migrated}, Already up-to-date: ${skipped}`);
  process.exit(0);
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
