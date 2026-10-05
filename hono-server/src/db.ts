import mongoose from 'mongoose';

export async function connectToDatabase(uri: string): Promise<typeof mongoose> {
  if (!uri) {
    throw new Error('Database connection URI (HIDDEN_URI) is not configured.');
  }

  // Disable buffering globally so queries fail fast if disconnected
  mongoose.set('bufferCommands', false);

  // If there is any stale socket from a previous frozen isolate context, clean it up first
  if (mongoose.connection.readyState !== 0) {
    try {
      await mongoose.disconnect();
    } catch {
      // Ignore disconnect errors on stale handles
    }
  }

  const opts = {
    bufferCommands: false,
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
    maxPoolSize: 1,
  };

  return await mongoose.connect(uri, opts);
}

export async function disconnectDatabase(): Promise<void> {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  } catch (err) {
    console.error('Error disconnecting from database:', err);
  }
}
