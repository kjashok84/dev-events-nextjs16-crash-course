import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URL

if (!MONGODB_URI) {
    throw new Error(
        "Please define the MONGODB_URL environment variable inside .env"
    )
}

interface MongooseCache {
    conn: typeof mongoose | null
    promise: Promise<typeof mongoose> | null
}

// Extend the NodeJS global type to include our cached mongoose connection.
// This prevents creating multiple connections during development due to
// Next.js hot-reloading.
declare global {
    // eslint-disable-next-line no-var
    var mongooseCache: MongooseCache | undefined
}

const cached: MongooseCache = global.mongooseCache ?? {
    conn: null,
    promise: null,
}

if (!global.mongooseCache) {
    global.mongooseCache = cached
}

export async function connectToDatabase(): Promise<typeof mongoose> {
    if (cached.conn) {
        return cached.conn
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            // Fail fast instead of hanging for the default 30s when Atlas is
            // unreachable (e.g. IP not whitelisted, cluster paused).
            serverSelectionTimeoutMS: 10000,
        }

        cached.promise = mongoose.connect(MONGODB_URI as string, opts)
    }

    try {
        cached.conn = await cached.promise
    } catch (error) {
        cached.promise = null

        if (error instanceof Error) {
            console.error(
                "MongoDB connection failed. If you're using Atlas, verify: " +
                "(1) your current IP is whitelisted under Network Access, " +
                "(2) the cluster isn't paused, and (3) the username/password " +
                "in MONGODB_URI are correct.",
                error.message
            )
        }

        throw error
    }

    return cached.conn
}

export default connectToDatabase
