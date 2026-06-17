// ─── Boutiquier ───────────────────────────────────────────────────────────────

export type BoutiquierCategory = 'Observation' | 'Standard' | 'Or' | 'Platine';

export interface ActiveCredit {
  id: string;
  boutiquier_id: string;
  grossiste_id: string;
  payout_transaction_id: string;
  amount: string;
  status: CreditStatus;
  due_date: string;
  created_at: string;
  updated_at: string;
  grossiste_name: string;
}

export interface Boutiquier {
  id: string;
  name: string;
  phone_number: string;
  category: BoutiquierCategory;
  credit_limit: string;
  current_score: string;
  created_at: string;
  updated_at: string;
  activeCredit: ActiveCredit | null;
}

export interface ScoreHistoryPoint {
  score: string;
  category: BoutiquierCategory;
  credit_limit: string;
  recorded_at: string;
}

// ─── Credit / Transaction statuses ───────────────────────────────────────────

export type CreditStatus =
  | 'PENDING_DELIVERY'
  | 'ACTIVE'
  | 'REPAID'
  | 'DEFAULT'
  | 'CANCELLED';

export type TransactionStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED';

// ─── Grossiste ────────────────────────────────────────────────────────────────

export interface Grossiste {
  id: string;
  name: string;
  phone_number: string;
  mmo_provider: string;
  created_at: string;
}

export interface GrossisteOrder {
  id: string;
  amount: string;
  currency: string;
  provider: string;
  status: string;
  created_at: string;
  updated_at: string;
  boutiquier_name: string;
  boutiquier_phone: string;
}

export interface PendingOrder {
  credit_id: string;
  amount: string;
  credit_status: CreditStatus;
  created_at: string;
  boutiquier_name: string;
  boutiquier_id?: string;   // optionnel — présent selon version backend
  phone_number: string;
  provider: string;
  payout_id: string;
}

// ─── Bank Dashboard ───────────────────────────────────────────────────────────

export interface BankMetrics {
  credits_defaut: number;
  credits_actifs: number;
  credits_rembourses: number;
  credits_annules: number;
  total_credits: number;
  encours_total: number;
  montant_defaut: number;
  montant_rembourse: number;
  npl_rate: number;
}

export interface CategoryCount {
  category: BoutiquierCategory;
  count: string;
}

export interface NplEvolutionPoint {
  day: string;
  observation_count: string;
  total_count: string;
}

export interface BankBoutiquier {
  id: string;
  name: string;
  phone_number: string;
  current_score: string;
  category: BoutiquierCategory;
  credit_limit: string;
  active_credits_count: string;
  active_encours: string;
}

export interface MonthlyStats {
  month: string;
  total_accorde: string;
  total_rembourse: string;
  total_defaut: string;
}

export interface BankDashboard {
  metrics: BankMetrics;
  categories: CategoryCount[];
  npl_evolution: NplEvolutionPoint[];
  boutiquiers: BankBoutiquier[];
  monthly: MonthlyStats[];
}

// ─── Deposits / Payouts / Repayments ─────────────────────────────────────────

export interface DepositResponse {
  depositId: string;
  status: 'ACCEPTED' | 'REJECTED';
  nextStep?: string;
  reason?: string;
  message?: string;
}

export interface PayoutResponse {
  payoutId: string;
  status: 'ACCEPTED';
}

export interface RepaymentResponse {
  depositId: string;
  creditId: string;
  status: 'ACCEPTED';
  nextStep: string;
}

// ─── Socket events ────────────────────────────────────────────────────────────

export interface ScoreUpdatedEvent {
  boutiquierId: string;
  finalScore: number;
  category: BoutiquierCategory;
  creditLimit: number;
}

export interface PayoutCompletedEvent {
  payoutId: string;
  boutiquierId: string;
}
