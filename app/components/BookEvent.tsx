'use client'
import { useState } from "react";

const BookEvent = () => {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setTimeout(() => {
            console.log(`Booking submitted for email: ${email}`);
            setSubmitted(true);
        }, 1000);
        
    };

  return (
    <div id="book-event" className="book-event">
        {
            submitted? (
                <p className="text-sm">You have successfully booked your spot!</p>
            ):(
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
