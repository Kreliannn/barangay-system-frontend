export const documentTypes = [
  {
    document: "barangayCertificate",
    price : 30,
    fields: [
      "fullName",
      "civilStatus",
      "dateIssued",
    ],
    templateLocation: "/documents/barangayCertificate.pdf",
  },
  {
    document: "certificateOfResidency",
    price : 35,
    fields: [
      "fullName",
      "address",
      "civilStatus",
      "dateIssued",
    ],
    templateLocation: "/documents/certificateOfResidency.pdf",
  },
  {
    document: "certificateOfIndigency",
    price : 30,
    fields: [
      "fullName",
      "dateIssued",
    ],
    templateLocation: "/documents/certificateOfIdigency.pdf",
  },
  {
    document: "barangayClearance",
    price : 40,
    fields: [
      "fullName",
      "dateIssued",
      "address",
      "dateOfBirth",
      "civilStatus",
      "purpose",
      "yrsOfResidency",
    ],
    templateLocation: "/documents/barangayClearance.pdf",
  },
  {
    document: "certificateOfGoodMoralCharacter",
    price : 60,
    fields: [
      "fullName",
      "address",
      "purpose",
      "dateIssued",
    ],
    templateLocation: "/documents/certificateOfGoodMoralCharacter.pdf",
  },
  {
    document: "certificateOfUnemployment",
    price : 45,
    fields: [
      "fullName",
      "address",
      "dateOfBirth",
      "purpose",
      "dateIssued",
    ],
    templateLocation: "/documents/certificateOfUnemployment.pdf",
  },
  {
    document: "barangayBusinessClearance",
    price : 80,
    fields: [
      "fullName",
      "businessName",
      "businessAddress",
      "businessType",
      "businessNature",
      "address",
      "dateIssued",
    ],
    templateLocation: "/documents/barangayBusinessClearance.pdf",
  },
];

export const getDocumentPrice = (document: string) => {
  const doc = documentTypes.find(
    (item) => item.document === document
  );

  return doc?.price ?? 0;
};