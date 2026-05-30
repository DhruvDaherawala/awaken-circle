import prisma from '../../../lib/prisma.js';

async function main() {
  try {
    const events = await prisma.event.findMany({
      include: {
        community: true
      }
    });
    console.log("EVENTS IN DB:", events.map(e => ({ id: e.id, title: e.title, eventDate: e.eventDate })));
  } catch (error) {
    console.error("DB QUERY ERROR:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
