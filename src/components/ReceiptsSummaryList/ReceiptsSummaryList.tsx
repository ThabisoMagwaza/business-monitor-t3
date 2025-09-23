import Link from 'next/link';
import { FileText } from 'lucide-react';
import Image from 'next/image';
import { Calendar } from 'lucide-react';
import { type ReceiptStatus } from '~/lib/types/receipts/queries';
import { getReceiptsList } from '~/server/adapters/receipts/queries';
import { Card, CardContent } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';

async function ReceiptsSummaryList({
  userId,
  businessId,
  status,
}: {
  userId: string;
  businessId: number;
  status: ReceiptStatus;
}) {
  const receipts = await getReceiptsList(userId, businessId, status);

  return (
    <>
      <div className="space-y-3 mt-2">
        {receipts.map((receipt) => {
          const date = new Date(receipt.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          });

          const getStatusBadge = () => {
            switch (receipt.status) {
              case 'processed':
                return (
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    Processed
                  </Badge>
                );
              case 'pending':
                return (
                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                    Pending
                  </Badge>
                );
              default:
                return <Badge>Unknown</Badge>;
            }
          };

          return (
            <Link
              href={`/receipts/${receipt.id}`}
              key={receipt.id}
              className="block hover:cursor-pointer no-underline"
            >
              <Card className="hover:shadow-md transition-shadow p-0">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Receipt Image/Icon - Left Side */}
                    <div className="h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {receipt.url ? (
                        <Image
                          priority
                          src={receipt.url}
                          alt={receipt.name}
                          width={48}
                          height={48}
                          className="min-w-full w-12 h-auto object-cover rounded-lg"
                        />
                      ) : (
                        <FileText className="h-6 text-gray-400" />
                      )}
                    </div>

                    {/* Receipt Details - Middle Section */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate max-w-3/4">
                        {receipt.name}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                        <div className="flex items-center space-x-1 ">
                          <Calendar className="w-3 h-3" />
                          <span className="whitespace-nowrap">{date}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <FileText className="w-3 h-3" />
                          <span className="whitespace-nowrap">
                            {receipt.numItems} items
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status and Amount - Right Side */}
                    <div className="text-right flex-shrink-0">
                      <div className="mb-1">{getStatusBadge()}</div>
                      <div className="text-lg font-semibold text-gray-900">
                        R
                        {receipt.totalAmount
                          ? receipt.totalAmount.toFixed(2)
                          : 0}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {receipts.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {status === 'all' ? 'No receipts yet' : `No ${status} receipts`}
          </h3>
          <p className="text-gray-500">
            {status === 'all'
              ? 'Start by scanning your first receipt'
              : `No receipts with ${status} status found`}
          </p>
        </div>
      )}
    </>
  );
}
export default ReceiptsSummaryList;
