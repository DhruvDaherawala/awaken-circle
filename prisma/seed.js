import { PrismaClient } from '../lib/generated/client/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import * as mariadb from 'mariadb';
import 'dotenv/config';

async function main() {
  console.log("🌱 Starting database seeding...");

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is missing.");
  }

  // Parse connection string natively to build robust pool options with SSL
  console.log("Seed script RAW ENV DATABASE_URL:", process.env.DATABASE_URL);
  const dbUrl = new URL(process.env.DATABASE_URL);
  
  const poolOptions = {
    host: dbUrl.hostname,
    port: parseInt(dbUrl.port || '3306', 10),
    user: decodeURIComponent(dbUrl.username),
    password: decodeURIComponent(dbUrl.password),
    database: dbUrl.pathname.replace(/^\//, ''),
    ssl: {
      rejectUnauthorized: false // Required for secure connections to cloud providers like Aiven
    },
    connectionLimit: 10
  };

  console.log("Seed script poolOptions:", {
    host: poolOptions.host,
    port: poolOptions.port,
    user: poolOptions.user,
    database: poolOptions.database
  });

  const adapter = new PrismaMariaDb(poolOptions);
  const prisma = new PrismaClient({ adapter });

  try {
    const defaultCategories = [
      { name: 'Mind & Wellness', slug: 'wellness' },
      { name: 'Running & Endurance', slug: 'running' },
      { name: 'Creative Workshops', slug: 'workshops' },
      { name: 'Social Gatherings', slug: 'socials' },
      { name: 'Fitness Meetups', slug: 'fitness-meetups' },
      { name: 'Dance Nights', slug: 'dance-nights' },
      { name: 'Trekking Events', slug: 'trekking-events' },
      { name: 'Marathons', slug: 'marathons' },
      { name: 'Pottery Workshops', slug: 'pottery-workshops' }
    ];

    console.log(`Upserting ${defaultCategories.length} categories...`);
    for (const cat of defaultCategories) {
      await prisma.category.upsert({
        where: { slug: cat.slug },
        update: cat,
        create: cat
      });
    }

    const defaultCommunities = [
      {
        name: "Awaken Run",
        slug: "awaken-run",
        shortDescription: "Surat's premier active running and movement club.",
        description: "From sunrise interval runs along canal walkway pavillions to long-distance weekend trail runs, we move together and celebrate active living over local specialty coffee.",
        logo: "/images/communities/run-logo.png",
        coverImage: "/images/communities/run-cover.jpg",
        themeColor: "#A8B5A2", // Sage Green
        events: [
          {
            title: "Dumas Beach Sunrise Half Marathon",
            slug: "dumas-beach-sunrise-half-marathon",
            shortDescription: "A scenic 21K and 10K running experience along Surat's iconic Dumas Beach road.",
            description: "Join us for our annual flagship running event at Dumas Beach. Watch the golden Surat sunrise as we cover a flat, scenic route perfect for personal bests. Finishers get a handcrafted wooden medal, healthy high-protein local breakfast box, and hot brewed filter coffee.",
            category: "Marathons",
            eventDate: new Date("2026-06-21T05:30:00Z"),
            eventTime: "05:30 AM",
            endTime: "08:30 AM",
            location: "Dumas Beach Promenade, Surat",
            googleMapsLink: "https://maps.app.goo.gl/dumas-beach",
            price: 499.00,
            maxParticipants: 300,
            registrationDeadline: new Date("2026-06-18T23:59:59Z"),
            status: "PUBLISHED",
            featured: true,
            coverImage: "/images/events/run-marathon.jpg"
          },
          {
            title: "Canal Walkway Sunset Interval Run",
            slug: "canal-walkway-sunset-interval-run",
            shortDescription: "Improve your pace and stamina with a supervised interval training session at Vesu Canal Walkway.",
            description: "An energetic mid-week interval run designed to boost cardiorespiratory fitness. Led by our certified run coaches. We will focus on running form, breathing techniques, and high-intensity interval sets, followed by active dynamic stretching and cooling coconut water.",
            category: "Fitness Meetups",
            eventDate: new Date("2026-06-10T17:30:00Z"),
            eventTime: "05:30 PM",
            endTime: "07:00 PM",
            location: "Vesu Canal Walkway, Surat",
            googleMapsLink: "https://maps.app.goo.gl/vesu-canal",
            price: 0.00,
            maxParticipants: 50,
            registrationDeadline: new Date("2026-06-09T23:59:59Z"),
            status: "PUBLISHED",
            featured: false,
            coverImage: "/images/events/run-intervals.jpg"
          }
        ]
      },
      {
        name: "Awaken Balak",
        slug: "awaken-balak",
        shortDescription: "Mindfulness and developmental play circles for kids.",
        description: "A specialized play and movement space designed to nurture children's creative capacity, mind-body coordination, and positive peer social development in Surat.",
        logo: "/images/communities/balak-logo.png",
        coverImage: "/images/communities/balak-cover.jpg",
        themeColor: "#EAE2D6", // Soft Beige
        events: [
          {
            title: "Creative Mud & Clay Pottery Workshop for Kids",
            slug: "creative-clay-pottery-kids-workshop",
            shortDescription: "A hands-on, tactile mud play and pottery session to stimulate children's fine motor skills.",
            description: "Let your little ones get their hands dirty! Our expert clay instructors will guide kids aged 4-12 in creating their own terracotta pots, animals, and imaginative shapes using natural clay wheels. An excellent sensory-motor integration event.",
            category: "Pottery Workshops",
            eventDate: new Date("2026-06-14T10:00:00Z"),
            eventTime: "10:00 AM",
            endTime: "12:00 PM",
            location: "Awaken Studio, Adajan, Surat",
            googleMapsLink: "https://maps.app.goo.gl/awaken-studio-adajan",
            price: 350.00,
            maxParticipants: 20,
            registrationDeadline: new Date("2026-06-12T23:59:59Z"),
            status: "PUBLISHED",
            featured: true,
            coverImage: "/images/events/kids-pottery.jpg"
          },
          {
            title: "Mindful Movement & Storytelling Circle",
            slug: "mindful-movement-storytelling-kids",
            shortDescription: "An interactive storytelling session combined with basic children's yoga postures.",
            description: "A beautifully curated session where classic regional folklore comes alive through interactive dramatic narration, creative music, and easy, engaging yoga poses for kids. Perfect for improving focus, balance, and expression in a supportive peer group.",
            category: "Wellness Sessions",
            eventDate: new Date("2026-06-28T09:30:00Z"),
            eventTime: "09:30 AM",
            endTime: "11:00 AM",
            location: "Lalbhai Contractor Stadium Club House, Surat",
            googleMapsLink: "https://maps.app.goo.gl/lalbhai-stadium",
            price: 200.00,
            maxParticipants: 25,
            registrationDeadline: new Date("2026-06-27T18:00:00Z"),
            status: "PUBLISHED",
            featured: false,
            coverImage: "/images/events/kids-storytelling.jpg"
          }
        ]
      },
      {
        name: "Awaken Fitcorp",
        slug: "awaken-fitcorp",
        shortDescription: "Premium health and fitness circles for working professionals.",
        description: "Empowering Surat's corporate leaders and dynamic workforces with tailored strength sessions, wellness workshops, health counseling, and high-energy meetups.",
        logo: "/images/communities/fitcorp-logo.png",
        coverImage: "/images/communities/fitcorp-cover.jpg",
        themeColor: "#1A1A1A", // Warm Black
        events: [
          {
            title: "Professional Power Hour: Strength & HIIT Meetup",
            slug: "professional-power-hour-hiit-meetup",
            shortDescription: "High-intensity metabolic conditioning designed for working professionals to release stress.",
            description: "An explosive, full-body bodyweight HIIT and strength circuit designed to blast body fat, boost executive cardiovascular endurance, and melt office desk stiffness. Networking session over green juices and macro-calculated salad jars follows.",
            category: "Fitness Meetups",
            eventDate: new Date("2026-06-06T07:00:00Z"),
            eventTime: "07:00 AM",
            endTime: "08:15 AM",
            location: "Sarsana Dome Grounds, Surat",
            googleMapsLink: "https://maps.app.goo.gl/sarsana-dome",
            price: 150.00,
            maxParticipants: 60,
            registrationDeadline: new Date("2026-06-05T20:00:00Z"),
            status: "PUBLISHED",
            featured: true,
            coverImage: "/images/events/fitcorp-hiit.jpg"
          },
          {
            title: "Corporate Stress Management & Sound Bath Session",
            slug: "corporate-stress-sound-bath-session",
            shortDescription: "Decompress from the busy corporate workweek with a soothing therapeutic sound bath.",
            description: "Escape the high-pressure deadline environment. Using acoustic frequencies from crystal singing bowls, Tibetan gongs, and ocean drums, this immersive sound healing session lowers cortisol, resets your central nervous system, and restores mental clarity.",
            category: "Wellness Sessions",
            eventDate: new Date("2026-06-19T18:30:00Z"),
            eventTime: "06:30 PM",
            endTime: "08:00 PM",
            location: "Awaken Studio, Vesu, Surat",
            googleMapsLink: "https://maps.app.goo.gl/awaken-studio-vesu",
            price: 600.00,
            maxParticipants: 15,
            registrationDeadline: new Date("2026-06-18T23:59:59Z"),
            status: "PUBLISHED",
            featured: false,
            coverImage: "/images/events/fitcorp-soundbath.jpg"
          }
        ]
      },
      {
        name: "Awaken Escape",
        slug: "awaken-escape",
        shortDescription: "Immersive nature retreats and active out-of-city escapes.",
        description: "Step away from the urban noise. Curated trail hikes, sunrise meditation camps, organic farm-to-table culinary dinners, and outdoor digital detox experiences.",
        logo: "/images/communities/escape-logo.png",
        coverImage: "/images/communities/escape-cover.jpg",
        themeColor: "#D98C6B", // Terracotta Accent
        events: [
          {
            title: "Saputara Sunrise Trek & Forest Hike",
            slug: "saputara-sunrise-trek-forest-hike",
            shortDescription: "A curated weekend trek in the lush green hills of Saputara with forest exploration.",
            description: "Break away from Surat's urban humidity. We board our private AC community coach to Saputara for a refreshing, intermediate-level weekend forest hike. Watch the breathtaking sunrise from Governor's Hill, explore hidden waterfalls, and share rural organic Maharashtrian meals.",
            category: "Trekking Events",
            eventDate: new Date("2026-07-04T04:00:00Z"),
            eventTime: "04:00 AM",
            endTime: "08:00 PM",
            location: "Pickup from Vesu Circle, Surat",
            googleMapsLink: "https://maps.app.goo.gl/vesu-circle",
            price: 2450.00,
            maxParticipants: 30,
            registrationDeadline: new Date("2026-07-01T23:59:59Z"),
            status: "PUBLISHED",
            featured: true,
            coverImage: "/images/events/escape-saputara.jpg"
          },
          {
            title: "Riverfront Camping & Digital Detox Camp",
            slug: "riverfront-camping-digital-detox-camp",
            shortDescription: "A beautiful overnight riverside camping experience completely disconnected from screens.",
            description: "Surrender your phone at check-in. Spend 24 hours camping under the stars along the scenic Tapi River outskirts. Enjoy active kayaking, stargazing, deep-breathing breathwork classes, acoustic guitar sessions around the bonfire, and live organic cooking.",
            category: "Wellness Sessions",
            eventDate: new Date("2026-06-27T16:00:00Z"),
            eventTime: "04:00 PM",
            endTime: "11:00 AM",
            location: "Tapi River Farms, Kamrej, Surat",
            googleMapsLink: "https://maps.app.goo.gl/tapi-river-farms",
            price: 1800.00,
            maxParticipants: 20,
            registrationDeadline: new Date("2026-06-24T23:59:59Z"),
            status: "PUBLISHED",
            featured: false,
            coverImage: "/images/events/escape-camping.jpg"
          }
        ]
      },
      {
        name: "Awaken Entertainment",
        slug: "awaken-entertainment",
        shortDescription: "Boutique social live music, acoustic nights, and culinary arts.",
        description: "Where community meets local culture. Intimate candlelight music sessions, artistic workshops, poetry jams, and fine culinary social evenings under Surat's stars.",
        logo: "/images/communities/entertainment-logo.png",
        coverImage: "/images/communities/entertainment-cover.jpg",
        themeColor: "#D98C6B", // Terracotta Accent
        events: [
          {
            title: "Candlelight Acoustic Night & Live Jazz Social",
            slug: "candlelight-acoustic-night-live-jazz",
            shortDescription: "An upscale candlelight live acoustic and jazz social evening in a secret courtyard.",
            description: "Step into an ethereal evening lit entirely by 500 beeswax candles. Featuring a live jazz quartet followed by premium indie acoustic performances. Savor local fusion sourdough pizzas and premium mocktails while meeting like-minded culture enthusiasts.",
            category: "Wellness Sessions",
            eventDate: new Date("2026-06-13T19:30:00Z"),
            eventTime: "07:30 PM",
            endTime: "10:30 PM",
            location: "The Secret Courtyard, Piplod, Surat",
            googleMapsLink: "https://maps.app.goo.gl/secret-courtyard-piplod",
            price: 850.00,
            maxParticipants: 80,
            registrationDeadline: new Date("2026-06-12T23:59:59Z"),
            status: "PUBLISHED",
            featured: true,
            coverImage: "/images/events/ent-candlelight.jpg"
          },
          {
            title: "Summer Salsa & Bachata Dance Social Night",
            slug: "summer-salsa-bachata-dance-social",
            shortDescription: "A vibrant, energetic dance night featuring a beginner-friendly Bachata workshop.",
            description: "No dance experience or partner required! Learn the basic steps of Salsa and Bachata in a fun, relaxed 45-minute workshop led by top instructors, followed by an open social dance floor. Let go of your inhibitions and move your body to Latin rhythms.",
            category: "Dance Nights",
            eventDate: new Date("2026-06-20T19:00:00Z"),
            eventTime: "07:00 PM",
            endTime: "10:00 PM",
            location: "Gaurav Path Community Center, Surat",
            googleMapsLink: "https://maps.app.goo.gl/gaurav-path",
            price: 400.00,
            maxParticipants: 100,
            registrationDeadline: new Date("2026-06-19T23:59:59Z"),
            status: "PUBLISHED",
            featured: false,
            coverImage: "/images/events/ent-salsa.jpg"
          }
        ]
      }
    ];

    console.log(`Upserting ${defaultCommunities.length} communities along with their events...`);

    for (const commData of defaultCommunities) {
      const { events, ...comm } = commData;

      // Upsert community to avoid duplicates based on unique slug
      const communityRecord = await prisma.community.upsert({
        where: { slug: comm.slug },
        update: comm,
        create: comm
      });

      console.log(`✓ Community seeded: ${communityRecord.name} (ID: ${communityRecord.id})`);

      // Upsert nested events under this community
      for (const event of events) {
        let categorySlug;
        if (event.category) {
          categorySlug = event.category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        }

        const { category, ...eventWithoutStringCategory } = event;
        
        let categoryId = null;
        if (categorySlug) {
          const cat = await prisma.category.findUnique({ where: { slug: categorySlug }});
          if (cat) categoryId = cat.id;
        }

        const eventInput = {
          ...eventWithoutStringCategory,
          communityId: communityRecord.id,
          categoryId: categoryId
        };

        const eventRecord = await prisma.event.upsert({
          where: { slug: event.slug },
          update: eventInput,
          create: eventInput
        });

        console.log(`  └─ ✓ Event seeded: ${eventRecord.title} (Slug: ${eventRecord.slug})`);
      }
    }

    console.log("🌱 Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
