
import React from 'react';
import Layout from '@/components/Layout';

const OrderLoader = () => {
    return (
        <Layout>
            <div className="container mx-auto px-4 py-8 flex justify-center items-center h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        </Layout>
    );
};

export default OrderLoader;
