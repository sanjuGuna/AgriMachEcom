import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import OrderCard from '@/components/orders/OrderCard';
import OrderEmpty from '@/components/orders/OrderEmpty';
import OrderLoader from '@/components/orders/OrderLoader';

const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(price);

const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

const MyOrders = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { isAuthenticated, token } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        const fetchOrders = async () => {
            try {
                const { data } = await axios.get(
                    'http://localhost:5000/api/orders/my',
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setOrders(data);
            } catch (error: any) {
                toast({
                    title: 'Error',
                    description: error.response?.data?.message || 'Failed to fetch orders',
                    variant: 'destructive',
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrders();
    }, [isAuthenticated, token, navigate, toast]);

    if (isLoading) return <OrderLoader />;

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                <h1 className="font-display text-3xl font-bold text-foreground mb-8">
                    My Orders
                </h1>

                {orders.length === 0 ? (
                    <OrderEmpty />
                ) : (
                    <div className="space-y-6">
                        {orders.map(order => (
                            <OrderCard
                                key={order._id}
                                order={order}
                                formatPrice={formatPrice}
                                formatDate={formatDate}
                            />
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default MyOrders;
