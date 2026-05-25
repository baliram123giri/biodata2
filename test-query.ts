import { PrismaClient } from "./src/generated/prisma";

const prisma = new PrismaClient();

async function test() {
  console.log("Starting DB query test...");
  try {
    const templates = await prisma.template.findMany();
    console.log(`SUCCESS: Found ${templates.length} templates.`);
    if (templates.length > 0) {
      console.log("First template sample:");
      console.log(JSON.stringify({
        id: templates[0].id,
        name: templates[0].name,
        language: templates[0].language,
      }, null, 2));
    }
  } catch (err) {
    console.error("CRITICAL DB QUERY ERROR:", err);
  } finally {
    await prisma.$disconnect();
  }
}

test();
