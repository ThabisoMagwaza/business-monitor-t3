'use client';
import * as React from 'react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Edit3, Trash2, Check, X, Calendar, Plus } from 'lucide-react';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '~/components/ui/dialog';
import { Separator } from '~/components/ui/separator';
import { Badge } from '~/components/ui/badge';
import DatePicker from '../DatePicker/DatePicker';
import { formatCurrencyAmount } from '~/lib/helpers';
import FormSubmitButton from '../FormSubmitButton/FormSubmitButton';

import type { NewTransaction } from '~/app/actions';

function createDefaultTransaction(): NewTransaction {
  return {
    id: Math.floor(Math.random() * 1000000),
    description: '',
    date: new Intl.DateTimeFormat('en-ZA')
      .format(new Date())
      .replaceAll('/', '-'),
    amount: '0',
  };
}

function validateTransaction(transaction: NewTransaction): boolean {
  if (!transaction) {
    return false;
  }

  if (!transaction.description) {
    return false;
  }

  if (!transaction.amount) {
    return false;
  }

  return true;
}

function AddTransactionsForm({
  type,
  initialTransactions,
  saveTransactions,
}: {
  type: 'expense' | 'income';
  initialTransactions: NewTransaction[];
  saveTransactions: (
    transactions: NewTransaction[],
    type: 'expense' | 'income'
  ) => void;
}) {
  const [transactions, setTransactions] =
    React.useState<NewTransaction[]>(initialTransactions);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [editingTransaction, setEditingTransaction] =
    React.useState<NewTransaction | null>(null);

  const saveNewTransactions = saveTransactions.bind(null, transactions, type);

  const handleEdit = (id: number) => {
    const transaction = transactions.find((t) => t.id === id);
    if (transaction) {
      setEditingTransaction(transaction);
      setIsEditDialogOpen(true);
    }
  };

  const handleSaveEdit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log('handleSaveEdit');

    if (editingTransaction) {
      setTransactions((prev: NewTransaction[]) =>
        prev.map((transaction) =>
          transaction.id === editingTransaction.id
            ? editingTransaction
            : transaction
        )
      );
    }
    setIsEditDialogOpen(false);
    setEditingTransaction(null);
  };

  const handleCancelEdit = () => {
    setIsEditDialogOpen(false);
    setEditingTransaction(null);
  };

  const handleUpdateEditingTransaction = (
    field: keyof NewTransaction,
    value: string
  ) => {
    if (editingTransaction) {
      setEditingTransaction({
        ...editingTransaction,
        [field]: value,
      });
    }
  };

  const handleDeleteTransaction = (id: number) => {
    setTransactions((prev: NewTransaction[]) => {
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

  return (
    <>
      <form action={saveNewTransactions} className="flex flex-col gap-4">
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Transactions ({transactions.length})</CardTitle>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => {
                  const newTransaction = createDefaultTransaction();
                  setTransactions([newTransaction, ...transactions]);
                  setIsEditDialogOpen(true);
                  setEditingTransaction(newTransaction);
                }}
              >
                <Plus className="h-3 w-3" />
                <span className="sr-only">Add Transaction</span>
              </Button>

              {transactions.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => {
                    setTransactions([]);
                    setIsEditDialogOpen(false);
                    setEditingTransaction(null);
                  }}
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Clear</span>
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {transactions?.map((transaction, index) => (
              <div key={transaction.id}>
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 overflow-hidden">
                    <p className="font-medium text-foreground truncate">
                      {transaction.description}
                    </p>
                    <div className="flex items-start gap-2 mt-1 flex-wrap">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span className="truncate">
                          {new Date(transaction.date).toLocaleDateString(
                            'en-ZA',
                            {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            }
                          )}
                        </span>
                      </p>
                      {(transaction.category ?? transaction.subCategory) && (
                        <div className="flex items-center gap-1">
                          {transaction.category && (
                            <Badge variant="secondary" className="text-xs">
                              {transaction.category}
                            </Badge>
                          )}
                          {transaction.subCategory && (
                            <Badge variant="outline" className="text-xs">
                              {transaction.subCategory}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <p className="font-semibold text-foreground">
                      {formatCurrencyAmount(Number(transaction.amount))}
                    </p>
                    <div className="flex space-x-1 items-start">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(transaction.id)}
                        className="h-8 w-8 p-0"
                        type="button"
                      >
                        <Edit3 className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTransaction(transaction.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        type="button"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                {index < transactions.length - 1 && (
                  <Separator className="mt-4" />
                )}
              </div>
            ))}

            {transactions?.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-3">
                  No transactions found
                </p>
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
          <CardFooter>
            {transactions.length > 0 && (
              <FormSubmitButton loadingText="Saving Transactions...">
                Save
              </FormSubmitButton>
            )}
          </CardFooter>
        </Card>
      </form>

      {/* Edit Transaction Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          // remove transaction if it is not valid
          if (
            !open &&
            editingTransaction &&
            !validateTransaction(editingTransaction)
          ) {
            setTransactions((prev) =>
              prev.filter(
                (transaction) => transaction.id !== editingTransaction.id
              )
            );
          }

          setIsEditDialogOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <DialogTitle>
              {editingTransaction?.id ? 'Edit Transaction' : 'Add Transaction'}
            </DialogTitle>

            <DialogDescription className="sr-only">
              {editingTransaction?.id ? 'Edit Transaction' : 'Add Transaction'}
            </DialogDescription>

            {editingTransaction && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    required
                    value={editingTransaction.description}
                    onChange={(e) => {
                      handleUpdateEditingTransaction(
                        'description',
                        e.target.value
                      );
                    }}
                    placeholder="Transaction description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (R)</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      required
                      min={0.01}
                      value={editingTransaction.amount}
                      onChange={(e) =>
                        handleUpdateEditingTransaction('amount', e.target.value)
                      }
                      placeholder="0.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Date</Label>
                    <DatePicker
                      initialDate={new Date(editingTransaction.date)}
                      onDateChangeAction={(date) =>
                        handleUpdateEditingTransaction('date', date)
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={editingTransaction.category ?? ''}
                      onChange={(e) =>
                        handleUpdateEditingTransaction(
                          'category',
                          e.target.value
                        )
                      }
                      placeholder="e.g., Stock"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subCategory">Sub Category</Label>
                    <Input
                      id="subCategory"
                      value={editingTransaction.subCategory ?? ''}
                      onChange={(e) =>
                        handleUpdateEditingTransaction(
                          'subCategory',
                          e.target.value
                        )
                      }
                      placeholder="e.g., Fuel"
                    />
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={handleCancelEdit}
                type="button"
              >
                Cancel
              </Button>
              <Button type="submit">
                <Check className="h-3 w-3 mr-1" />
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default AddTransactionsForm;
