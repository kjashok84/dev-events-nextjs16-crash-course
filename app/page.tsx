import ExploreBtn from "./components/ExploreBtn"
import EventCard from "./components/EventCard"
import prisma from "@/lib/prisma"
import { cacheLife } from "next/cache"

const Page = async () => {
  'use cache';
  cacheLife('hours');
  // Query the database directly instead of fetching our own API route.
  // Fetching `${BASE_URL}/api/events` (localhost) fails during `next build`
  // prerendering/export, since no server is listening on that port yet.
  const events = await prisma.event.findMany({
    orderBy: { createdAt: "desc" },
  });
  console.log("Fetched events:", events);

  return (
    <section>
      <h1 className="text-center">
        The Hub for every Dev <br /> Event you can't miss
      </h1>
      <p className="text-center mt-5">
        Hackathons, meetups, and conferences, all in one place
      </p>
      <ExploreBtn />
      <div className="mt-20 space-y-7">
        <h3> Featured Events </h3>
        <ul className="events">
          {events && events.length > 0 && events.map((event) => (
            <EventCard key={event.title} {...event} />
          ))}
        </ul>
      </div>
    </section>
  )
}
export default Page