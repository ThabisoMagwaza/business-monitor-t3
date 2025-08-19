import * as React from 'react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Edit3, Trash2, Check, X } from 'lucide-react';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '~/components/ui/dialog';
import { Separator } from '~/components/ui/separator';
import DatePicker from '../DatePicker/DatePicker';
import { formatCurrencyAmount, formatDate } from '~/lib/helpers';
import FormSubmitButton from '../FormSubmitButton/FormSubmitButton';
import { addTransactions } from '~/app/actions';

import type { NewTransaction } from '~/app/actions';

function AddTransactionsForm({
  type,
  transactions,
  setTransactions,
}: {
  type: 'expense' | 'income';
  transactions: NewTransaction[];
  setTransactions: (
    transactions:
      | NewTransaction[]
      | ((prev: NewTransaction[]) => NewTransaction[])
  ) => void;
}) {
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [editingTransaction, setEditingTransaction] =
    React.useState<NewTransaction | null>(null);

  const saveNewTransactions = addTransactions.bind(null, transactions, type);

  const handleEdit = (id: number) => {
    const transaction = transactions.find((t) => t.id === id);
    if (transaction) {
      setEditingTransaction(transaction);
      setIsEditDialogOpen(true);
    }
  };

  const handleSaveEdit = () => {
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
          </CardHeader>
          <CardContent className="space-y-4">
            {transactions?.map((transaction, index) => (
              <div key={transaction.id}>
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
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingTransaction?.id ? 'Edit Transaction' : 'Add Transaction'}
            </DialogTitle>
          </DialogHeader>

          {editingTransaction && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={editingTransaction.description}
                  onChange={(e) => {
                    if (!e.target.value) {
                      return;
                    }
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
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={handleCancelEdit} type="button">
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} type="button">
              <Check className="h-3 w-3 mr-1" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default AddTransactionsForm;
