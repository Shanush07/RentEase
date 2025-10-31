-- CreateTable
CREATE TABLE "Student" (
    "student_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "password_hash" TEXT NOT NULL,
    "college_id" TEXT,
    "status" TEXT DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("student_id")
);

-- CreateTable
CREATE TABLE "Guard" (
    "guard_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "status" TEXT DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "station_id" TEXT NOT NULL,

    CONSTRAINT "Guard_pkey" PRIMARY KEY ("guard_id")
);

-- CreateTable
CREATE TABLE "Station" (
    "station_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "available_cycles" INTEGER NOT NULL,
    "status" TEXT DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Station_pkey" PRIMARY KEY ("station_id")
);

-- CreateTable
CREATE TABLE "QRCode" (
    "qr_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "guard_id" TEXT NOT NULL,
    "station_id" TEXT NOT NULL,

    CONSTRAINT "QRCode_pkey" PRIMARY KEY ("qr_id")
);

-- CreateTable
CREATE TABLE "RentalSession" (
    "session_id" TEXT NOT NULL,
    "start_time" TIMESTAMP(3),
    "end_time" TIMESTAMP(3),
    "status" TEXT DEFAULT 'PENDING',
    "billed_amount" DECIMAL(10,2),
    "paid_amount" DECIMAL(10,2),
    "due_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "student_id" TEXT NOT NULL,
    "start_station_id" TEXT NOT NULL,
    "end_station_id" TEXT,
    "start_guard_id" TEXT NOT NULL,
    "end_guard_id" TEXT,
    "start_qr_id" TEXT NOT NULL,
    "end_qr_id" TEXT,

    CONSTRAINT "RentalSession_pkey" PRIMARY KEY ("session_id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "payment_id" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "method" TEXT,
    "status" TEXT DEFAULT 'PENDING',
    "gateway_ref" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paid_at" TIMESTAMP(3),
    "session_id" TEXT NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("payment_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Student_email_key" ON "Student"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_session_id_key" ON "Payment"("session_id");

-- AddForeignKey
ALTER TABLE "Guard" ADD CONSTRAINT "Guard_station_id_fkey" FOREIGN KEY ("station_id") REFERENCES "Station"("station_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QRCode" ADD CONSTRAINT "QRCode_guard_id_fkey" FOREIGN KEY ("guard_id") REFERENCES "Guard"("guard_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QRCode" ADD CONSTRAINT "QRCode_station_id_fkey" FOREIGN KEY ("station_id") REFERENCES "Station"("station_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalSession" ADD CONSTRAINT "RentalSession_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("student_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalSession" ADD CONSTRAINT "RentalSession_start_station_id_fkey" FOREIGN KEY ("start_station_id") REFERENCES "Station"("station_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalSession" ADD CONSTRAINT "RentalSession_end_station_id_fkey" FOREIGN KEY ("end_station_id") REFERENCES "Station"("station_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalSession" ADD CONSTRAINT "RentalSession_start_guard_id_fkey" FOREIGN KEY ("start_guard_id") REFERENCES "Guard"("guard_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalSession" ADD CONSTRAINT "RentalSession_end_guard_id_fkey" FOREIGN KEY ("end_guard_id") REFERENCES "Guard"("guard_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalSession" ADD CONSTRAINT "RentalSession_start_qr_id_fkey" FOREIGN KEY ("start_qr_id") REFERENCES "QRCode"("qr_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalSession" ADD CONSTRAINT "RentalSession_end_qr_id_fkey" FOREIGN KEY ("end_qr_id") REFERENCES "QRCode"("qr_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "RentalSession"("session_id") ON DELETE RESTRICT ON UPDATE CASCADE;
