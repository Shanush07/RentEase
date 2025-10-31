import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

async function connectDB() {
  try {
    await prisma.$connect();
    console.log('✅ :) Connected to PostgreSQL via Prisma');
  } catch (err) {
    console.error('❌ :( Database connection failed:', err);
  }
}

connectDB();

export default prisma;
