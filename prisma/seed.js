require("dotenv").config();

const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
const bcryptjs = require("bcryptjs");

const connectionString = process.env.DATABASE_URL;
const cleanConnectionString = connectionString ? connectionString.split("?")[0] : undefined;
const pool = new Pool({
  connectionString: cleanConnectionString,
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

  // 2. Define standard FUPRE Clearing Units in Sequential Order
  const unitsData = [
    { name: "Head of Department", sortOrder: 1, description: "Verifies final-year project submission, department book returns, and course results." },
    { name: "College Office", sortOrder: 2, description: "College of Science/Technology/Engineering clearance verification." },
    { name: "Admissions Office", sortOrder: 3, description: "Verifies student credentials against physical admission file." },
    { name: "Bursary Department", sortOrder: 4, description: "Verifies complete tuition payment, hostel fees, and school dues." },
    { name: "University Library", sortOrder: 5, description: "Verifies returned library books, fine clearances, and cards surrender." },
    { name: "Sports Council", sortOrder: 6, description: "Verifies sports equipment return and athletic clearances." },
    { name: "University Health Centre", sortOrder: 7, description: "Verifies medical files, student health records, and clinic clearances." },
    { name: "Security Department", sortOrder: 8, description: "Verifies ID card validation and security clearance registry check." },
    { name: "Student Affairs", sortOrder: 9, description: "Verifies hostel room vacation, code of conduct, and student body dues." },
    { name: "Exams and Records / Alumni", sortOrder: 10, description: "Verifies academic records, transcript audit, and alumni registration." }
  ];

  const units = {};
  for (const unit of unitsData) {
    const record = await prisma.clearingUnit.create({
      data: {
        name: unit.name,
        sortOrder: unit.sortOrder,
        description: unit.description,
      },
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

  // 5. Create Staff Accounts for all 10 clearing units
  const staffConfigs = [
    {
      name: "Academic Head of Department",
      email: "academic_staff@fupre.edu.ng",
      password: "academicpassword",
      unitName: "Head of Department",
    },
    {
      name: "College Officer",
      email: "college_staff@fupre.edu.ng",
      password: "collegepassword",
      unitName: "College Office",
    },
    {
      name: "Admissions Officer",
      email: "admissions_staff@fupre.edu.ng",
      password: "admissionspassword",
      unitName: "Admissions Office",
    },
    {
      name: "Bursary Officer",
      email: "bursary_staff@fupre.edu.ng",
      password: "bursarypassword",
      unitName: "Bursary Department",
    },
    {
      name: "Library Officer",
      email: "library_staff@fupre.edu.ng",
      password: "librarypassword",
      unitName: "University Library",
    },
    {
      name: "Sports Officer",
      email: "sports_staff@fupre.edu.ng",
      password: "sportspassword",
      unitName: "Sports Council",
    },
    {
      name: "Health Center Officer",
      email: "health_staff@fupre.edu.ng",
      password: "healthpassword",
      unitName: "University Health Centre",
    },
    {
      name: "Security Officer",
      email: "security_staff@fupre.edu.ng",
      password: "securitypassword",
      unitName: "Security Department",
    },
    {
      name: "Student Affairs Officer",
      email: "sa_staff@fupre.edu.ng",
      password: "sapassword",
      unitName: "Student Affairs",
    },
    {
      name: "Exams and Records Officer",
      email: "exams_staff@fupre.edu.ng",
      password: "examspassword",
      unitName: "Exams and Records / Alumni",
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
