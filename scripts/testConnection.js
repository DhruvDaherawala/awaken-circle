import 'dotenv/config';
import prisma from '../lib/prisma.js';

async function main() {
  console.log("Checking max_connections limit...");
  try {
    const result = await prisma.$queryRawUnsafe("SHOW VARIABLES LIKE 'max_connections'");
    console.log("Max connections:", result);

    const activeConns = await prisma.$queryRawUnsafe("SHOW STATUS LIKE 'Threads_connected'");
    console.log("Active connections:", activeConns);
  } catch (error) {
    console.error("Failed to query database statistics:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
