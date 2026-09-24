import ExploreBtn from "./components/ExploreBtn"
import EventCard from "./components/EventCard"
import { events } from "../lib/constant"

const Page = () => {
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
          {events.map((event) => (
            <EventCard key={event.title} {...event} />
          ))}
        </ul>
      </div>
    </section>
  )
}
export default Page