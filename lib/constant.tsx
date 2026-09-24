export type EventItem = {
    image: string
    title: string
    slug: string
    location: string
    date: string // YYYY-MM-DD
    time: string // e.g. "10:30 AM"
}

export const events: EventItem[] = [
    { image: '/images/event1.png', title: 'React Summit', slug: 'react-summit', location: 'San Francisco, CA', date: '2026-11-12', time: '09:00 AM' },
    { image: '/images/event2.png', title: 'Next.js Conf', slug: 'nextjs-conf', location: 'New York, NY', date: '2026-12-03', time: '01:30 PM' },
    { image: '/images/event3.png', title: 'Open Source Hack', slug: 'open-source-hack', location: 'Austin, TX', date: '2027-01-21', time: '06:00 PM' },
    { image: '/images/event4.png', title: 'AI & ML Meetup', slug: 'ai-ml-meetup', location: 'Seattle, WA', date: '2027-02-10', time: '07:15 PM' },
    { image: '/images/event5.png', title: 'Frontend Fiesta', slug: 'frontend-fiesta', location: 'Remote', date: '2026-11-30', time: '10:00 AM' },
]