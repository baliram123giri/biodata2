const { PrismaClient } = require("../src/generated/prisma");
const prisma = new PrismaClient();

async function main() {
  const slides = await prisma.heroSlide.findMany();
  console.log("=== HERO SLIDES IN DATABASE ===");
  console.log(JSON.stringify(slides, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
