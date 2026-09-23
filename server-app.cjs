function createApp({ express, db, pickLevels, validateSolution, now = Date.now }) {
  const app = express();
  app.use(express.json({ limit: '32kb' }));
  app.use('/api', (req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
  });
  const validId = (id) => typeof id === 'string' && /^[a-zA-Z0-9-]{16,64}$/.test(id);
  const fail = (status, message) => Object.assign(new Error(message), { status });
  const result = (id, data) => ({ id, ...data });

  app.get('/api/hello', (req, res) => res.json({ greeting: 'Eight Queens DEMO' }));

  app.get('/api/runs', async (req, res) => {
    const snapshot = await db.collection('runs').where('status', '==', 'completed').get();
    const runs = snapshot.docs.map((doc) => result(doc.id, doc.data()));
    runs.sort((a, b) => b.completedAt - a.completedAt);
    res.json({ runs });
  });

  app.get('/api/runs/:id', async (req, res) => {
    if (!validId(req.params.id)) throw fail(400, 'Invalid run ID.');
    const snapshot = await db.collection('runs').doc(req.params.id).get();
    if (!snapshot.exists) throw fail(404, 'This run could not be found. Start a new run.');
    res.json({ run:result(snapshot.id, snapshot.data()), serverNow: now() });
  });

  app.post('/api/runs', async (req, res) => {
    const id = req.body?.id;
    if (!validId(id)) throw fail(400, 'A valid run ID is required.');
    const ref = db.collection('runs').doc(id);
    const run = await db.runTransaction(async (transaction) => {
      const existing = await transaction.get(ref);
      if (existing.exists) return result(id, existing.data());
      const data = { status: 'playing', startedAt: now(), completedAt: null,
        durationMs: null, levels: pickLevels(), solutions: [] };
      transaction.set(ref, data);
      return result(id, data);
    });
    res.status(201).json({ run, serverNow: now() });
  });

  app.delete('/api/runs/:id', async (req, res) => {
    if (!validId(req.params.id)) throw fail(400, 'Invalid run ID.');
    const ref = db.collection('runs').doc(req.params.id);
    await db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(ref);
      if (snapshot.exists && snapshot.data().status !== 'completed') transaction.delete(ref);
    });
    res.json({ deleted: true });
  });

  app.post('/api/runs/:id/solutions', async (req, res) => {
    if (!validId(req.params.id)) throw fail(400, 'Invalid run ID.');
    const { levelIndex, positions } = req.body || {};
    if (!Number.isInteger(levelIndex) || levelIndex < 0) {
      throw fail(400, 'Choose a valid puzzle.');
    }

    const receivedAt = now();
    const ref = db.collection('runs').doc(req.params.id);
    const run = await db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(ref);
      if (!snapshot.exists) throw fail(404, 'This run could not be found.');
      const data = snapshot.data();
      if (data.status === 'cancelled') throw fail(409, 'This run was cancelled.');
      if (levelIndex < data.solutions.length) return result(ref.id, data);
      if (data.status !== 'playing' || levelIndex !== data.solutions.length) {
        throw fail(409, 'Solve the current puzzle before continuing.');
      }
      const message = validateSolution(data.levels[levelIndex], positions);
      if (message) throw fail(400, message);
      const cleaned = positions.map(({ type, row, col }) => ({ type, row, col }));
      data.solutions.push({ levelIndex, positions: cleaned, solvedAt: receivedAt });
      if (data.solutions.length === data.levels.length) {
        data.status = 'completed';
        data.completedAt = receivedAt;
        data.durationMs = Math.max(0, receivedAt - data.startedAt);
      }
      transaction.set(ref, data);
      return result(ref.id, data);
    });
    res.json({ run, serverNow: now() });
  });

  app.use('/api', (req, res) => res.status(404).json({ error: 'Unknown API endpoint.' }));
  app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    const status = error.status || 500;
    if (status >= 500) console.error('Database request failed:', error.message);
    res.status(status).json({ error: status >= 500
      ? 'The database could not be reached. Check the server and try again.' : error.message });
  });
  return app;
}

module.exports = { createApp };
