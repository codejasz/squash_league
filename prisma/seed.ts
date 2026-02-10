import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Sport Centers (from original db.json)
  const centers = [
    {
      name: "CityFit Wrocław",
      address: "ul. Sucha 1",
      city: "Wrocław",
      phoneNumber: "717221222",
      website: "https://cityfit.pl",
      slug: "cityfit-wroclaw",
    },
    {
      name: "Hasta La Vista Wrocław",
      address: "ul. Piłsudskiego 74",
      city: "Wrocław",
      phoneNumber: "713433800",
      website: "https://hastalavista.pl",
      slug: "hasta-la-vista-wroclaw",
    },
    {
      name: "Sportlife Wrocław",
      address: "ul. Racławicka 21",
      city: "Wrocław",
      phoneNumber: "717924000",
      website: "https://sportlife.pl",
      slug: "sportlife-wroclaw",
    },
    {
      name: "SquashPark Kraków",
      address: "ul. Galicyjska 35",
      city: "Kraków",
      phoneNumber: "126345678",
      website: "https://squashpark.pl",
      slug: "squashpark-krakow",
    },
    {
      name: "Hala Stulecia Sport",
      address: "ul. Wystawowa 1",
      city: "Wrocław",
      phoneNumber: "713476151",
      website: "https://halastulecia.pl",
      slug: "hala-stulecia-wroclaw",
    },
  ];

  for (const center of centers) {
    await prisma.sportCenter.upsert({
      where: { slug: center.slug },
      update: {},
      create: center,
    });
  }
  console.log(`Created ${centers.length} sport centers`);

  // Test Users
  const passwordHash = await bcrypt.hash("Test1234", 12);

  const users = [
    {
      username: "jan_kowalski",
      email: "jan@example.com",
      firstName: "Jan",
      lastName: "Kowalski",
      skillLevel: "INTERMEDIATE" as const,
    },
    {
      username: "anna_nowak",
      email: "anna@example.com",
      firstName: "Anna",
      lastName: "Nowak",
      skillLevel: "ADVANCED" as const,
    },
    {
      username: "piotr_wisniewski",
      email: "piotr@example.com",
      firstName: "Piotr",
      lastName: "Wiśniewski",
      skillLevel: "BEGINNER" as const,
    },
    {
      username: "marta_zielinska",
      email: "marta@example.com",
      firstName: "Marta",
      lastName: "Zielińska",
      skillLevel: "EXPERT" as const,
    },
    {
      username: "tomek_lewandowski",
      email: "tomek@example.com",
      firstName: "Tomasz",
      lastName: "Lewandowski",
      skillLevel: "INTERMEDIATE" as const,
    },
  ];

  for (const user of users) {
    const existing = await prisma.user.findUnique({
      where: { email: user.email },
    });
    if (!existing) {
      await prisma.user.create({
        data: {
          ...user,
          passwordHash,
          name: `${user.firstName} ${user.lastName}`,
          stats: {
            create: { eloRating: 1200 },
          },
        },
      });
    }
  }
  console.log(`Created ${users.length} test users (password: Test1234)`);

  console.log("Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
