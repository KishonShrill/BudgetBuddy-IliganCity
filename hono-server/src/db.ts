import mongoose from 'mongoose';

export async function connectToDatabase(uri: string): Promise<typeof mongoose> {
  if (!uri) {
    throw new Error('Database connection URI (HIDDEN_URI) is not configured.');
  }

  // Disable buffering globally so queries fail fast if connection drops
  mongoose.set('bufferCommands', false);

  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  const opts = {
    bufferCommands: false,
    serverSelectionTimeoutMS: 5000,
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

