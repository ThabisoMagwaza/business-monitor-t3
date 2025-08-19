import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Plus, Edit3, Trash2, Check } from 'lucide-react';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';

import { Separator } from '~/components/ui/separator';
import DatePicker from '../DatePicker/DatePicker';
import { formatCurrencyAmount, formatDate } from '~/lib/helpers';
import FormSubmitButton from '../FormSubmitButton/FormSubmitButton';
import { addTransactions } from '~/app/actions';

import type { NewTransaction } from '~/app/actions';

function AddTransactionsForm({
  type,
  initialTransactions,
}: {
  type: 'expense' | 'income';
  initialTransactions: NewTransaction[];
}) {
  const [transactions, setTransactions] =
    React.useState<NewTransaction[]>(initialTransactions);
  const [editingId, setEditingId] = React.useState<number | null>(null);

  const saveNewTransactions = addTransactions.bind(null, transactions, type);

  const handleEdit = (id: number) => {
    setEditingId(id);
  };

  const handleSaveEdit = () => {
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    // Reset transaction to original value
    setTransactions(transactions);
  };

  const handleUpdateTransaction = (
    id: number,
    field: keyof NewTransaction,
    value: string
  ) => {
    setTransactions((prev) => {
      if (!prev) {
        return [];
      }

      return prev.map((transaction) =>
        transaction.id === id ? { ...transaction, [field]: value } : transaction
      );
    });
  };

  const handleDeleteTransaction = (id: number) => {
    setTransactions((prev) => {
      if (!prev) {
        return [];
      }

      return prev.filter((transaction) => transaction.id !== id);
    });
  };

  const calculateTotal = () => {
    return transactions
      ?.reduce((sum, transaction) => {
        return sum + parseFloat(transaction.amount || '0');
      }, 0)
      .toFixed(2);
  };

  const handleAddTransaction = () => {
    const newTransaction: NewTransaction = {
      id: transactions?.length ?? 0 + 1,
      description: '',
      amount: '0.00',
      date: new Date().toISOString(),
    };
    setTransactions((prev) => {
      if (!prev) {
        return [];
      }

      return [...prev, newTransaction];
    });
    setEditingId(newTransaction.id);
  };

  return (
    <form action={saveNewTransactions} className="flex flex-col gap-4">
      <Card className="bg-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Extracted Transactions</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddTransaction}
            className="h-8"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {transactions?.map((transaction, index) => (
            <div key={transaction.id}>
              {editingId === transaction.id ? (
                /* Edit Mode */
                <div className="space-y-3 p-3 border border-primary/20 rounded-lg bg-primary/5">
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input
                      value={transaction.description}
                      onChange={(e) => {
                        if (!e.target.value) {
                          return;
                        }

                        handleUpdateTransaction(
                          transaction.id,
                          'description',
                          e.target.value
                        );
                      }}
                      placeholder="Transaction description"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Amount (R)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={transaction.amount}
                        onChange={(e) =>
                          handleUpdateTransaction(
                            transaction.id,
                            'amount',
                            e.target.value
                          )
                        }
                        placeholder="0.00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Date</Label>
                      <DatePicker
                        initialDate={new Date(transaction.date)}
                        onDateChangeAction={(date) =>
                          handleUpdateTransaction(transaction.id, 'date', date)
                        }
                      />
                    </div>
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <Button
                      size="sm"
                      onClick={handleSaveEdit}
                      type="button"
                      className="flex-1"
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelEdit}
                      type="button"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                /* View Mode */
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">
                      {transaction.description}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(new Date(transaction.date))}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3 ml-3">
                    <p className="font-semibold text-foreground">
                      {formatCurrencyAmount(Number(transaction.amount))}
                    </p>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(transaction.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit3 className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTransaction(transaction.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {index < transactions.length - 1 &&
                editingId !== transaction.id && <Separator className="mt-4" />}
            </div>
          ))}

          {transactions?.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-3">
                No transactions found
              </p>
              <Button
                variant="outline"
                onClick={handleAddTransaction}
                className="mx-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Transaction
              </Button>
            </div>
          )}

          {transactions && transactions.length > 0 && (
            <>
              <Separator className="my-4" />
              <div className="flex justify-between items-center pt-2">
                <p className="font-semibold">Total Amount</p>
                <p className="font-bold text-lg">
                  {formatCurrencyAmount(Number(calculateTotal()))}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="mt-4 mb-4 flex-end flex flex-col gap-2">
        <FormSubmitButton loadingText="Saving Transactions...">
          Save
        </FormSubmitButton>
      </div>
    </form>
  );
}

export default AddTransactionsForm;
