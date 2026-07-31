export type EfdKind = "efd-icms-ipi" | "efd-contribuicoes";

export type DecimalText = string;

export type AvailabilityState =
  | "OBSERVED"
  | "NOT_AVAILABLE"
  | "NOT_APPLICABLE"
  | "PARTIAL";

export type EfdIdentity = {
  kind: EfdKind;
  layoutVersion: string;
  companyName: string;
  companyDocument: string;
  state: string;
  municipalityCode: string;
  periodStart: string;
  periodEnd: string;
};

export type Establishment = {
  code: string;
  name: string;
  document: string;
  state: string;
  stateRegistration: string;
  municipalityCode: string;
  bookkeepingIndicator: string;
};

export type IntegratedParticipant = {
  code: string;
  name: string;
  document: string;
  state: string;
};

export type IntegratedProduct = {
  code: string;
  description: string;
  unit: string;
  ncm: string;
};

export type SourceDocument = {
  sourceId: string;
  source: EfdKind;
  lineNumber: number;
  establishmentDocument: string;
  operation: "entry" | "exit" | null;
  issuer: "own" | "third-party" | null;
  participantCode: string;
  participantDocument: string;
  model: string;
  status: string;
  series: string;
  subseries: string;
  number: string;
  documentKey: string;
  documentKeyValid: boolean;
  issueDate: string;
  movementDate: string;
  total: DecimalText | null;
  merchandiseTotal: DecimalText | null;
  icms: DecimalText | null;
  ipi: DecimalText | null;
  pis: DecimalText | null;
  cofins: DecimalText | null;
  cancelled: boolean;
};

export type SourceItem = {
  sourceId: string;
  source: EfdKind;
  lineNumber: number;
  documentSourceId: string;
  establishmentDocument: string;
  itemNumber: string;
  productCode: string;
  description: string;
  ncm: string;
  quantity: DecimalText | null;
  unit: string;
  value: DecimalText | null;
  cfop: string;
  icmsCst: string;
  icmsBase: DecimalText | null;
  icmsRate: DecimalText | null;
  icms: DecimalText | null;
  ipiCst: string;
  ipiBase: DecimalText | null;
  ipiRate: DecimalText | null;
  ipi: DecimalText | null;
  pisCst: string;
  pisBase: DecimalText | null;
  pisRate: DecimalText | null;
  pis: DecimalText | null;
  cofinsCst: string;
  cofinsBase: DecimalText | null;
  cofinsRate: DecimalText | null;
  cofins: DecimalText | null;
};

export type SourceSummary = {
  sourceId: string;
  documentSourceId: string;
  lineNumber: number;
  cfop: string;
  icmsCst: string;
  icmsRate: DecimalText | null;
  operationValue: DecimalText | null;
  icmsBase: DecimalText | null;
  icms: DecimalText | null;
  ipi: DecimalText | null;
};

export type ContributionAssessment = {
  register: "M100" | "M200" | "M500" | "M600";
  lineNumber: number;
  contribution: "PIS" | "COFINS";
  nature: "credit" | "debit";
  code: string;
  base: DecimalText | null;
  rate: DecimalText | null;
  calculated: DecimalText | null;
  availableCredit: DecimalText | null;
  payable: DecimalText | null;
};

export type IntegratedInventoryItem = {
  productCode: string;
  description: string;
  unit: string;
  quantity: DecimalText | null;
  unitValue: DecimalText | null;
  totalValue: DecimalText | null;
};

export type IntegratedInventory = {
  date: string;
  totalValue: DecimalText | null;
  reason: string;
  items: IntegratedInventoryItem[];
};

export type IntegratedParseResult = {
  kind: EfdKind;
  identity: EfdIdentity;
  establishments: Establishment[];
  participants: IntegratedParticipant[];
  products: IntegratedProduct[];
  documents: SourceDocument[];
  items: SourceItem[];
  summaries: SourceSummary[];
  contributionAssessments: ContributionAssessment[];
  inventories: IntegratedInventory[];
  recordCounts: Record<string, number>;
  warnings: string[];
  lineCount: number;
};

export type PairValidation =
  | {
      ok: true;
      periodStart: string;
      periodEnd: string;
      establishmentDocument: string;
      contributionsEstablishment: Establishment;
    }
  | {
      ok: false;
      code:
        | "WRONG_FILE_PAIR"
        | "PERIOD_MISMATCH"
        | "ESTABLISHMENT_NOT_DECLARED"
        | "ESTABLISHMENT_WITHOUT_C010";
      error: string;
    };

export type DocumentMatchClass =
  | "CONCILIADO_EXATO"
  | "CONCILIADO_COM_DIVERGENCIA"
  | "CONCILIADO_PROVAVEL"
  | "SOMENTE_ICMS_IPI"
  | "SOMENTE_CONTRIBUICOES"
  | "AMBIGUO";

export type AbsenceAssessmentCode =
  | "AUSENCIA_ESPERADA"
  | "AUSENCIA_PROVAVEL"
  | "A_CONFERIR"
  | "INDETERMINADO"
  | "NAO_APLICAVEL";

export type AbsenceAssessment = {
  code: AbsenceAssessmentCode;
  reason: string;
  itemsExamined: number;
  evidence: "CFOP_E_CST" | "CFOP" | "CST" | "NENHUMA";
};

export type DocumentMatch = {
  id: string;
  classification: DocumentMatchClass;
  method: "NFE_KEY" | "COMPOSITE_KEY" | "SCORED" | "UNMATCHED" | "AMBIGUOUS";
  confidence: number;
  icmsDocumentSourceId: string | null;
  contributionsDocumentSourceId: string | null;
  candidateSourceIds: string[];
  divergences: string[];
  /**
   * Qualificação da ausência, presente somente na classe SOMENTE_ICMS_IPI.
   * Distingue a ausência esperada pela regra de escrituração da ausência que
   * merece conferência. Ver lib/integrated/absence.ts.
   */
  absence?: AbsenceAssessment;
};

export type ItemMatchClass =
  | "CONCILIADO_EXATO"
  | "CONCILIADO_COM_DIVERGENCIA"
  | "SOMENTE_ICMS_IPI"
  | "SOMENTE_CONTRIBUICOES"
  | "AMBIGUO"
  | "NAO_APLICAVEL";

export type ItemMatch = {
  id: string;
  documentMatchId: string;
  classification: ItemMatchClass;
  method:
    | "ITEM_NUMBER"
    | "PRODUCT_CODE"
    | "NCM_QUANTITY_UNIT_VALUE"
    | "UNMATCHED"
    | "AMBIGUOUS"
    | "NOT_APPLICABLE";
  confidence: number;
  icmsItemSourceId: string | null;
  contributionsItemSourceId: string | null;
  candidateSourceIds: string[];
  divergences: string[];
};

export type IntegratedAnalysis = {
  icms: IntegratedParseResult;
  contributions: IntegratedParseResult;
  pair: Extract<PairValidation, { ok: true }>;
  documentMatches: DocumentMatch[];
  itemMatches: ItemMatch[];
  operational: IntegratedOperational;
};

export type ExactRankingItem = {
  label: string;
  value: DecimalText;
};

export type IntegratedOperational = {
  totalEntries: DecimalText | null;
  totalExits: DecimalText | null;
  activeDocuments: number;
  topCustomers: ExactRankingItem[];
  topSuppliers: ExactRankingItem[];
  topSoldProducts: ExactRankingItem[];
  topPurchasedProducts: ExactRankingItem[];
  customerConcentration: DecimalText | null;
  supplierConcentration: DecimalText | null;
  skuMoved: number;
  inventoryTotal: DecimalText | null;
};
