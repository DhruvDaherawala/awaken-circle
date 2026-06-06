import { PrismaClient } from './lib/generated/client/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import * as mariadb from 'mariadb';
import 'dotenv/config';

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set in environment.");
}

const dbUrl = new URL(process.env.DATABASE_URL);
const poolOptions = {
  host: dbUrl.hostname,
  port: parseInt(dbUrl.port || '3306', 10),
  user: decodeURIComponent(dbUrl.username),
  password: decodeURIComponent(dbUrl.password),
  database: dbUrl.pathname.replace(/^\//, ''),
  ssl: {
    rejectUnauthorized: false
  },
  connectionLimit: 3
};

const adapter = new PrismaMariaDb(poolOptions);
const prisma = new PrismaClient({ adapter });

async function main() {
  const categories = [
    { name: 'Mind & Wellness', slug: 'wellness' },
    { name: 'Running & Endurance', slug: 'running' },
    { name: 'Creative Workshops', slug: 'workshops' },
    { name: 'Social Gatherings', slug: 'socials' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
  }
  console.log('Categories seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
