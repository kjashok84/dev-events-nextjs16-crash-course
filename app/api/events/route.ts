import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary"
import { Prisma } from "@prisma/client"
import { promises as fs } from "fs";
import path from "path";

// Note: the NODE_TLS_REJECT_UNAUTHORIZED dev-only workaround (for corporate
// VPNs/proxies performing TLS inspection) is set in instrumentation.ts,
// which runs before any route module is loaded. Setting it here was
// unreliable because Next.js may have already loaded/cached the cloudinary
// module's internal HTTPS agent by the time this file's top-level code ran.

const VALID_MODES = ["online", "offline", "hybrid"] as const
type EventMode = (typeof VALID_MODES)[number]

// Generate a URL-friendly slug from a given string
function slugify(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .split(/[^a-z0-9]+/)
        .filter(Boolean)
        .join("-")
}

// Safely extract a string value from a FormData entry (ignoring File entries)
function getString(value: FormDataEntryValue | undefined): string {
    return typeof value === "string" ? value : ""
}

// Split a comma-separated form field into a trimmed, non-empty string array
function splitList(value: FormDataEntryValue | undefined): string[] {
    return getString(value)
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
}

// Map common image mime types to file extensions for local fallback
function mimeToExt(mime?: string): string {
    if (!mime) return ".jpg";
    const map: Record<string, string> = {
        "image/jpeg": ".jpg",
        "image/jpg": ".jpg",
        "image/png": ".png",
        "image/webp": ".webp",
        "image/gif": ".gif",
        "image/svg+xml": ".svg",
        "image/avif": ".avif",
    };
    return map[mime] || ".jpg";
}

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        let eventData: Record<string, FormDataEntryValue> = {};
        try {
            eventData = Object.fromEntries(formData.entries());
        } catch (err) {
            console.error("Error parsing form data:", err);
            return NextResponse.json({ error: "Invalid JSON data format", details: err instanceof Error ? err.message : "Unknown error" }, { status: 400 });
        }

        const title = getString(eventData.title);
        const agenda = splitList(eventData.agenda);
        const tags = splitList(eventData.tags);
        const mode = getString(eventData.mode) || "offline";

        // Validate title, derived slug, and mode before doing any upload work
        if (!title.trim()) {
            return NextResponse.json({ error: "Title is required" }, { status: 400 });
        }

        const slug = slugify(title);
        if (!slug) {
            return NextResponse.json({ error: "Title must contain at least one alphanumeric character to generate a slug" }, { status: 400 });
        }

        if (!VALID_MODES.includes(mode as EventMode)) {
            return NextResponse.json({ error: `Mode must be one of: ${VALID_MODES.join(", ")}` }, { status: 400 });
        }

        const file = formData.get("image");
        console.log("Received file:", file);
        if (!(file instanceof File) || file.size === 0) {
            return NextResponse.json({ error: "Image file is required" }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Attempt Cloudinary upload first; on failure, fall back to writing
        // the file to disk in development so uploads still work behind
        // corporate proxies / TLS interception during dev.
        let imageUrl = "";
        try {
            const uploadResult = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream({ resource_type: "image", folder: 'DevEvent', timeout: 15000 }, (error, result) => {
                    if (error) {
                        reject(new Error(error.message || "Cloudinary upload failed"));
                    } else {
                        resolve(result);
                    }
                }).end(buffer);
            });
            imageUrl = (uploadResult as { secure_url: string }).secure_url;
        } catch (uploadErr) {
            console.error("Cloudinary upload failed:", uploadErr);
            // Dev-only local fallback: write file to public/uploads/events and
            // use a local URL. Production should bubble the error instead.
            if (process.env.NODE_ENV !== "production") {
                try {
                    const uploadsDir = path.join(process.cwd(), "public", "uploads", "events");
                    await fs.mkdir(uploadsDir, { recursive: true });

                    const originalName = (file as any).name || `${slug}-${Date.now()}`;
                    const ext = path.extname(originalName) || mimeToExt((file as any).type);
                    const filename = `${slug}-${Date.now()}${ext}`;
                    const filePath = path.join(uploadsDir, filename);

                    await fs.writeFile(filePath, buffer);
                    imageUrl = `/uploads/events/${filename}`;
                    console.warn(`Saved uploaded image to local fallback: ${filePath}`);
                } catch (fsErr) {
                    console.error("Failed to save local fallback image:", fsErr);
                    // Re-throw original upload error to be handled below
                    throw uploadErr;
                }
            } else {
                // In production, reject and let outer catch handle the error
                throw uploadErr;
            }
        }

        eventData.image = imageUrl;

        const createEvent = await prisma.event.create({
            data: {
                title,
                slug,
                description: getString(eventData.description),
                overview: getString(eventData.overview),
                image: getString(eventData.image),
                venue: getString(eventData.venue),
                location: getString(eventData.location),
                date: getString(eventData.date),
                time: getString(eventData.time),
                mode: mode as EventMode,
                audience: getString(eventData.audience),
                agenda,
                organizer: getString(eventData.organizer),
                tags,
            },
        });

        return NextResponse.json({ message: "Event Created Successfully", event: createEvent }, { status: 201 });
    } catch (e) {
        console.error("Error creating event:", e);

        // Prisma unique constraint violation (e.g. duplicate slug)
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
            return NextResponse.json({ error: "An event with this title already exists" }, { status: 409 });
        }

        return NextResponse.json({ error: "Event Creation Failed", details: e instanceof Error ? e.message : "Unknown error" }, { status: 400 });
    }
}

export async function GET() {
    try {
        const events = (await prisma.event.findMany()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        return NextResponse.json(events, { status: 200 });
    } catch (e) {
        console.error("Error fetching events:", e);
        return NextResponse.json({ error: "Failed to fetch events", details: e instanceof Error ? e.message : "Unknown error" }, { status: 500 });
    }
}
