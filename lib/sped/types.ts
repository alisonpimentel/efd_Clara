export type SpedCompany = {
  name: string;
  tradeName: string;
  document: string;
  state: string;
  stateRegistration: string;
  municipalityCode: string;
  municipalRegistration: string;
  suframa: string;
  profile: string;
  activityIndicator: string;
  startDate: string;
  endDate: string;
  address: {
    postalCode: string;
    street: string;
    number: string;
    complement: string;
    district: string;
  };
  phone: string;
  email: string;
};

export type Accountant = {
  name: string;
  document: string;
  crc: string;
  officeDocument: string;
  municipalityCode: string;
  address: {
    postalCode: string;
    street: string;
    number: string;
    complement: string;
    district: string;
  };
  phone: string;
  email: string;
};

export type Participant = {
  code: string;
  name: string;
  document: string;
};

export type Product = {
  code: string;
  description: string;
  unit: string;
  ncm: string;
};

export type FiscalDocument = {
  id: number;
  operation: "entry" | "exit";
  participantCode: string;
  participantName: string;
  model: string;
  status: string;
  number: string;
  date: string;
  total: number;
  merchandiseTotal: number;
  icms: number;
  cancelled: boolean;
};

export type FiscalItem = {
  documentId: number;
  operation: "entry" | "exit";
  productCode: string;
  productDescription: string;
  quantity: number;
  unit: string;
  value: number;
  cfop: string;
  icmsBase: number;
  icmsRate: number;
  icms: number;
};

export type FiscalSummary = {
  documentId: number;
  operation: "entry" | "exit";
  cfop: string;
  operationValue: number;
  icms: number;
};

export type TaxAssessment = {
  periodStart: string;
  periodEnd: string;
  totalDebits: number;
  debitAdjustmentsFromDocuments: number;
  totalDebitAdjustments: number;
  creditReversals: number;
  totalCredits: number;
  creditAdjustmentsFromDocuments: number;
  totalCreditAdjustments: number;
  debitReversals: number;
  priorCreditBalance: number;
  assessedBalance: number;
  totalDeductions: number;
  icmsToCollect: number;
  creditToCarry: number;
  specialDebits: number;
};

export type InventoryItem = {
  code: string;
  description: string;
  unit: string;
  quantity: number;
  unitValue: number;
  totalValue: number;
  ownership: "own" | "own-with-third-party" | "third-party" | "unknown";
};

export type Inventory = {
  date: string;
  totalValue: number;
  reason: string;
  items: InventoryItem[];
};

export type SpedParseResult = {
  company: SpedCompany;
  participants: Participant[];
  products: Product[];
  documents: FiscalDocument[];
  items: FiscalItem[];
  summaries: FiscalSummary[];
  assessments: TaxAssessment[];
  inventories: Inventory[];
  accountant: Accountant | null;
  recordCounts: Record<string, number>;
  warnings: string[];
  lineCount: number;
};

export type RankingItem = {
  label: string;
  value: number;
  detail?: string;
  share?: number;
  cumulativeShare?: number;
  abcClass?: "A" | "B" | "C";
};

export type TrendPoint = {
  date: string;
  entries: number;
  exits: number;
};

export type AverageUnitValue = {
  label: string;
  unit: string;
  operation: "entry" | "exit";
  quantity: number;
  totalValue: number;
  averageValue: number;
};

export type GeographicShare = {
  category: "internal" | "interstate" | "foreign" | "unclassified";
  label: string;
  value: number;
  share: number;
};

export type WeekdayActivity = {
  weekday: number;
  label: string;
  documentCount: number;
  totalValue: number;
  daysInPeriod: number;
  averageDocuments: number;
  averageValue: number;
};

export type CancellationSummary = {
  entry: {
    cancelled: number;
    total: number;
    rate: number;
  };
  exit: {
    cancelled: number;
    total: number;
    rate: number;
  };
};

export type ManagementInsight = {
  tone: "positive" | "attention" | "neutral";
  title: string;
  description: string;
};

export type InventorySummary = {
  date: string;
  totalValue: number;
  itemCount: number;
  reason: string;
  topItems: RankingItem[];
  ownership: {
    own: number;
    ownWithThirdParty: number;
    thirdParty: number;
    unknown: number;
  };
};

export type DashboardData = {
  company: SpedCompany;
  accountant: Accountant | null;
  totalEntries: number;
  totalExits: number;
  operationDifference: number;
  activeDocuments: number;
  cancelledDocuments: number;
  icmsRegistered: number;
  averageTicket: number;
  averageEntryTicket: number;
  averageExitTicket: number;
  uniqueSuppliers: number;
  uniqueCustomers: number;
  supplierConcentration: number;
  customerConcentration: number;
  icmsOnEntries: number;
  icmsOnExits: number;
  trend: TrendPoint[];
  topSuppliers: RankingItem[];
  topCustomers: RankingItem[];
  topPurchasedProducts: RankingItem[];
  topSoldProducts: RankingItem[];
  customerAbc: RankingItem[];
  productAbc: RankingItem[];
  averageUnitValues: AverageUnitValue[];
  geographicShares: GeographicShare[];
  weekdayActivity: WeekdayActivity[];
  skuActivity: {
    moved: number;
    purchased: number;
    sold: number;
    soldShareOfMoved: number;
  };
  cancellations: CancellationSummary;
  cfopRanking: RankingItem[];
  icmsCreditEntryValue: number;
  totalEntryOperationValue: number;
  icmsCreditEntryShare: number;
  apparentIcmsBurden: number;
  assessment: TaxAssessment | null;
  inventory: InventorySummary | null;
  insights: ManagementInsight[];
  quality: {
    documentsWithoutParticipant: number;
    itemsWithoutProduct: number;
    documentsWithoutDate: number;
    c100C190Difference: number;
  };
  technical: {
    lineCount: number;
    documentCount: number;
    itemCount: number;
    summaryCount: number;
    assessmentCount: number;
    inventoryCount: number;
    processedAt: string;
    engine: string;
  };
  warnings: string[];
};
