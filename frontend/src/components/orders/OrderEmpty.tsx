
import React from 'react';
import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';
import { Button } from '@/components/ui/button';

const OrderEmpty = () => {
    return (
        <div className="text-center py-20 bg-muted/30 rounded-lg">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No orders found</h2>
            <p className="text-muted-foreground mb-6">Looks like you haven't placed any orders yet.</p>
            <Link to="/">
                <Button>Start Shopping</Button>
            </Link>
        </div>
    );
};

export default OrderEmpty;
