'use client'
import { createBooking } from "@/lib/actions/booking.action";
import { posthog } from "posthog-js";
import { useState } from "react";

const BookEvent = ({ eventId, slug }: { eventId: string, slug: string }) => {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const { success, error } = await createBooking({ eventId, slug, email });
        if (success) {
            setSubmitted(true);
            posthog.capture('event_booked', {
                eventId,
                slug,
                email
            });
        } else {
            console.error("Booking failed:", error);
            posthog.captureException(new Error(`Booking failed for eventId: ${eventId}, slug: ${slug}, email: ${email}. Error: ${error}`));
        }

    };

    return (
        <div id="book-event" className="book-event">
            {
                submitted ? (
                    <p className="text-sm">You have successfully booked your spot!</p>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email">Email:</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                required
                            />
                        </div>
                        <button type="submit" className="button-submit">
                            Book Now
                        </button>
                    </form>)}
        </div>
    );
};

export default BookEvent;
