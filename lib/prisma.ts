import { PrismaClient } from "@prisma/client"

// Extend the NodeJS global type to include our cached Prisma client.
// This prevents creating multiple client instances/connections during
// development due to Next.js hot-reloading.
declare global {
    // eslint-disable-next-line no-var
    var prismaClient: PrismaClient | undefined
}

const prisma: PrismaClient = global.prismaClient ?? new PrismaClient()

if (process.env.NODE_ENV !== "production") {
    global.prismaClient = prisma
}

export default prisma
