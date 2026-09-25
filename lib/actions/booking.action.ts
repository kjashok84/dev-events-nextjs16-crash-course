'use server';
import prisma from "../prisma";

export const createBooking = async ({ eventId, slug, email }: { eventId: string, slug: string, email: string }) => {
    console.log("Creating booking with data:", { eventId, slug, email });
    try {
        const booking = await prisma.booking.create({
            data: {
                event: {
                    connect: { id: eventId }
                },
                email
            }
        });
        return { ...booking, success: true };
    } catch (error) {
        console.error("Error creating booking:", error);
        return { success: false, error: "Could not create booking" };
    }
};
