/**
 * 22 Top-Level Company Department Codes seeded in PostgreSQL `departments`
 */
export enum DepartmentCode {
  ExecutiveLeadership = 'EXEC',
  HumanResources = 'HR',
  Engineering = 'ENG',
  QualityAssurance = 'QA',
  UiUxDesign = 'UX',
  ProductManagement = 'PROD',
  ProjectManagementOffice = 'PMO',
  DevOpsCloud = 'DEVOPS',
  ItSupportAdmin = 'IT',
  Cybersecurity = 'SEC',
  DataEngineeringAnalytics = 'DATA',
  AiMachineLearning = 'AI',
  SalesBusinessDev = 'SALES',
  MarketingCommunications = 'MKT',
  FinanceAccounting = 'FIN',
  PayrollCompensation = 'PAY',
  LegalCompliance = 'LEGAL',
  Operations = 'OPS',
  CustomerSupportSuccess = 'CS',
  AdministrationFacilities = 'ADMIN',
  LearningDevelopment = 'LND',
  ProcurementVendorManagement = 'PROC',
}

/**
 * 14 Sub-Department Codes seeded in PostgreSQL `departments`
 */
export enum SubDepartmentCode {
  // Engineering & Software Development (ENG)
  FrontendDevelopment = 'ENG-FE',
  BackendDevelopment = 'ENG-BE',
  MobileAppDevelopment = 'ENG-MOB',
  FullStackDevelopment = 'ENG-FS',
  SoftwareArchitecture = 'ENG-ARCH',

  // Human Resources (HR)
  TalentAcquisition = 'HR-TA',
  HrOperations = 'HR-OPS',
  EmployeeRelations = 'HR-ER',
  PayrollAndBenefits = 'HR-PAY',
  HrLearningAndDevelopment = 'HR-LND',

  // Finance & Accounting (FIN)
  AccountsPayable = 'FIN-AP',
  AccountsReceivable = 'FIN-AR',
  FinancialPlanning = 'FIN-FP',
  TaxAndCompliance = 'FIN-TAX',
}

