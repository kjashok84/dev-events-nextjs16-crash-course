'use server';
import prisma from '@/lib/prisma';

export const getSimilarEventsBySlug = async (slug: string) => {
  try {
    const event = await prisma.event.findUnique({
      where: { slug },
      select: {
        tags: true,
      },
    });
    const similarEvents = await prisma.event.findMany({
      where: {
        slug: { not: slug },
        tags: {
          hasSome: event?.tags,
        },
      },
    });
    return similarEvents;
  } catch (error) {
    console.error('Error fetching similar events:', error);
    throw error;
  }
};
