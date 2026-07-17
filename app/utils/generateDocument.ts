import { PDFDocument } from "pdf-lib";
import { documentTypes } from "./documents";
import { documentRequestInterface } from "@/app/types/documentRequest";

const DOCUMENT_NAMES: Record<string, string> = {
  barangayCertificate: "Barangay Certificate",
  barangayClearance: "Barangay Clearance",
  certificateOfResidency: "Certificate of Residency",
  certificateOfIndigency: "Certificate of Indigency",
  certificateOfGoodMoralCharacter: "Certificate of Good Moral Character",
  certificateOfUnemployment: "Certificate of Unemployment",
  barangayBusinessClearance: "Barangay Business Clearance",
};

/**
 * Generates and downloads a filled PDF document based on the document request data.
 * Uses the PDF template specified in documentTypes and fills form fields
 * that match the document request field names.
 */
export async function generateDocumentPDF(doc: documentRequestInterface): Promise<void> {
  const docType = documentTypes.find((t) => t.document === doc.document);
  if (!docType) {
    console.error(`Unknown document type: ${doc.document}`);
    return;
  }

  const templatePath = docType.templateLocation;
  if (!templatePath) {
    console.error(`No template found for: ${doc.document}`);
    return;
  }

  try {
    // Load template
    const existingPdfBytes = await fetch(templatePath).then((res) => {
      if (!res.ok) throw new Error(`Failed to load template: ${res.statusText}`);
      return res.arrayBuffer();
    });

    // Load PDF
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    // Get form
    const form = pdfDoc.getForm();

    // Fill fields — try each field from the document type, using the request data
    for (const fieldKey of docType.fields) {
      try {
        const value = (doc as any)[fieldKey];
        if (value !== null && value !== undefined && value !== "") {
          const textField = form.getTextField(fieldKey);
          textField.setText(String(value));
        }
      } catch {
        // Field might not exist in the PDF — skip silently
      }
    }

    // Also try filling date-related fields that may have different names in templates
    try {
      const today = new Date().toLocaleDateString("en-PH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      // Common alternate field names used in PDF templates
      const alternateDates = ["date", "currentDate", "issuedDate", "today"];
      for (const alt of alternateDates) {
        try {
          const field = form.getTextField(alt);
          field.setText(today);
        } catch {
          // skip
        }
      }
    } catch {
      // skip
    }

    // Make fields non-editable
    form.flatten();

    // Save PDF
    const pdfBytes = await pdfDoc.save();

    // Download
    const fileName = `${DOCUMENT_NAMES[doc.document] || doc.document}.pdf`;
    // @ts-ignore — Uint8Array is a valid BlobPart
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Failed to generate PDF:", error);
    throw error;
  }
}
