import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoMemoryServer: MongoMemoryServer | null = null;

export async function connectDatabase(): Promise<void> {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mplad_insight';

  try {
    // Attempt connecting to configured or local MongoDB instance with short timeout
    mongoose.set('strictQuery', false);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500,
    });
    console.log(`[Database] Connected to external MongoDB at ${uri.replace(/\/\/.*@/, '//***@')}`);
  } catch (err: any) {
    console.warn(`[Database] External MongoDB connection not available (${err.message}). Starting embedded In-Memory MongoDB engine...`);
    try {
      mongoMemoryServer = await MongoMemoryServer.create({
        instance: {
          dbName: 'mplad_insight_demo',
        },
      });
      const memoryUri = mongoMemoryServer.getUri();
      await mongoose.connect(memoryUri);
      console.log(`[Database] Connected successfully to embedded In-Memory MongoDB at ${memoryUri}`);
    } catch (memErr: any) {
      console.error('[Database] Fatal: Failed to initialize embedded In-Memory MongoDB', memErr);
      throw memErr;
    }
  }
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
}
