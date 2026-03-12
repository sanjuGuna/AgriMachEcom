import React, { forwardRef } from 'react';

interface OrderItem {
  machine: {
    name: string;
    images?: string[];
  };
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  userId: {
    name: string;
    email: string;
    phone?: string;
  };
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  deliveryAddress: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  createdAt: string;
}

interface OrderInvoiceProps {
  order: Order;
}

export const OrderInvoice = forwardRef<HTMLDivElement, OrderInvoiceProps>(({ order }, ref) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div ref={ref} className="p-8 bg-white text-black min-h-[1056px] w-[816px] mx-auto hidden print:block print:w-full print:min-h-0">
      {/* Header / Company Info */}
      <div className="flex justify-between items-start border-b-2 border-slate-200 pb-6 mb-8">
        <div className="flex items-center gap-4">
          <img src="/logo.png" alt="Company Logo" className="h-16 w-auto object-contain" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">Standard Agro Engineering India</h1>
            <p className="text-slate-500 font-medium">Agricultural Machinery & Equipment</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-4xl font-black text-slate-200 uppercase tracking-wider mb-2">Invoice</h2>
          <p className="font-bold text-slate-800">Order #{order._id.slice(-6).toUpperCase()}</p>
          <p className="text-sm text-slate-500">Date: {formatDate(order.createdAt)}</p>
        </div>
      </div>

      {/* Addresses */}
      <div className="flex justify-between gap-6 mb-8">
        <div className="flex-1">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Billed From</h3>
          <div className="bg-slate-50 p-4 rounded-lg h-[130px]">
            <p className="font-semibold text-slate-800 pb-1">Standard Agro Engineering India</p>
            <p className="text-sm text-slate-600">5/42, Oodaikadu, Sitheri PO</p>
            <p className="text-sm text-slate-600">Thalaivasal TK, Salem - 636101</p>
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Billed To</h3>
          <div className="bg-slate-50 p-4 rounded-lg h-[130px]">
            <p className="font-semibold text-slate-800 pb-1">{order.userId?.name}</p>
            <p className="text-sm text-slate-600">{order.userId?.email}</p>
            {order.userId?.phone && <p className="text-sm text-slate-600">{order.userId.phone}</p>}
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Shipped To</h3>
          <div className="bg-slate-50 p-4 rounded-lg h-[130px]">
            <p className="font-semibold text-slate-800 pb-1">{order.deliveryAddress?.fullName}</p>
            <p className="text-sm text-slate-600 line-clamp-1">{order.deliveryAddress?.address}</p>
            <p className="text-sm text-slate-600">
              {order.deliveryAddress?.city}, {order.deliveryAddress?.state} - {order.deliveryAddress?.pincode}
            </p>
            <p className="text-sm text-slate-600 mt-1 font-medium border-t border-slate-200 pt-1">
              Ph: {order.deliveryAddress?.phone}
            </p>
          </div>
        </div>
      </div>

      {/* Payment Information */}
      <div className="flex gap-4 mb-8">
        <div className="bg-slate-50 border border-slate-100 px-4 py-3 rounded-lg flex-1">
          <p className="text-xs text-slate-500 font-medium mb-1 uppercase">Payment Method</p>
          <p className="font-semibold text-slate-800">{order.paymentMethod || 'N/A'}</p>
        </div>
        <div className="bg-slate-50 border border-slate-100 px-4 py-3 rounded-lg flex-1">
          <p className="text-xs text-slate-500 font-medium mb-1 uppercase">Payment Status</p>
          <p className={`font-semibold ${order.paymentStatus === 'PAID' ? 'text-green-600' : 'text-amber-600'}`}>
            {order.paymentStatus}
          </p>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-8 overflow-hidden rounded-lg border border-slate-200">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100">
              <th className="py-3 px-4 font-semibold text-slate-700 text-sm">Item</th>
              <th className="py-3 px-4 font-semibold text-slate-700 text-sm text-center">Qty</th>
              <th className="py-3 px-4 font-semibold text-slate-700 text-sm text-right">Price</th>
              <th className="py-3 px-4 font-semibold text-slate-700 text-sm text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {order.items.map((item, index) => (
              <tr key={index}>
                <td className="py-4 px-4 text-slate-800 font-medium">{item.machine?.name}</td>
                <td className="py-4 px-4 text-slate-600 text-center">{item.quantity}</td>
                <td className="py-4 px-4 text-slate-600 text-right">{formatPrice(item.price)}</td>
                <td className="py-4 px-4 text-slate-800 font-semibold text-right">
                  {formatPrice(item.price * item.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="flex justify-end mb-12">
        <div className="w-64">
          <div className="flex justify-between py-2 border-b border-slate-200">
            <span className="text-slate-600 font-medium">Subtotal</span>
            <span className="text-slate-800 font-semibold">{formatPrice(order.totalAmount)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-200">
            <span className="text-slate-600 font-medium">Shipping</span>
            <span className="text-slate-800 font-semibold">Free</span>
          </div>
          <div className="flex justify-between py-3">
            <span className="text-lg font-bold text-slate-800">Total</span>
            <span className="text-xl font-bold text-slate-900">{formatPrice(order.totalAmount)}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-8 border-t border-slate-200 text-center">
        <p className="text-slate-500 font-medium mb-1">Thank you for your business!</p>
        <p className="text-sm text-slate-400">If you have any questions about this invoice, please contact support.</p>
      </div>
    </div>
  );
});

OrderInvoice.displayName = 'OrderInvoice';
