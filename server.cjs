require('dotenv').config();
const express = require('express');
const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { createApp } = require('./server-app.cjs');
const { createMemoryDb } = require('./memory-db.cjs');

async function start() {
  const { pickLevels } = await import('./shared/catalog.js');
  const { validateSolution } = await import('./shared/game.js');
  let db;
  let storage;
  if (process.env.FIREBASE_PROJECT_ID) {
    initializeApp({ credential: applicationDefault(), projectId: process.env.FIREBASE_PROJECT_ID });
    db = getFirestore();
    await db.collection('runs').limit(1).get();
    storage = 'Firestore';
  } else {
    db = createMemoryDb();
    storage = 'server memory (no .env found; runs reset when the backend restarts)';
  }
  const app= createApp({ express, db, pickLevels, validateSolution });
  const port =Number(process.env.PORT || 8080);
  app.listen(port, '127.0.0.1', () => console.log(`Backend running on http://127.0.0.1:${port}, saving to ${storage}`));
}

start().catch((error) => {
  console.error('Could not start the backend:', error.message);
  console.error('Check your .env and Firebase key, or delete .env to run without Firestore.');
  process.exitCode = 1;
});
