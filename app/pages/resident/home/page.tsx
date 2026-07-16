"use client";

import { PDFDocument } from "pdf-lib";

export default function Page() {
  const generatePDF = async () => {
    // Load template
    const existingPdfBytes = await fetch("/documents/residency.pdf").then(
      (res) => res.arrayBuffer()
    );

    // Load PDF
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    // Get form
    const form = pdfDoc.getForm();

    // Fill fields
    form.getTextField("fullName").setText("krelian");
    form.getTextField("date").setText("July 222, 2026");

    // Optional: make fields non-editable
    form.flatten();

    // Save PDF
    const pdfBytes = await pdfDoc.save();

    // Download
    //@ts-ignore
    const blob = new Blob([pdfBytes], {
      type: "application/pdf",
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "Barangay Clearance.pdf";
    a.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full min-h-dvh p-6 space-y-6">
      <button
        onClick={generatePDF}
        className="px-4 py-2 bg-blue-600 text-white rounded-md"
      >
        Download Barangay Clearance
      </button>
    </div>
  );
}