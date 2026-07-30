export type SpedCompany = {
  name: string;
  document: string;
  state: string;
  startDate: string;
  endDate: string;
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
  value: number;
  cfop: string;
};

export type FiscalSummary = {
  documentId: number;
  operation: "entry" | "exit";
  cfop: string;
  operationValue: number;
  icms: number;
};

export type SpedParseResult = {
  company: SpedCompany;
  participants: Participant[];
  products: Product[];
  documents: FiscalDocument[];
  items: FiscalItem[];
  summaries: FiscalSummary[];
  recordCounts: Record<string, number>;
  warnings: string[];
  lineCount: number;
};

export type RankingItem = {
  label: string;
  value: number;
  detail?: string;
};

export type DashboardData = {
  company: SpedCompany;
  totalEntries: number;
  totalExits: number;
  operationDifference: number;
  activeDocuments: number;
  cancelledDocuments: number;
  icmsRegistered: number;
  averageTicket: number;
  topSuppliers: RankingItem[];
  topCustomers: RankingItem[];
  topPurchasedProducts: RankingItem[];
  topSoldProducts: RankingItem[];
  cfopRanking: RankingItem[];
  quality: {
    documentsWithoutParticipant: number;
    itemsWithoutProduct: number;
    documentsWithoutDate: number;
  };
  technical: {
    lineCount: number;
    documentCount: number;
    itemCount: number;
    summaryCount: number;
    processedAt: string;
    engine: string;
  };
  warnings: string[];
};

