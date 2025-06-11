// src/components/Tabs/ExpensesList.tsx
import React from 'react';
import ExpenseCard from './ExpenseCard';
import type { Expense } from '../../types/types';

interface ExpensesListProps {
  expenses: Expense[];
}

const ExpensesList: React.FC<ExpensesListProps> = ({ expenses }) => {
  return (
    <div>
      {expenses.map((expense) => (
        <ExpenseCard key={expense.id} expense={expense} />
      ))}
    </div>
  );
};

export default ExpensesList;
