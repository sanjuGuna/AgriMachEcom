import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Tractor,
  Package,
  TruckIcon,
  Clock,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { machineAPI, orderAPI } from '@/lib/api';

interface Order {
  _id: string;
  status: string;
  paymentStatus: string;
}

const Dashboard: React.FC = () => {
  const { data: machinesData, isLoading: machinesLoading } = useQuery({
    queryKey: ['admin-machines'],
    queryFn: async () => {
      const response = await machineAPI.getAll();
      return response.data.machines || response.data;
    },
  });

  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const response = await orderAPI.getAll();
      return response.data.orders || response.data;
    },
  });

  const totalMachines = machinesData?.length || 0;
  const totalOrders = ordersData?.length || 0;
  const deliveredOrders = ordersData?.filter((o: Order) => o.status === 'DELIVERED').length || 0;
  const pendingOrders = ordersData?.filter((o: Order) => o.status !== 'DELIVERED').length || 0;

  const isLoading = machinesLoading || ordersLoading;

  const stats = [
    {
      title: 'Total Machines',
      value: totalMachines,
      icon: Tractor,
      color: 'bg-primary/10 text-primary',
      link: '/admin/machines',
    },
    {
      title: 'Total Orders',
      value: totalOrders,
      icon: Package,
      color: 'bg-secondary/20 text-secondary',
      link: '/admin/orders',
    },
    {
      title: 'Delivered',
      value: deliveredOrders,
      icon: TruckIcon,
      color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
      link: '/admin/orders',
    },
    {
      title: 'Pending',
      value: pendingOrders,
      icon: Clock,
      color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
      link: '/admin/orders',
    },
  ];

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome to the admin dashboard. Here's an overview of your store.
          </p>
        </div>

        {/* Stats Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat) => (
              <Card key={stat.title} className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.color}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground mb-2">
                    {stat.value}
                  </div>
                  <Link
                    to={stat.link}
                    className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                  >
                    View details
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link
                to="/admin/machines/new"
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
              >
                <span className="font-medium">Add New Machine</span>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </Link>
              <Link
                to="/admin/orders"
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
              >
                <span className="font-medium">View All Orders</span>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </Link>
              <Link
                to="/admin/machines"
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
              >
                <span className="font-medium">Manage Inventory</span>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {ordersData && ordersData.length > 0 ? (
                <div className="space-y-3">
                  {ordersData.slice(0, 5).map((order: any) => (
                    <div
                      key={order._id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-sm">
                          Order #{order._id.slice(-6).toUpperCase()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {order.status}
                        </p>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          order.status === 'DELIVERED'
                            ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                            : order.status === 'SHIPPED'
                            ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                            : 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm text-center py-8">
                  No recent orders
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
