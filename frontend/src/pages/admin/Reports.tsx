import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    BarChart as BarChartIcon,
    Download,
    TrendingUp,
    Package,
    ShoppingCart,
    DollarSign,
    Calendar,
    AlertTriangle,
    Loader2,
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area,
} from 'recharts';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { reportAPI } from '@/lib/api';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const Reports: React.FC = () => {
    const [activeTab, setActiveTab] = useState('sales');

    const { data: salesData, isLoading: salesLoading } = useQuery({
        queryKey: ['report-sales'],
        queryFn: async () => {
            const res = await reportAPI.getSales();
            return res.data;
        },
        enabled: activeTab === 'sales',
    });

    const { data: productData, isLoading: productLoading } = useQuery({
        queryKey: ['report-products'],
        queryFn: async () => {
            const res = await reportAPI.getProducts();
            return res.data;
        },
        enabled: activeTab === 'products',
    });

    const { data: customerData, isLoading: customerLoading } = useQuery({
        queryKey: ['report-customers'],
        queryFn: async () => {
            const res = await reportAPI.getCustomers();
            return res.data;
        },
        enabled: activeTab === 'customers',
    });

    const { data: statusData, isLoading: statusLoading } = useQuery({
        queryKey: ['report-status'],
        queryFn: async () => {
            const res = await reportAPI.getOrderStatus();
            return res.data;
        },
        enabled: activeTab === 'orders',
    });

    const { data: paymentData, isLoading: paymentLoading } = useQuery({
        queryKey: ['report-payments'],
        queryFn: async () => {
            const res = await reportAPI.getPayments();
            return res.data;
        },
        enabled: activeTab === 'payments',
    });

    const { data: inventoryData, isLoading: inventoryLoading } = useQuery({
        queryKey: ['report-inventory'],
        queryFn: async () => {
            const res = await reportAPI.getInventory();
            return res.data;
        },
        enabled: activeTab === 'inventory',
    });

    const { data: seasonalData, isLoading: seasonalLoading } = useQuery({
        queryKey: ['report-seasonal'],
        queryFn: async () => {
            const res = await reportAPI.getSeasonal();
            return res.data;
        },
        enabled: activeTab === 'seasonal',
    });

    const exportToCSV = (data: any[], fileName: string) => {
        if (!data || data.length === 0) return;
        const replacer = (key: string, value: any) => (value === null ? '' : value);
        const header = Object.keys(data[0]);
        const csv = [
            header.join(','),
            ...data.map((row) =>
                header
                    .map((fieldName) => JSON.stringify(row[fieldName], replacer))
                    .join(',')
            ),
        ].join('\r\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `${fileName}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const renderLoading = () => (
        <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground">Generating report data...</p>
        </div>
    );

    return (
        <AdminLayout>
            <div className="p-6 lg:p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="font-display text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
                            <BarChartIcon className="w-8 h-8 text-primary" />
                            Analytics & Reports
                        </h1>
                        <p className="text-muted-foreground">
                            Detailed summaries and performance insights for your agriculture store.
                        </p>
                    </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="bg-muted/50 p-1 flex flex-wrap h-auto">
                        <TabsTrigger value="sales" className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4" /> Sales
                        </TabsTrigger>
                        <TabsTrigger value="products" className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" /> Products
                        </TabsTrigger>
                        <TabsTrigger value="customers" className="flex items-center gap-2">
                            <ShoppingCart className="w-4 h-4" /> Customers
                        </TabsTrigger>
                        <TabsTrigger value="orders" className="flex items-center gap-2">
                            <Package className="w-4 h-4" /> Order Status
                        </TabsTrigger>
                        <TabsTrigger value="payments" className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" /> Payments
                        </TabsTrigger>
                        <TabsTrigger value="inventory" className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" /> Inventory
                        </TabsTrigger>
                        <TabsTrigger value="seasonal" className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" /> Seasonal
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="sales">
                        {salesLoading ? renderLoading() : !salesData || salesData.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                                <DollarSign className="w-12 h-12 mb-4 opacity-20" />
                                <p>No sales data available yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="flex justify-end">
                                    <Button onClick={() => exportToCSV(salesData, 'sales_report')} variant="outline" className="gap-2">
                                        <Download className="w-4 h-4" /> Export CSV
                                    </Button>
                                </div>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Daily Revenue</CardTitle>
                                        <CardDescription>Visualizing revenue trends over time.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="h-[400px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={salesData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="_id" />
                                                <YAxis />
                                                <Tooltip />
                                                <Legend />
                                                <Line type="monotone" dataKey="totalRevenue" stroke="#10b981" activeDot={{ r: 8 }} name="Revenue (₹)" />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="products">
                        {productLoading ? renderLoading() : !productData || productData.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                                <Package className="w-12 h-12 mb-4 opacity-20" />
                                <p>No product performance data available.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="flex justify-end">
                                    <Button onClick={() => exportToCSV(productData, 'product_performance')} variant="outline" className="gap-2">
                                        <Download className="w-4 h-4" /> Export CSV
                                    </Button>
                                </div>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Top Selling Products</CardTitle>
                                        <CardDescription>Revenue by machine.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="h-[400px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={productData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="name" />
                                                <YAxis />
                                                <Tooltip />
                                                <Legend />
                                                <Bar dataKey="totalRevenue" fill="#3b82f6" name="Total Revenue (₹)" />
                                                <Bar dataKey="totalSold" fill="#10b981" name="Units Sold" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="customers">
                        {customerLoading ? renderLoading() : !customerData || customerData.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                                <ShoppingCart className="w-12 h-12 mb-4 opacity-20" />
                                <p>No customer data available yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="flex justify-end">
                                    <Button onClick={() => exportToCSV(customerData, 'customer_report')} variant="outline" className="gap-2">
                                        <Download className="w-4 h-4" /> Export CSV
                                    </Button>
                                </div>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Top Customers</CardTitle>
                                        <CardDescription>Ranking customers by total spend.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-muted text-muted-foreground font-medium">
                                                <tr>
                                                    <th className="p-3">Customer Name</th>
                                                    <th className="p-3">Email</th>
                                                    <th className="p-3 text-right">Orders</th>
                                                    <th className="p-3 text-right">Total Spent</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border">
                                                {customerData?.map((customer: any) => (
                                                    <tr key={customer.email}>
                                                        <td className="p-3 font-medium">{customer.name}</td>
                                                        <td className="p-3 text-muted-foreground">{customer.email}</td>
                                                        <td className="p-3 text-right">{customer.orderCount}</td>
                                                        <td className="p-3 text-right font-bold text-primary">₹{customer.totalSpent.toLocaleString()}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="orders">
                        {statusLoading ? renderLoading() : !statusData || statusData.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                                <Package className="w-12 h-12 mb-4 opacity-20" />
                                <p>No order status data available.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="flex justify-end">
                                    <Button onClick={() => exportToCSV(statusData, 'order_status_report')} variant="outline" className="gap-2">
                                        <Download className="w-4 h-4" /> Export CSV
                                    </Button>
                                </div>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Order Status Distribution</CardTitle>
                                        <CardDescription>Current state of all orders.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="h-[400px] flex justify-center">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={statusData}
                                                    dataKey="count"
                                                    nameKey="_id"
                                                    cx="50%"
                                                    cy="50%"
                                                    outerRadius={150}
                                                    label
                                                >
                                                    {statusData?.map((entry: any, index: number) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="payments">
                        {paymentLoading ? renderLoading() : !paymentData || (paymentData.gatewayStats?.length === 0 && paymentData.statusStats?.length === 0) ? (
                            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                                <DollarSign className="w-12 h-12 mb-4 opacity-20" />
                                <p>No payment data available yet.</p>
                                <p className="text-sm">Payment integration may be pending.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Payment Gateway Usage</CardTitle>
                                        </CardHeader>
                                        <CardContent className="h-[300px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={paymentData?.gatewayStats || []}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="_id" />
                                                    <YAxis />
                                                    <Tooltip />
                                                    <Bar dataKey="totalAmount" fill="#8b5cf6" name="Total Revenue (₹)" />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Payment Status</CardTitle>
                                        </CardHeader>
                                        <CardContent className="h-[300px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={paymentData?.statusStats || []}
                                                        dataKey="count"
                                                        nameKey="_id"
                                                        cx="50%"
                                                        cy="50%"
                                                        outerRadius={80}
                                                        label
                                                    >
                                                        {paymentData?.statusStats?.map((entry: any, index: number) => (
                                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip />
                                                    <Legend />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="inventory">
                        {inventoryLoading ? renderLoading() : !inventoryData || inventoryData.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                                <AlertTriangle className="w-12 h-12 mb-4 opacity-20" />
                                <p>No inventory data available.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="flex justify-end">
                                    <Button onClick={() => exportToCSV(inventoryData, 'inventory_report')} variant="outline" className="gap-2">
                                        <Download className="w-4 h-4" /> Export CSV
                                    </Button>
                                </div>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Stock Levels</CardTitle>
                                        <CardDescription>Monitoring inventory to avoid stockouts.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-muted text-muted-foreground font-medium">
                                                <tr>
                                                    <th className="p-3">Machine Name</th>
                                                    <th className="p-3">Category</th>
                                                    <th className="p-3 text-right">Stock</th>
                                                    <th className="p-3">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border">
                                                {inventoryData?.map((item: any) => (
                                                    <tr key={item._id}>
                                                        <td className="p-3 font-medium">{item.name}</td>
                                                        <td className="p-3 text-muted-foreground">{item.category}</td>
                                                        <td className="p-3 text-right">{item.stock}</td>
                                                        <td className="p-3">
                                                            <span className={`px-2 py-1 rounded-full text-xs ${item.stock < 5 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                                                                }`}>
                                                                {item.stock < 5 ? 'Low Stock' : 'In Stock'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="seasonal">
                        {seasonalLoading ? renderLoading() : !seasonalData || seasonalData.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                                <Calendar className="w-12 h-12 mb-4 opacity-20" />
                                <p>No seasonal demand data available yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="flex justify-end">
                                    <Button onClick={() => exportToCSV(seasonalData, 'seasonal_demand')} variant="outline" className="gap-2">
                                        <Download className="w-4 h-4" /> Export CSV
                                    </Button>
                                </div>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Seasonal Demand Trends</CardTitle>
                                        <CardDescription>Monthly revenue trends to identify peak demand seasons.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="h-[400px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChartErrorBoundary data={seasonalData} />
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </AdminLayout>
    );
};

// Simple helper component to render AreaChart without crashing if data is weird
const AreaChartErrorBoundary = ({ data }: { data: any[] }) => {
    return (
        <AreaChart data={data}>
            <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="totalRevenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRevenue)" name="Revenue (₹)" />
        </AreaChart>
    );
};

export default Reports;
