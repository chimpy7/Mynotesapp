import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI ?? "";

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is missing from environment variables.");
}

type MongooseCache = {
  connection: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache ?? {
  connection: null,
  promise: null,
};

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectToDatabase() {
  if (cached.connection) {
    return cached.connection;
  }

  cached.promise ??= mongoose.connect(MONGODB_URI, {
    bufferCommands: false,
  });

  cached.connection = await cached.promise;

  return cached.connection;
}
