import { connectDatabase, disconnectDatabase } from '../config/db.js';
import { seedFullDatabase } from './seedData.js';

async function run() {
  console.log('[SeedRunner] Starting standalone database seed...');
  await connectDatabase();
  await seedFullDatabase(5200);
  console.log('[SeedRunner] Completed.');
  await disconnectDatabase();
  process.exit(0);
}

run().catch((err) => {
  console.error('[SeedRunner] Failed:', err);
  process.exit(1);
});
