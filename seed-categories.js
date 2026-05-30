import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

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
