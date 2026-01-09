export type Money = {
  amount: number;
  currency: string;
};

export type OrderAmounts = {
  gross_amount: Money;
  discount_amount: Money;
  tip_amount: Money;
  net_amount: Money;
  tax_amount: Money;
};

export type LineItem = {
  id: string;
  variant_id: string;
  name: string;
  quantity: string;
  quantity_unit: string | null;
  item_type: string;
  note: string | null;
  unit_price: Money;
  total_price: Money;
  discount_amount: Money;
  net_amount: Money;
  applied_taxes: unknown[];
  applied_discounts: unknown[];
};

export type Payment = {
  id: string;
  display_name: string;
  receipt_number: string;
  order_id: string;
  created_at: string;
  updated_at: string;
  currency: string;
  note: string | null;
  amount_excl_tip: Money;
  tip_amount: Money;
  total_amount: Money;
  refunded_amount: Money;
  status: 'approved' | 'cancelled' | 'pending';
  payment_method: 'cash' | 'card' | 'mobile_money' | 'bank_transfer' | 'other';
  payment_source: string;
  refunds: Refund[];
  processing_fees: ProcessingFee[];
};

export type Order = {
  id: string;
  display_name: string;
  order_number: string;
  name: string | null;
  currency: string;
  note: string | null;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  status: 'completed' | 'pending' | 'cancelled';
  amounts: OrderAmounts;
  line_items: LineItem[];
  total_taxes: unknown[];
  applied_discounts: unknown[];
  payments: Payment[];
  refunds: unknown[];
  returns: unknown[];
};

export type Refund = {
  id: string;
  amount: Money;
  status: 'approved' | 'cancelled' | 'pending';
};

export type ProcessingFee = {
  id: string;
  amount: Money;
  name: string;
};

export type OrdersResponse = {
  data: Order[];
  next_cursor: string | null;
};
