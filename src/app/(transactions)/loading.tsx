import Page from '~/components/Page/Page';
import TransactionsSkeleton from '~/components/TransactionsSkeleton/TransactionsSkeleton';

export default function TransactionsLoading() {
  return (
    <Page>
      <TransactionsSkeleton count={10} />
    </Page>
  );
}
