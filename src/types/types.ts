// src/types/index.ts → içine şunu komple koy:
export interface Event {
  id: string;
  name: string;
  location: string;
  participantCount: number;
  icon: string;
  currency: string;
}

export interface Expense {
  id: string;
  description: string;
  eventName: string;
  amount: number;
  currency: string;
  place: string;
  date: string;
  category: 'food' | 'accommodation' | 'transport' | 'entertainment' | 'other';
}

export interface UserSummary {
  totalExpenses: number;
  pendingReceivables: number;
  currency: string;
}

export interface User {
  name: string;
  gezginNo: string;
  location: string;
}
