'use client';
import * as React from 'react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { formatCurrencyAmount } from '~/lib/helpers';
import Link from 'next/link';
import { Calendar } from '../ui/calendar';
import { FileText, CalendarIcon, CheckIcon, Loader } from 'lucide-react';
import { type Transaction } from '~/lib/types/transactions/queries';
import { type TransactionCategory } from '~/lib/types/transactionCategories/queries';
import { type TransactionSubCategory } from '~/lib/types/transactionSubCategories/queries';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '../ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { formatDate } from 'date-fns';
import { cn } from '~/lib/utils';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { updateTransactionAction } from '~/app/actions/transactions';
import { useRouter } from 'next/navigation';

const editTransactionSchema = z.object({
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
  categoryId: z.number(),
  subCategoryId: z.number(),
});

function TransactionCard({
  transaction,
  categories,
  subCategories,
}: {
  transaction: Transaction;
  categories: TransactionCategory[];
  subCategories: TransactionSubCategory[];
}) {
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof editTransactionSchema>>({
    resolver: zodResolver(editTransactionSchema),
    defaultValues: {
      id: transaction.id.toString(),
      description: transaction.description,
      amount: transaction.amount.toString(),
      date: transaction.date,
      category: transaction.category,
      subCategory: transaction.subCategory,
      categoryId: transaction.categoryId,
      subCategoryId: transaction.subCategoryId,
    },
  });

  const handleSaveEdit = async (
    data: z.infer<typeof editTransactionSchema>
  ) => {
    await updateTransactionAction({
      id: data.id,
      description: data.description,
      amount: Number(data.amount),
      date: data.date,
      category: data.category,
      subCategory: data.subCategory,
      categoryId: data.categoryId,
      subCategoryId: data.subCategoryId,
      type: transaction.type,
    });
    setIsEditDialogOpen(false);
    form.reset();
    router.refresh();
  };

  const handleCancelEdit = () => {
    setIsEditDialogOpen(false);
    form.reset();
  };

  return (
    <>
      <button onClick={() => setIsEditDialogOpen(true)}>
        <Card className="hover:shadow-md transition-shadow p-0">
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="flex-1 min-w-0 flex flex-col gap-1">
                <h3 className="text-start font-medium text-gray-900 truncate max-w-3/4">
                  {transaction.description}
                </h3>
                <div className="flex items-start gap-2 mt-1 flex-wrap">
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
                <div className="flex items-center space-x-1 ">
                  <CalendarIcon className="w-3 h-3" />
                  <span className="whitespace-nowrap text-sm text-muted-foreground">
                    {new Date(transaction.date).toLocaleDateString('en-ZA', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              {/* Status and Amount - Right Side */}
              <div className="text-right flex-shrink-0 flex flex-col justify-between items-end">
                <div className="text-lg font-semibold text-gray-900">
                  {formatCurrencyAmount(transaction.amount)}
                </div>

                {transaction.receiptId && (
                  <Link
                    href={`/receipts/${transaction.receiptId}`}
                    className="text-sm text-muted-foreground flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </button>

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
                                    formatDate(field.value, 'dd/MM/yyyy')
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
                              {...field}
                              onValueChange={(value) => {
                                const category = categories.find(
                                  (category) => category.name === value
                                );
                                if (!category) return;
                                form.setValue('categoryId', category.id);
                                field.onChange(value);
                              }}
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
                              {...field}
                              onValueChange={(value) => {
                                const subCategory = subCategories.find(
                                  (subCategory) => subCategory.name === value
                                );
                                if (!subCategory) return;
                                form.setValue('subCategoryId', subCategory.id);
                                field.onChange(value);
                              }}
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
                <Button
                  type="submit"
                  disabled={
                    !form.formState.isDirty || form.formState.isSubmitting
                  }
                >
                  {form.formState.isSubmitting ? (
                    <Loader className="h-3 w-3 mr-1 animate-spin" />
                  ) : (
                    <CheckIcon className="h-3 w-3 mr-1" />
                  )}
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

function TransactionsCardList({
  transactions,
  categories,
  subCategories,
}: {
  transactions: Transaction[];
  categories: TransactionCategory[];
  subCategories: TransactionSubCategory[];
}) {
  return (
    <>
      <div className="flex flex-col gap-4 mt-2">
        {transactions.map((item, index) => (
          <TransactionCard
            key={index}
            transaction={item}
            categories={categories}
            subCategories={subCategories}
          />
        ))}
      </div>
    </>
  );
}

export default TransactionsCardList;
