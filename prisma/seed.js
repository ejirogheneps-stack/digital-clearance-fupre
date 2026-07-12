require("dotenv").config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
const bcryptjs = require("bcryptjs");

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Starting database seeding...");

  // 1. Clean existing records in dependency order
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.document.deleteMany();
  await prisma.clearanceRequest.deleteMany();
  await prisma.staffUnitAssignment.deleteMany();
  await prisma.clearingUnit.deleteMany();
  await prisma.student.deleteMany();
  await prisma.staff.deleteMany();
  await prisma.user.deleteMany();

  console.log("Database cleaned.");

  // 2. Define standard FUPRE Clearing Units
  const unitsData = [
    { name: "University Library", description: "Verifies returned library books, fine clearances, and cards surrender." },
    { name: "Bursary Department", description: "Verifies complete tuition payment, hostel fees, and other school dues." },
    { name: "Academic Department", description: "Verifies final-year project submission, department book returns, and course results." },
    { name: "Student Affairs", description: "Verifies hostel room vacation, code of conduct clearance, and ID card surrender." },
    { name: "ICT Unit", description: "Verifies institutional email sign-off and portal access status." },
    { name: "Registrar Office", description: "Verifies credentials against admission file and issues final NYSC mobilisation clearance." },
  ];

  const units = {};
  for (const unit of unitsData) {
    const record = await prisma.clearingUnit.create({
      data: unit,
    });
    units[unit.name] = record;
  }
  console.log(`Created ${Object.keys(units).length} clearing units.`);

  // 3. Create Admin Account
  const hashedAdminPassword = await bcryptjs.hash("adminpassword", 12);
  const adminUser = await prisma.user.create({
    data: {
      name: "DSCS System Administrator",
      email: "admin@fupre.edu.ng",
      hashedPassword: hashedAdminPassword,
      role: "ADMIN",
      phone: "+2348011112222",
    },
  });
  console.log("Created Admin account:", adminUser.email);

  // 4. Create Registrar Account
  const hashedRegistrarPassword = await bcryptjs.hash("registrarpassword", 12);
  const registrarUser = await prisma.user.create({
    data: {
      name: "FUPRE Academic Registrar",
      email: "registrar@fupre.edu.ng",
      hashedPassword: hashedRegistrarPassword,
      role: "REGISTRAR",
      phone: "+2348033334444",
    },
  });
  console.log("Created Registrar account:", registrarUser.email);

  // 5. Create Staff Accounts
  const staffConfigs = [
    {
      name: "Library Officer",
      email: "library_staff@fupre.edu.ng",
      password: "librarypassword",
      unitName: "University Library",
    },
    {
      name: "Bursary Officer",
      email: "bursary_staff@fupre.edu.ng",
      password: "bursarypassword",
      unitName: "Bursary Department",
    },
    {
      name: "Academic Head of Department",
      email: "academic_staff@fupre.edu.ng",
      password: "academicpassword",
      unitName: "Academic Department",
    },
    {
      name: "Student Affairs Officer",
      email: "sa_staff@fupre.edu.ng",
      password: "sapassword",
      unitName: "Student Affairs",
    },
  ];

  for (const config of staffConfigs) {
    const hashedPassword = await bcryptjs.hash(config.password, 12);
    const user = await prisma.user.create({
      data: {
        name: config.name,
        email: config.email,
        hashedPassword,
        role: "STAFF",
        phone: "+2348055556666",
      },
    });

    const staff = await prisma.staff.create({
      data: {
        userId: user.id,
      },
    });

    const assignedUnit = units[config.unitName];
    if (assignedUnit) {
      await prisma.staffUnitAssignment.create({
        data: {
          staffId: staff.userId,
          unitId: assignedUnit.id,
        },
      });
      console.log(`Created Staff: ${user.email} assigned to ${config.unitName}`);
    }
  }

  // 6. Create Student Account
  const hashedStudentPassword = await bcryptjs.hash("studentpassword", 12);
  const studentUser = await prisma.user.create({
    data: {
      name: "FUPRE Graduating Student",
      email: "student@fupre.edu.ng",
      hashedPassword: hashedStudentPassword,
      role: "STUDENT",
      phone: "+2348077778888",
    },
  });

  const studentProfile = await prisma.student.create({
    data: {
      userId: studentUser.id,
      matricNumber: "CSC/2021/001",
      department: "Computer Science",
      faculty: "Science",
      level: "400 Level",
      sessionOfGraduation: "2024/2025",
    },
  });

  // Pre-initialize clearance requests for this student
  const activeUnits = await prisma.clearingUnit.findMany({
    where: { isActive: true },
  });

  await prisma.clearanceRequest.createMany({
    data: activeUnits.map((unit) => ({
      studentId: studentUser.id,
      unitId: unit.id,
      status: "NOT_SUBMITTED",
    })),
  });

  console.log(`Created Student: ${studentUser.email} with ${activeUnits.length} clearance requests initialized.`);
  console.log("Database seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
