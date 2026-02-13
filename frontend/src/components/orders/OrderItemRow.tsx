
import React from 'react';
import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';

interface Props {
    item: any;
    formatPrice: (price: number) => string;
}

const OrderItemRow = ({ item, formatPrice }: Props) => (
    <div className="p-4 flex gap-4 hover:bg-muted/10 transition-colors">
        <div className="w-20 h-20 rounded-md overflow-hidden bg-muted flex-shrink-0">
            {item.machineId?.images?.[0] ? (
                <img
                    src={item.machineId.images[0]}
                    alt={item.machineId.name}
                    className="w-full h-full object-cover"
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <Package className="w-8 h-8" />
                </div>
            )}
        </div>

        <div className="flex-1 min-w-0">
            <Link
                to={`/machines/${item.machineId?._id}`}
                className="font-medium hover:text-primary transition-colors line-clamp-1"
            >
                {item.machineId?.name || 'Unknown Item'}
            </Link>
            <p className="text-sm text-muted-foreground mt-1">
                Qty: {item.quantity}
            </p>
            <p className="font-medium mt-1">
                {formatPrice(item.price)}
            </p>
        </div>
    </div>
);

export default OrderItemRow;
