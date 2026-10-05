import mongoose from 'mongoose';

let cachedPromise: Promise<typeof mongoose> | null = null;

export async function connectToDatabase(uri: string): Promise<typeof mongoose> {
  if (!uri) {
    throw new Error('Database connection URI (HIDDEN_URI) is not configured.');
  }

  // Disable buffering globally so queries fail fast if connection drops
  mongoose.set('bufferCommands', false);

  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  // If a connection is already in progress, reuse the pending promise
  if (cachedPromise && mongoose.connection.readyState === 2) {
    return cachedPromise;
  }

  const opts = {
    bufferCommands: false,
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
    maxPoolSize: 1,
  };

  cachedPromise = mongoose.connect(uri, opts).catch((err) => {
    cachedPromise = null;
    throw err;
  });

  return await cachedPromise;
}

export async function disconnectDatabase(): Promise<void> {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    cachedPromise = null;
  } catch (err) {
    console.error('Error disconnecting from database:', err);
  }
}


