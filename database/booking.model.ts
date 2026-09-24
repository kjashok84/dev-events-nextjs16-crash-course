import { Schema, model, models, Document, Model, Types } from "mongoose"
import { Event } from "./event.model"

// Shape of a Booking document
export interface IBooking extends Document {
    eventId: Types.ObjectId
    email: string
    createdAt: Date
    updatedAt: Date
}

// Simple, standard email format validation
function isValidEmail(value: string): boolean {
    const atIndex = value.indexOf("@")
    if (atIndex <= 0 || atIndex !== value.lastIndexOf("@")) return false

    const localPart = value.slice(0, atIndex)
    const domainPart = value.slice(atIndex + 1)

    const hasWhitespace = /\s/
    if (hasWhitespace.test(localPart) || hasWhitespace.test(domainPart)) {
        return false
    }

    const dotIndex = domainPart.indexOf(".")
    return dotIndex > 0 && dotIndex < domainPart.length - 1
}

const BookingSchema = new Schema<IBooking>(
    {
        eventId: {
            type: Schema.Types.ObjectId,
            ref: "Event",
            required: true,
            index: true,
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            validate: {
                validator: (val: string) => isValidEmail(val),
                message: "Invalid email address",
            },
        },
    },
    { timestamps: true }
)

// Pre-save hook: ensure the referenced event actually exists before booking
BookingSchema.pre("save", async function () {
    if (this.isModified("eventId")) {
        const eventExists = await Event.exists({ _id: this.eventId })
        if (!eventExists) {
            throw new Error(`Event with id ${this.eventId} does not exist`)
        }
    }
})

export const Booking: Model<IBooking> =
    models.Booking || model<IBooking>("Booking", BookingSchema)
