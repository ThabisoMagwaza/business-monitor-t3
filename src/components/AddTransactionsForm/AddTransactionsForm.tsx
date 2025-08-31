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
import {
  Edit3,
  Trash2,
  Check,
  X,
  Plus,
  CalendarIcon,
  ArrowUpFromLine,
} from 'lucide-react';
import { Input } from '~/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '~/components/ui/dialog';
import { Separator } from '~/components/ui/separator';
import { Badge } from '~/components/ui/badge';
import { formatCurrencyAmount, formatDate } from '~/lib/helpers';

import type { NewTransaction } from '~/app/actions';
import type {
  ItemSubCategory,
  TransactionCategory,
} from '~/lib/types/Transaction';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '../ui/select';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  Form,
  FormMessage,
  FormControl,
  FormLabel,
  FormItem,
  FormField,
} from '../ui/form';
import { Popover, PopoverContent } from '../ui/popover';
import { PopoverTrigger } from '../ui/popover';
import { cn } from '~/lib/utils';
import { Calendar } from '../ui/calendar';
import SubmitButton from '../SubmitButton/SubmitButton';

const createTransactionSchema = z.object({
  id: z.string(),
  description: z
    .string({
      error: 'Description is required',
    })
    .min(1, {
      message: 'Description is required',
    }),
  amount: z
    .string({
      error: 'Amount is required',
    })
    .min(1, {
      message: 'Amount is required',
    }),
  date: z.date(),
  category: z
    .string({
      error: 'Category is required',
    })
    .min(1, {
      message: 'Category is required',
    }),
  subCategory: z
    .string({
      error: 'Sub Category is required',
    })
    .min(1, {
      message: 'Sub Category is required',
    }),
});

function AddTransactionsForm({
  type,
  initialTransactions,
  saveTransactions,
  categories,
  subCategories,
}: {
  type: 'expense' | 'income';
  initialTransactions: NewTransaction[];
  categories: TransactionCategory[];
  subCategories: ItemSubCategory[];
  saveTransactions: (
    transactions: NewTransaction[],
    type: 'expense' | 'income'
  ) => void;
}) {
  const [transactions, setTransactions] =
    React.useState<NewTransaction[]>(initialTransactions);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);

  const saveNewTransactions = saveTransactions.bind(null, transactions, type);

  const handleEdit = (id: number) => {
    const transaction = transactions.find((t) => t.id === id);
    if (transaction) {
      form.setValue('description', transaction.description);
      form.setValue('amount', transaction.amount);
      form.setValue('date', new Date(transaction.date));
      form.setValue('category', transaction.category ?? '');
      form.setValue('subCategory', transaction.subCategory ?? '');
      form.setValue('id', transaction.id.toString());

      setIsEditDialogOpen(true);
    }
  };

  // 1. Define your form.
  const form = useForm<z.infer<typeof createTransactionSchema>>({
    resolver: zodResolver(createTransactionSchema),
    defaultValues: {
      id: '',
      description: '',
      amount: '0',
      date: new Date(),
      category: '',
      subCategory: '',
    },
  });

  const handleSaveEdit = (data: z.infer<typeof createTransactionSchema>) => {
    if (!form.getValues('id')) {
      setTransactions((prev: NewTransaction[]) => [
        {
          ...data,
          id: Math.floor(Math.random() * 1000000),
          date: data.date.toISOString(),
        },
        ...prev,
      ]);
    }

    if (form.getValues('id')) {
      setTransactions((prev: NewTransaction[]) =>
        prev.map((transaction) =>
          transaction.id === Number(form.getValues('id'))
            ? {
                ...data,
                id: Number(form.getValues('id')),
                date: data.date.toISOString(),
              }
            : transaction
        )
      );
    }
    form.reset();
    setIsEditDialogOpen(false);
  };

  const handleCancelEdit = () => {
    setIsEditDialogOpen(false);
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
                  setIsEditDialogOpen(true);
                  form.reset();
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
                    form.reset();
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
                        <CalendarIcon className="h-3 w-3" />
                        <span className="truncate">
                          {formatDate(new Date(transaction.date))}
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
                        <span className="sr-only">Edit Transaction</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTransaction(transaction.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        type="button"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span className="sr-only">Delete Transaction</span>
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
              <SubmitButton icon={<ArrowUpFromLine />}>Save</SubmitButton>
            )}
          </CardFooter>
        </Card>
      </form>

      {/* Edit Transaction Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSaveEdit)}
              className="space-y-4"
            >
              <DialogTitle>
                {form.getValues('id') ? 'Edit Transaction' : 'Add Transaction'}
              </DialogTitle>

              <DialogDescription className="sr-only">
                {form.getValues('id') ? 'Edit Transaction' : 'Add Transaction'}
              </DialogDescription>

              <div className="space-y-4">
                <div className="space-y-2">
                  <FormField
                    control={form.control}
                    name="id"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Transaction ID"
                            disabled
                            className="hidden"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Transaction description"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amount (R)</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              placeholder="0.00"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={'outline'}
                                  className={cn(
                                    'pl-3 text-left font-normal',
                                    !field.value && 'text-muted-foreground'
                                  )}
                                >
                                  {field.value ? (
                                    formatDate(field.value)
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={(date: Date | undefined) =>
                                  field.onChange(date)
                                }
                                captionLayout="dropdown"
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="space-y-2 flex-1">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="e.g., Stock" />
                              </SelectTrigger>
                              <SelectContent>
                                {categories?.map((category) => (
                                  <SelectItem
                                    key={category.id}
                                    value={category.name}
                                  >
                                    {category.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-2 flex-1">
                    <FormField
                      control={form.control}
                      name="subCategory"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sub Category</FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="e.g., Fuel" />
                              </SelectTrigger>
                              <SelectContent>
                                {subCategories?.map((subCategory) => (
                                  <SelectItem
                                    key={subCategory.id}
                                    value={subCategory.name}
                                  >
                                    {subCategory.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={handleCancelEdit}
                  type="button"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={!form.formState.isDirty}>
                  <Check className="h-3 w-3 mr-1" />
                  {form.getValues('id') ? 'Update' : 'Add'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default AddTransactionsForm;
