
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import OrderItemRow from './OrderItemRow';
import { Clock, Truck, CheckCircle, AlertCircle } from 'lucide-react';

const STATUS_CONFIG: Record<string, { color: string; icon: React.ReactNode }> = {
    PLACED: {
        color: 'bg-blue-100 text-blue-800',
        icon: <Clock className="w-4 h-4" />
    },
    SHIPPED: {
        color: 'bg-yellow-100 text-yellow-800',
        icon: <Truck className="w-4 h-4" />
    },
    DELIVERED: {
        color: 'bg-green-100 text-green-800',
        icon: <CheckCircle className="w-4 h-4" />
    },
    CANCELLED: {
        color: 'bg-red-100 text-red-800',
        icon: <AlertCircle className="w-4 h-4" />
    }
};

interface Props {
    order: any; // Ideally replace with strict Order type
    formatPrice: (price: number) => string;
    formatDate: (date: string) => string;
}

const OrderCard = ({ order, formatPrice, formatDate }: Props) => {
    const status = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.PLACED; // Fallback or strict mapping

    return (
        <Card className="overflow-hidden">
            <CardHeader className="bg-muted/30 pb-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <CardTitle className="text-lg">
                                Order #{order._id.slice(-6).toUpperCase()}
                            </CardTitle>
                            <Badge
                                variant="secondary"
                                className={`${status?.color} gap-1`}
                            >
                                {status?.icon}
                                {order.orderStatus}
                            </Badge>
                        </div>
                        <CardDescription>
                            Placed on {formatDate(order.createdAt)}
                        </CardDescription>
                    </div>

                    <div className="text-right">
                        <p className="text-sm text-muted-foreground">Total Amount</p>
                        <p className="font-bold text-lg text-primary">
                            {formatPrice(order.totalAmount)}
                        </p>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-0">
                <div className="divide-y divide-border">
                    {order.items.map((item: any) => (
                        <OrderItemRow
                            key={item._id}
                            item={item}
                            formatPrice={formatPrice}
                        />
                    ))}
                </div>

                <div className="p-4 bg-muted/10 border-t border-border mt-2">
                    <div className="flex flex-col sm:flex-row justify-between text-sm text-muted-foreground gap-4">
                        <div>
                            <span className="font-medium text-foreground block mb-1">
                                Delivery Address:
                            </span>
                            {order.deliveryAddress.fullName}, <br />
                            {order.deliveryAddress.addressLine}, {order.deliveryAddress.city}, <br />
                            {order.deliveryAddress.state} - {order.deliveryAddress.pincode} <br />
                            Phone: {order.deliveryAddress.phone}
                        </div>

                        <div className="flex flex-col justify-end">
                            <span className="font-medium text-foreground block mb-1">
                                Payment Status:
                            </span>
                            <Badge
                                variant="outline"
                                className={
                                    order.paymentStatus === 'PAID'
                                        ? 'text-green-600 border-green-200 bg-green-50'
                                        : 'text-yellow-600 border-yellow-200 bg-yellow-50'
                                }
                            >
                                {order.paymentStatus}
                            </Badge>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default OrderCard;
