// This approach is taken from https://github.com/vercel/next.js/tree/canary/examples/with-mongodb
import { MongoClient, ServerApiVersion } from "mongodb";

import { hasMongoUri } from "@/lib/env";

const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
};

let client: MongoClient | undefined;

if (hasMongoUri()) {
  const uri = process.env.MONGODB_URI!;

  if (process.env.NODE_ENV === "development") {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    const globalWithMongo = global as typeof globalThis & {
      _mongoClient?: MongoClient;
    };

    if (!globalWithMongo._mongoClient) {
      globalWithMongo._mongoClient = new MongoClient(uri, options);
    }

    client = globalWithMongo._mongoClient;
  } else {
    // In production mode, it's best to not use a global variable.
    client = new MongoClient(uri, options);
  }
}

export function getClient(): MongoClient {
  if (!client) {
    throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
  }

  return client;
}

// Export a module-scoped MongoClient when configured.
export default getClient;
