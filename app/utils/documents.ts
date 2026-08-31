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
  {
    document: "certificateOfCuttingTrees",
    price : 80,
    fields: [
      "fullName",
      "sqrmtr",
      "dateIssued",
    ],
    templateLocation: "/documents/CertififcateOfTreeCutting.pdf",
  },

  {
    document: "certificateOfAppearance",
    price : 80,
    fields: [
      "fullName",
      "Purpose",
      "Activity",
      "dateIssued",
    ],
    templateLocation: "/documents/certificate-of-appearance.pdf",
  },


   {
    document: "certificateOfAttestation",
    price : 80,
    fields: [
      "fullName",
      "monthlyIncome",
      "monthlyExpences",
      "dateIssued",
    ],
    templateLocation: "/documents/CertificateOfAttestation.pdf",
  },


  {
    document: "certificateOfLowIncome",
    price : 80,
    fields: [
      "fullName",
      "partner",
      "monthlyIncome",
      "child",
      "dateIssued",
    ],
    templateLocation: "/documents/CertificateOfLowIncome.pdf",
  },


  {
    document: "certificateOfFirstJobSeeker",
    price : 80,
    fields: [
      "fullName",
      "age",
      "dateIssued",
    ],
    templateLocation: "/documents/certification-of-first-time-jobseeker (1).pdf",
  },

];

export const getDocumentPrice = (document: string) => {
  const doc = documentTypes.find(
    (item) => item.document === document
  );

  return doc?.price ?? 0;
};