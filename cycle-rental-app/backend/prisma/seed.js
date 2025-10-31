import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // 1️⃣ Delete in dependency order to avoid FK conflicts
  await prisma.payment.deleteMany();
  await prisma.rentalSession.deleteMany();
  await prisma.qRCode.deleteMany();
  await prisma.guard.deleteMany();
  await prisma.station.deleteMany();
  await prisma.student.deleteMany();
  console.log("🧹 Cleared old data");

  // 2️⃣ Create Students
  const students = [];
  for (const s of [
    { name: "Ravi Kumar", email: "ravi@example.com", phone: "9876543210" },
    { name: "Anjali Singh", email: "anjali@example.com", phone: "9876501234" },
    { name: "Kiran Das", email: "kiran@example.com", phone: "9876523456" },
  ]) {
    const student = await prisma.student.create({
      data: {
        ...s,
        password_hash: "hashed_default_123",
        college_id: "VIT" + Math.floor(Math.random() * 1000),
      },
    });
    students.push(student);
  }
  console.log("✅ Students created:", students.length);

  // 3️⃣ Create Stations
  const stationData = [
    { name: "Main Gate Station", capacity: 20, available_cycles: 15 },
    { name: "Hostel Block Station", capacity: 15, available_cycles: 10 },
    { name: "Academic Block Station", capacity: 25, available_cycles: 18 },
    { name: "Parking Lot Station", capacity: 10, available_cycles: 8 },
  ];
  const stations = [];
  for (const s of stationData) {
    stations.push(await prisma.station.create({ data: s }));
  }
  console.log("✅ Stations created:", stations.length);

  // 4️⃣ Create Guards per Station
  const guards = [];
  for (const [i, station] of stations.entries()) {
    const guard = await prisma.guard.create({
      data: {
        name: `Guard ${i + 1}`,
        phone: `90000000${i + 1}`,
        station_id: station.station_id,
      },
    });
    guards.push(guard);
  }
  console.log("✅ Guards created:", guards.length);

  // 5️⃣ Create QRCodes
  const qrCodes = [];
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24);
  for (const guard of guards) {
    const qr = await prisma.qRCode.create({
      data: {
        token: `QR-${guard.guard_id.slice(0, 6)}`,
        expires_at: expires,
        guard_id: guard.guard_id,
        station_id: guard.station_id,
      },
    });
    qrCodes.push(qr);
  }
  console.log("✅ QR Codes created:", qrCodes.length);

  // 6️⃣ Create a sample Rental Session
  const session = await prisma.rentalSession.create({
    data: {
      student_id: students[0].student_id,
      start_station_id: stations[0].station_id,
      start_guard_id: guards[0].guard_id,
      start_qr_id: qrCodes[0].qr_id,
      status: "PENDING",
      start_time: new Date(),
    },
  });
  console.log("✅ Sample rental session created:", session.session_id);

  console.log("🌿 Seeding completed successfully!");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error("❌ Seed error:", err);
    await prisma.$disconnect();
  });
