import { notFound } from "next/navigation";
import Image from "next/image";
import BookEvent from "@/app/components/BookEvent";
import { getSimilarEventsBySlug } from "@/lib/actions/event.action";
import EventCard from "@/app/components/EventCard";

const EventDetailItem = ({ icon, alt, label }: { icon: string, alt: string, label: string }) => {
  return (
    <div className="flex-row gap-2 item-center">
      <Image src={icon} alt={alt} width={17} height={17} />
      <p>{label}</p>
    </div>
  );
};

const EventAgenda = ({ agendaItems }: { agendaItems: string[] }) => {
  return (
    <div className="agenda">
      <h2>Agenda</h2>
      <ul>
        {agendaItems.map((item) => (
          <li key={item}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
};

const EventTags = ({ tags }: { tags: string[] }) => {
  console.log('Rendering EventTags with tags:', tags);
  return (
    <div className=" flex flex-row gap-1.5 flex-wrap">
      {tags.map((tag) => (
        <div className="pill" key={tag}>
          {tag}
        </div>
      ))}
    </div>
  );
};

const EventDetailPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;
  console.log("Fetching event details for slug:", slug);
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const response = await fetch(`${BASE_URL}/api/events/${slug}`);
  const { title, description, image, overview, venue, location, date, time, mode, audience, agenda, organizer, tags } = await response.json();
  console.log("Fetched event:", { title, description, image });
  if (!title) return notFound();

  const bookings = 10;

  const similarEvents = await getSimilarEventsBySlug(slug)

  return (
    <section id="event">
      <div className="header">
        <h1>Event Description</h1>
        <p>{description}</p>
      </div>

      <div className="details mt-10">
        <div className="content">
          <h2>Overview</h2>
          <p>{overview}</p>
          <Image src={image} alt={title} width={800} height={800} className="banner" />
          <section className="flex-col gap-2">
            <h2>Event Details</h2>
            <EventDetailItem icon="/icons/calendar.svg" alt="Date" label={date} />
            <EventDetailItem icon="/icons/clock.svg" alt="Time" label={time} />
            <EventDetailItem icon="/icons/pin.svg" alt="Venue" label={location} />
            <EventDetailItem icon="/icons/mode.svg" alt="mode" label={mode} />
            <EventDetailItem icon="/icons/audience.svg" alt="Audience" label={audience} />
          </section>
          <EventAgenda agendaItems={agenda} />

          <section className="flex-col gap-2 mt-10">
            <h2>About Organizer</h2>
            <p>{organizer}</p>
          </section>
          <EventTags tags={tags} />

        </div>
        <aside className="booking">
          <div className="signup-card">
            <h2>Book Your Spot</h2>
            {bookings > 0 ? (
              <p className='text-sm'>
                Join {bookings} people who have already booked this event.
              </p>
            ) : (
              <p className='text-sm'>
                Be the first to book this event!
              </p>
            )}
          </div>
          <BookEvent />
        </aside>
      </div>

      <div className="flex w-full flex-col gap-4 pt-20">
        <h2>Similar Events</h2>
        <div className="events">
          {similarEvents.map((event) => (
            <div key={event.id} className="event-card">
              <EventCard {...event} key={event.id} />
            </div>
          ))}
        </div>
      </div>
    </section>


  );
};

export default EventDetailPage;
