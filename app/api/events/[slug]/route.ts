import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

interface RouteContext {
    params: Promise<{ slug: string }>;
}

// GET /api/events/[slug] — fetch a single event by its unique slug
export async function GET(_req: Request, context: RouteContext) {
    try {
        const { slug } = await context.params;

        // Validate slug: must be a non-empty, trimmed string
        if (!slug || typeof slug !== "string" || slug.trim().length === 0) {
            return NextResponse.json(
                { error: "Invalid request", details: "A valid 'slug' route parameter is required" },
                { status: 400 }
            );
        }

        const event = await prisma.event.findUnique({
            where: { slug: slug.trim() },
        });

        if (!event) {
            return NextResponse.json(
                { error: "Event not found", details: `No event exists with slug '${slug}'` },
                { status: 404 }
            );
        }

        return NextResponse.json(event, { status: 200 });
    } catch (e) {
        console.error("Error fetching event by slug:", e);
        return NextResponse.json(
            { error: "Failed to fetch event", details: e instanceof Error ? e.message : "Unknown error" },
            { status: 500 }
        );
    }
}
