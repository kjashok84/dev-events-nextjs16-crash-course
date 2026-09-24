import {
    Schema,
    model,
    models,
    Document,
    Model,
} from "mongoose"

// Shape of an Event document
export interface IEvent extends Document {
    title: string
    slug: string
    description: string
    overview: string
    image: string
    venue: string
    location: string
    date: string
    time: string
    mode: "online" | "offline" | "hybrid"
    audience: string
    agenda: string[]
    organizer: string
    tags: string[]
    createdAt: Date
    updatedAt: Date
}

const EventSchema = new Schema<IEvent>(
    {
        title: { type: String, required: true, trim: true },
        slug: { type: String, unique: true, index: true },
        description: { type: String, required: true, trim: true },
        overview: { type: String, required: true, trim: true },
        image: { type: String, required: true },
        venue: { type: String, required: true, trim: true },
        location: { type: String, required: true, trim: true },
        date: { type: String, required: true },
        time: { type: String, required: true },
        mode: {
            type: String,
            required: true,
            enum: ["online", "offline", "hybrid"],
        },
        audience: { type: String, required: true },
        agenda: {
            type: [String],
            required: true,
            validate: {
                validator: (val: string[]) => Array.isArray(val) && val.length > 0,
                message: "Agenda must contain at least one item",
            },
        },
        organizer: { type: String, required: true, trim: true },
        tags: {
            type: [String],
            required: true,
            validate: {
                validator: (val: string[]) => Array.isArray(val) && val.length > 0,
                message: "Tags must contain at least one item",
            },
        },
    },
    { timestamps: true }
)

// Generate a URL-friendly slug from a given string
function slugify(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .split(/[^a-z0-9]+/)
        .filter(Boolean)
        .join("-")
}

// Normalize a date string into ISO (YYYY-MM-DD) format
function normalizeDate(date: string): string {
    const parsed = new Date(date)
    if (Number.isNaN(parsed.getTime())) {
        throw new TypeError(`Invalid date value: ${date}`)
    }
    return parsed.toISOString().split("T")[0]
}

// Normalize a time string into a consistent "HH:MM AM/PM" format
function normalizeTime(time: string): string {
    const TIME_PATTERN = /^(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)?$/
    const match = TIME_PATTERN.exec(time.trim())

    if (!match) {
        throw new TypeError(`Invalid time value: ${time}`)
    }

    const [, hourStr, minute, meridiemRaw] = match
    let hour = Number.parseInt(hourStr, 10)
    let meridiem = meridiemRaw?.toUpperCase()

    // Derive AM/PM if not provided, assuming 24-hour input
    if (!meridiem) {
        meridiem = hour >= 12 ? "PM" : "AM"
        hour = hour % 12 || 12
    }

    return `${hour.toString().padStart(2, "0")}:${minute} ${meridiem}`
}

// Pre-save hook: regenerate slug only when title changes, and normalize date/time
EventSchema.pre("save", function () {
    if (this.isModified("title")) {
        this.slug = slugify(this.title)
    }

    if (this.isModified("date")) {
        this.date = normalizeDate(this.date)
    }

    if (this.isModified("time")) {
        this.time = normalizeTime(this.time)
    }
})

export const Event: Model<IEvent> =
    models.Event || model<IEvent>("Event", EventSchema)
