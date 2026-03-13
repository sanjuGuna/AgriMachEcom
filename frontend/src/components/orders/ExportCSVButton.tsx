import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { Order } from '@/pages/admin/Orders';

interface ExportCSVButtonProps {
  orders: Order[];
}

export const ExportCSVButton: React.FC<ExportCSVButtonProps> = ({ orders }) => {
  const handleExport = () => {
    if (!orders || orders.length === 0) return;

    const headers = [
      'Order ID',
      'Customer Name',
      'Customer Email',
      'Phone',
      'Total Amount',
      'Payment Status',
      'Order Status',
      'Date',
    ];

    const csvRows = [];
    csvRows.push(headers.join(','));

    for (const order of orders) {
      const row = [
        order._id,
        `"${order.userId?.name || 'N/A'}"`,
        `"${order.userId?.email || 'N/A'}"`,
        `"${order.deliveryAddress?.phone || 'N/A'}"`,
        order.totalAmount,
        order.paymentStatus,
        order.orderStatus,
        new Date(order.createdAt).toLocaleDateString('en-IN'),
      ];
      csvRows.push(row.join(','));
    }

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `orders_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button onClick={handleExport} variant="outline" className="gap-2">
      <Download className="w-4 h-4" />
      Export to CSV
    </Button>
  );
};
