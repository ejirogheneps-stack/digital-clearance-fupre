import PDFDocument from "pdfkit";
import crypto from "crypto";

interface CertificateData {
  studentName: string;
  matricNumber: string;
  department: string;
  faculty: string;
  sessionOfGraduation: string;
  issuedAt: Date;
}

/**
 * Generates a beautifully formatted PDF clearance certificate in memory
 * and returns it as a Buffer.
 */
export async function generateClearanceCertificate(data: CertificateData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
    });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", (err) => reject(err));

    // --- Design System Elements ---
    const primaryColor = "#005a36"; // FUPRE Forest Green
    const secondaryColor = "#1a1a1a"; // Dark Charcoal
    const lightGrey = "#e5e7eb"; // Border color
    const darkGrey = "#4b5563"; // Subtitles

    // Draw page border
    doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40)
       .lineWidth(3)
       .stroke(primaryColor);

    doc.rect(25, 25, doc.page.width - 50, doc.page.height - 50)
       .lineWidth(1)
       .stroke(lightGrey);

    // --- Header ---
    doc.moveDown(2);
    doc.fillColor(primaryColor)
       .fontSize(18)
       .text("FEDERAL UNIVERSITY OF PETROLEUM RESOURCES, EFFURUN", { align: "center" });

    doc.moveDown(0.3);
    doc.fillColor(darkGrey)
       .fontSize(10)
       .text("PMB 1221, Effurun, Delta State, Nigeria", { align: "center" });

    doc.moveDown(0.2);
    doc.text("Department of Computer Science / Academic Affairs Directorate", { align: "center" });

    // Decorative Horizontal Line
    doc.moveDown(1);
    doc.moveTo(50, doc.y)
       .lineTo(doc.page.width - 50, doc.y)
       .strokeColor(primaryColor)
       .lineWidth(1.5)
       .stroke();

    // --- Title ---
    doc.moveDown(2.5);
    doc.fillColor(primaryColor)
       .fontSize(22)
       .text("DIGITAL STUDENT CLEARANCE CERTIFICATE", { align: "center" });

    // --- Certification Text ---
    doc.moveDown(2);
    doc.fillColor(secondaryColor)
       .fontSize(12)
       .text(
         "This is to certify that the undergraduate student named below has successfully completed the digital clearance process. This student has been cleared of all financial, academic, and administrative liabilities across all designated clearing units of the university.",
         { align: "justify", lineGap: 4 }
       );

    // --- Student Details Table ---
    doc.moveDown(2.5);
    const tableStartY = doc.y;
    const labelX = 80;
    const valueX = 220;

    const details = [
      { label: "FULL NAME:", value: data.studentName.toUpperCase() },
      { label: "MATRICULATION NO:", value: data.matricNumber.toUpperCase() },
      { label: "DEPARTMENT:", value: data.department.toUpperCase() },
      { label: "FACULTY:", value: data.faculty.toUpperCase() },
      { label: "GRADUATION SESSION:", value: data.sessionOfGraduation },
      { label: "DATE OF ISSUANCE:", value: data.issuedAt.toLocaleDateString() },
    ];

    details.forEach((item, index) => {
      const currentY = tableStartY + index * 24;
      doc.fillColor(primaryColor)
         .fontSize(11)
         .text(item.label, labelX, currentY);

      doc.fillColor(secondaryColor)
         .fontSize(11)
         .text(item.value, valueX, currentY);

      // Draw subtle separator lines
      doc.moveTo(80, currentY + 16)
         .lineTo(doc.page.width - 80, currentY + 16)
         .strokeColor(lightGrey)
         .lineWidth(0.5)
         .stroke();
    });

    // --- Verification Hash Generator ---
    doc.moveDown(8);
    const rawHashString = `${data.matricNumber}-${data.issuedAt.getTime()}-FUPRE-SECRET`;
    const verificationHash = crypto.createHash("sha256").update(rawHashString).digest("hex").slice(0, 16).toUpperCase();

    // Boxed Verification Code
    const hashY = doc.y;
    doc.rect(80, hashY, doc.page.width - 160, 45)
       .fillColor("#f3f4f6")
       .fill();

    doc.fillColor(darkGrey)
       .fontSize(9)
       .text("VERIFICATION AUTHENTICITY CODE:", labelX + 10, hashY + 10);
    doc.fillColor(primaryColor)
       .fontSize(14)
       .text(verificationHash, labelX + 10, hashY + 22, { characterSpacing: 1 });

    // --- Signatures Layout ---
    const footerY = doc.page.height - 130;

    // Registrar Signature Area
    doc.moveTo(80, footerY)
       .lineTo(240, footerY)
       .strokeColor(darkGrey)
       .lineWidth(1)
       .stroke();

    doc.fillColor(secondaryColor)
       .fontSize(10)
       .text("OFFICE OF THE REGISTRAR", 80, footerY + 5);
    doc.fontSize(8)
       .fillColor(darkGrey)
       .text("FUPRE Administration", 80, footerY + 18);

    // Systems Administrator Signature Area
    doc.moveTo(doc.page.width - 240, footerY)
       .lineTo(doc.page.width - 80, footerY)
       .stroke();

    doc.fillColor(secondaryColor)
       .fontSize(10)
       .text("SYSTEMS ADMINISTRATOR", doc.page.width - 240, footerY + 5);
    doc.fontSize(8)
       .fillColor(darkGrey)
       .text("Digital Clearance Portal (DSCS)", doc.page.width - 240, footerY + 18);

    // Finalize document
    doc.end();
  });
}
