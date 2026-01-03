import { BaseEntity } from ".";

export type AccountTypeEnum =
  | "asset"
  | "liability"
  | "equity"
  | "income"
  | "expense";

export interface Account {
  id?: number;
  account_number: string;
  code: string;
  name: string;
  type: AccountTypeEnum;
  isCash: boolean;
  isBank: boolean;
  debit?: number;
  credit?: number;
  balance?: number;
}

export interface AccountType {
  id: number;
  account_number: string;
  code: string;
  name: string;
  type: AccountTypeEnum;
}

export interface JournalEntryItem {
  account_code: string;
  account_name: string;
  debit: string;
  credit: string;
  narration: string;
}

export interface JournalEntry {
  transaction_id: number;
  reference_type: string;
  reference_id: number;
  date: string;
  entries: JournalEntryItem[];
}

export interface TransactionEntry {
  id: number;
  account_code: string;
  account_name: string;
  debit: number;
  credit: number;
  narration: string;
}

export interface JournalTransaction extends BaseEntity {
  reference_type: string;
  reference_id: number;
  entries: TransactionEntry[];
}
