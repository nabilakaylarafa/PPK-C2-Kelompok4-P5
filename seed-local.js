const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding local SQLite database...");

  // 1. Create or update demo student user
  const hashedPassword = await bcrypt.hash("password123", 10);
  const user = await prisma.user.upsert({
    where: { email: "student@university.ac.id" },
    update: {
      name: "Husni Ulyaa (Demo Mahasiswa)",
      password: hashedPassword,
    },
    create: {
      name: "Husni Ulyaa (Demo Mahasiswa)",
      email: "student@university.ac.id",
      password: hashedPassword,
    },
  });

  console.log("User created/updated:", user.email);

  // 2. Clear previous transactions and budgets for this user (for clean test)
  await prisma.transaction.deleteMany({ where: { userId: user.id } });
  await prisma.budget.deleteMany({ where: { userId: user.id } });

  // 3. Create sample transactions (Current Month)
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed

  await prisma.transaction.createMany({
    data: [
      {
        title: "Uang Saku Bulanan dari Orang Tua",
        amount: 2500000,
        type: "income",
        category: "Allowance / Uang Saku",
        date: new Date(currentYear, currentMonth, 1),
        userId: user.id,
      },
      {
        title: "Gaji Asisten Praktikum",
        amount: 800000,
        type: "income",
        category: "Part-time Job",
        date: new Date(currentYear, currentMonth, 5),
        userId: user.id,
      },
      {
        title: "Bayar Uang Kos-Kosan",
        amount: 850000,
        type: "expense",
        category: "Housing / Kos-Kosan",
        date: new Date(currentYear, currentMonth, 2),
        userId: user.id,
      },
      {
        title: "Makan Siang & Kopi Kantin",
        amount: 45000,
        type: "expense",
        category: "Food & Meals / Makan",
        date: new Date(currentYear, currentMonth, 3),
        userId: user.id,
      },
      {
        title: "Paket Internet Bulanan Kampus",
        amount: 100000,
        type: "expense",
        category: "Internet & Mobile Data",
        date: new Date(currentYear, currentMonth, 4),
        userId: user.id,
      },
      {
        title: "Buku Referensi Pemrograman",
        amount: 175000,
        type: "expense",
        category: "Books & Stationery",
        date: new Date(currentYear, currentMonth, 8),
        userId: user.id,
      },
    ],
  });

  console.log("Sample transactions inserted.");

  // 4. Create sample budget for current month
  await prisma.budget.create({
    data: {
      userId: user.id,
      month: currentMonth + 1, // 1-12
      year: currentYear,
      amount: 2000000, // Rp 2.000.000 target budget
    },
  });

  console.log("Sample budget inserted: Rp 2.000.000 for month", currentMonth + 1, currentYear);
  console.log("Seeding complete! You can now login with Auto-fill sample account.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
