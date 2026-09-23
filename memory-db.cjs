function createMemoryDb() {
  const collections = new Map();
  const table = (name) => {
    if (!collections.has(name)) collections.set(name, new Map());
    return collections.get(name);
  };
  const snapshot = (docs, id) => ({
    id,exists: docs.has(id), data: () => structuredClone(docs.get(id)),
  });

  function collection(name) {
    const docs = table(name);
    const all = () => [...docs.keys()].map((id) => snapshot(docs, id));
    return {
      doc: (id) => ({ id, docs, get: async () => snapshot(docs, id) }),
      where: (field, op, value) => ({
        get: async () => ({ docs: all().filter((doc) => op === '==' && doc.data()[field] === value) }),
      }),
      limit: () => ({ get: async () => ({ docs: all() }) }),
    };
  }

  let queue = Promise.resolve();
  function runTransaction(work) {
    const transaction = {
      get: async (ref) => snapshot(ref.docs, ref.id),
      set: (ref, data) => { ref.docs.set(ref.id, structuredClone(data)); },
      update: (ref, fields) => { ref.docs.set(ref.id, { ...ref.docs.get(ref.id), ...structuredClone(fields) }); },
      delete: (ref) => { ref.docs.delete(ref.id); },
    };
    const result = queue.then(() => work(transaction));
    queue = result.catch(() => {});
    return result;
  }

  return { collection, runTransaction };
}

module.exports = { createMemoryDb };
