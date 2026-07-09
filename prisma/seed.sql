-- Clean tables in dependency order
DELETE FROM "Notification";
DELETE FROM "AuditLog";
DELETE FROM "Document";
DELETE FROM "ClearanceRequest";
DELETE FROM "StaffUnitAssignment";
DELETE FROM "ClearingUnit";
DELETE FROM "Student";
DELETE FROM "Staff";
DELETE FROM "User";

-- Insert Clearing Units
INSERT INTO "ClearingUnit" ("id", "name", "description", "isActive", "updatedAt") VALUES
('u1111111-1111-1111-1111-111111111111', 'University Library', 'Verifies returned library books, fine clearances, and cards surrender.', true, NOW()),
('u2222222-2222-2222-2222-222222222222', 'Bursary Department', 'Verifies complete tuition payment, hostel fees, and other school dues.', true, NOW()),
('u3333333-3333-3333-3333-333333333333', 'Academic Department', 'Verifies final-year project submission, department book returns, and course results.', true, NOW()),
('u4444444-4444-4444-4444-444444444444', 'Student Affairs', 'Verifies hostel room vacation, code of conduct clearance, and ID card surrender.', true, NOW()),
('u5555555-5555-5555-5555-555555555555', 'ICT Unit', 'Verifies institutional email sign-off and portal access status.', true, NOW()),
('u6666666-6666-6666-6666-666666666666', 'Registrar Office', 'Verifies credentials against admission file and issues final NYSC mobilisation clearance.', true, NOW());

-- Insert Users
INSERT INTO "User" ("id", "email", "hashedPassword", "name", "role", "phone", "updatedAt") VALUES
('a1111111-1111-1111-1111-111111111111', 'admin@fupre.edu.ng', '$2b$12$QMtaFefqrxKjPa24cwh5uOqB4mFOdIFkwVWx0EuhPVIL5VGc6gF2u', 'DSCS System Administrator', 'ADMIN', '+2348011112222', NOW()),
('r2222222-2222-2222-2222-222222222222', 'registrar@fupre.edu.ng', '$2b$12$yxX2y58uDAOACJfnVPuU7eQlGpAc4Ab0apaNFH2Rkes6kUW4PCBIG', 'FUPRE Academic Registrar', 'REGISTRAR', '+2348033334444', NOW()),
('s3333333-3333-3333-3333-333333333333', 'library_staff@fupre.edu.ng', '$2b$12$UXp4tAkiRLVBur7HVH3RG.mCAFkaXLbp3fjvyOiV4/1ZhscTkXt7.', 'Library Officer', 'STAFF', '+2348055556666', NOW()),
('s4444444-4444-4444-4444-444444444444', 'bursary_staff@fupre.edu.ng', '$2b$12$IN6scRmIj5hCEl4wWoLBUuk06sxs1bXwmlX2N.Drhv6/3HtwgwWp2', 'Bursary Officer', 'STAFF', '+2348055556666', NOW()),
('s5555557-5555-5555-5555-555555555555', 'academic_staff@fupre.edu.ng', '$2b$12$Sz9D8ZRX9cvKe.SOdBJ4SOSZFjkSX8yCwHBbPemEDQPMUAujFwSsi', 'Academic Head of Department', 'STAFF', '+2348055556666', NOW()),
('s6666666-6666-6666-6666-666666666666', 'sa_staff@fupre.edu.ng', '$2b$12$P64HU7TbaPoEbv4GWH3GQup1JLcZsy6mUitqu3Tr6RFVjqRj8C0T.', 'Student Affairs Officer', 'STAFF', '+2348055556666', NOW()),
('b7777777-7777-7777-7777-777777777777', 'student@fupre.edu.ng', '$2b$12$aDTupPeTbVn/ZBqHFMU7DuV1V3E.MoBzI5sFiErp/rqvGKjIYR5K6', 'FUPRE Graduating Student', 'STUDENT', '+2348077778888', NOW());

-- Insert Staff Accounts
INSERT INTO "Staff" ("userId") VALUES
('s3333333-3333-3333-3333-333333333333'),
('s4444444-4444-4444-4444-444444444444'),
('s5555557-5555-5555-5555-555555555555'),
('s6666666-6666-6666-6666-666666666666');

-- Assign Staff to Clearing Units
INSERT INTO "StaffUnitAssignment" ("staffId", "unitId") VALUES
('s3333333-3333-3333-3333-333333333333', 'u1111111-1111-1111-1111-111111111111'),
('s4444444-4444-4444-4444-444444444444', 'u2222222-2222-2222-2222-222222222222'),
('s5555557-5555-5555-5555-555555555555', 'u3333333-3333-3333-3333-333333333333'),
('s6666666-6666-6666-6666-666666666666', 'u4444444-4444-4444-4444-444444444444');

-- Insert Student Profile
INSERT INTO "Student" ("userId", "matricNumber", "department", "faculty", "level", "sessionOfGraduation") VALUES
('b7777777-7777-7777-7777-777777777777', 'CSC/2021/001', 'Computer Science', 'Science', '400 Level', '2024/2025');

-- Pre-initialize Clearance Requests for this student
INSERT INTO "ClearanceRequest" ("id", "studentId", "unitId", "status", "updatedAt") VALUES
(gen_random_uuid(), 'b7777777-7777-7777-7777-777777777777', 'u1111111-1111-1111-1111-111111111111', 'NOT_SUBMITTED', NOW()),
(gen_random_uuid(), 'b7777777-7777-7777-7777-777777777777', 'u2222222-2222-2222-2222-222222222222', 'NOT_SUBMITTED', NOW()),
(gen_random_uuid(), 'b7777777-7777-7777-7777-777777777777', 'u3333333-3333-3333-3333-333333333333', 'NOT_SUBMITTED', NOW()),
(gen_random_uuid(), 'b7777777-7777-7777-7777-777777777777', 'u4444444-4444-4444-4444-444444444444', 'NOT_SUBMITTED', NOW()),
(gen_random_uuid(), 'b7777777-7777-7777-7777-777777777777', 'u5555555-5555-5555-5555-555555555555', 'NOT_SUBMITTED', NOW()),
(gen_random_uuid(), 'b7777777-7777-7777-7777-777777777777', 'u6666666-6666-6666-6666-666666666666', 'NOT_SUBMITTED', NOW());