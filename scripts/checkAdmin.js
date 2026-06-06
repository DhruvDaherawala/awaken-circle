const { PrismaClient } = require('../lib/generated/client/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');
require('dotenv').config();

async function main() {
  console.log("Checking database connection and Admin credentials inside workspace...");
  
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
  };
  
  const adapter = new PrismaMariaDb(poolOptions);
  const prisma = new PrismaClient({ adapter });

  try {
    await prisma.$connect();
    console.log("Connected successfully to MySQL database.");

    // Look for the requested admin email
    const email = "admin@awakencircle.com";
    const existingAdmin = await prisma.admin.findUnique({
      where: { email }
    });

    const secureHash = "$2b$10$UOUtQcVV/.UqixETZ3yjeevI0dMA73tzl5qGfyPvdCw2yhZutt7Lq"; // Hash of admin123

    if (existingAdmin) {
      console.log(`Found existing admin with email: ${email}`);
      console.log("Details:", {
        id: existingAdmin.id,
        name: existingAdmin.name,
        role: existingAdmin.role,
        hasPasswordHash: !!existingAdmin.password
      });
      
      // Update password just in case they added a raw text password instead of a bcrypt hash!
      if (existingAdmin.password !== secureHash) {
        console.log("Password hash does not match secure hash of 'admin123'. Updating it now...");
        await prisma.admin.update({
          where: { email },
          data: { password: secureHash }
        });
        console.log("Password hash updated successfully!");
      } else {
        console.log("Password hash matches secure hash of 'admin123' perfectly!");
      }
    } else {
      console.log(`Admin with email ${email} not found. Creating default admin...`);
      
      const newAdmin = await prisma.admin.create({
        data: {
          name: "Awaken Admin",
          email,
          password: secureHash,
          role: "SUPERADMIN"
        }
      });
      console.log("Created default admin user successfully:", newAdmin);
    }
  } catch (err) {
    console.error("Database connection or check failed:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
