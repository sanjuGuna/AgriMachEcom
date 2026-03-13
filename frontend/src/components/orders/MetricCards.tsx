import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, IndianRupee, Wallet } from 'lucide-react';
import { Order } from '@/pages/admin/Orders';

interface MetricCardsProps {
  orders: Order[];
}

export const MetricCards: React.FC<MetricCardsProps> = ({ orders }) => {
  if (!orders) return null;

  const pendingShipments = orders.filter(o => o.orderStatus === 'PLACED').length;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todaysRevenue = orders
    .filter(o => new Date(o.createdAt) >= today)
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const pendingCOD = orders
    .filter(o => o.paymentStatus === 'PENDING' && o.orderStatus !== 'DELIVERED')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="grid gap-4 md:grid-cols-3 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Shipments</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{pendingShipments}</div>
          <p className="text-xs text-muted-foreground">Orders placed but not shipped</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
          <IndianRupee className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatPrice(todaysRevenue)}</div>
          <p className="text-xs text-muted-foreground">Revenue from orders today</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending COD</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatPrice(pendingCOD)}</div>
          <p className="text-xs text-muted-foreground">Uncollected payments</p>
        </CardContent>
      </Card>
    </div>
  );
};
