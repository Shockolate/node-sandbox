export type Account = {
  accountId: string;
  pinHash: string;
  balance: number;
  transactions: Transaction[];
  overdrawn: boolean;
};

export type Transaction = {
  happenedAt: Date;
  amount: number;
  balance: number;
};

export type InitialAccount = {
  ACCOUNT_ID: string;
  PIN: string;
  BALANCE: string;
};