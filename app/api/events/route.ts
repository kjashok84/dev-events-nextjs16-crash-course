import connectToDatabase from "@/lib/mongodb";
import { Event } from "@/database/event.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest){
    try{
        await connectToDatabase();
        const formData = await req.formData();
        let eventData: Record<string, any> = {};
        try{
            eventData = Object.fromEntries(formData.entries());
        } catch (err) {
            console.error("Error parsing form data:", err);
            return NextResponse.json({ error: "Invalid JSON data format", error: err instanceof Error ? err.message : "Unknown error" }, { status: 400 });
        }
        const createEvent = await Event.create(eventData);
        return NextResponse.json({ message: "Event Created Successfully", event: createEvent }, { status: 201 });
    } catch (e) {
        console.error("Error creating event:", e);
        return NextResponse.json({ error: "Event Creation Failed", error: e instanceof Error ? e.message : "Unknown error" }, { status: 400 });
    }
}