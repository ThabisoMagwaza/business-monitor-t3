import { NextResponse } from 'next/server';
import { getTransactions } from '~/server/adapters/transactions/queries';
import { getUserAction } from '~/app/actions/users';

export async function GET(request: Request) {
  const user = await getUserAction();
  const { searchParams } = new URL(request.url);
  const type = (searchParams.get('type') as 'income' | 'expense') ?? 'expense';
  const limit = Number(searchParams.get('limit') ?? '10');
  const page = Number(searchParams.get('page') ?? '1');

  const transactions = await getTransactions(
    user.id,
    user.businessId,
    type,
    page
  );
  return NextResponse.json({ transactions }, { status: 200 });
}
