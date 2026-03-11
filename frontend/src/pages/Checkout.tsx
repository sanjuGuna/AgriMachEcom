import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, CheckCircle, MapPin, CreditCard, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Layout from '@/components/Layout';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

import { userAPI, orderAPI } from '@/lib/api';

interface Address {
  _id: string;
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

type PaymentMethod = 'COD' | 'ONLINE';

// ─── Razorpay script loader ───────────────────────────────────────────────────
function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (document.getElementById('razorpay-sdk')) return resolve(true);
    const script = document.createElement('script');
    script.id = 'razorpay-sdk';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// ─── Component ────────────────────────────────────────────────────────────────
const Checkout: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [saveNewAddress, setSaveNewAddress] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');

  const [isLoading, setIsLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const { cartItems, getTotalPrice, clearCart } = useCart();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await userAPI.getProfile();
        if (data.addresses && data.addresses.length > 0) {
          setSavedAddresses(data.addresses);
          const defaultAddr = data.addresses.find((a: Address) => a.isDefault);
          setSelectedAddressId(
            defaultAddr ? defaultAddr._id : data.addresses[0]._id
          );
        } else {
          setShowNewAddressForm(true);
        }
      } catch {
        setShowNewAddressForm(true);
      }
    };
    if (isAuthenticated) fetchProfile();
  }, [isAuthenticated]);

  // Redirect guards
  React.useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) navigate('/login', { state: { from: '/checkout' } });
      else if (cartItems.length === 0 && !orderPlaced) navigate('/cart');
    }
  }, [authLoading, isAuthenticated, cartItems, orderPlaced, navigate]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleAddressSelect = (id: string) => {
    setSelectedAddressId(id);
    setShowNewAddressForm(false);
  };

  const handleAddNewAddress = () => {
    setSelectedAddressId(null);
    setShowNewAddressForm(true);
    setFormData({ fullName: '', phone: '', address: '', city: '', state: '', pincode: '' });
  };

  // ─── Build delivery address object ─────────────────────────────────────────
  const getDeliveryAddress = (): Record<string, string> | null => {
    if (showNewAddressForm) {
      const { fullName, phone, address, city, state, pincode } = formData;
      if (!fullName || !phone || !address || !city || !state || !pincode) return null;
      return { fullName, phone, addressLine: address, city, state, pincode };
    }
    const selected = savedAddresses.find((a) => a._id === selectedAddressId);
    if (!selected) return null;
    return {
      fullName: selected.fullName,
      phone: selected.phone,
      addressLine: selected.addressLine,
      city: selected.city,
      state: selected.state,
      pincode: selected.pincode,
    };
  };

  // ─── Handle order placement ─────────────────────────────────────────────────
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    const deliveryAddress = getDeliveryAddress();
    if (!deliveryAddress) {
      toast({
        title: 'Validation Error',
        description: showNewAddressForm
          ? 'Please fill in all delivery details'
          : 'Please select an address',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Save new address if requested
      if (showNewAddressForm && saveNewAddress) {
        await userAPI.addAddress({
          ...deliveryAddress,
          isDefault: savedAddresses.length === 0,
        });
      }

      const orderPayload = {
        items: cartItems.map((item) => ({ machineId: item.machineId, quantity: item.quantity })),
        deliveryAddress,
        paymentMethod,
      };

      const { data } = await orderAPI.create(orderPayload);

      if (paymentMethod === 'ONLINE') {
        await handleRazorpayPayment(data);
      } else {
        // COD – order is already confirmed
        setOrderPlaced(true);
        clearCart();
        toast({ title: 'Order Placed!', description: 'Your order will be delivered on delivery.' });
      }
    } catch (error: any) {
      toast({
        title: 'Order Failed',
        description: error.response?.data?.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Razorpay checkout flow ─────────────────────────────────────────────────
  const handleRazorpayPayment = async (orderData: any) => {
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      toast({ title: 'Error', description: 'Failed to load Razorpay SDK. Check your network.', variant: 'destructive' });
      return;
    }

    const options: RazorpayOptions = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID as string,
      amount: orderData.amount,
      currency: orderData.currency,
      name: 'AgriMach',
      description: 'Agricultural Machinery Purchase',
      order_id: orderData.razorpayOrderId,
      prefill: {
        name: user?.name ?? '',
        email: user?.email ?? '',
      },
      theme: { color: '#16a34a' },
      handler: async (response: RazorpayResponse) => {
        try {
          await orderAPI.verifyPayment({
            orderId: orderData.orderId,
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });
          setOrderPlaced(true);
          clearCart();
          toast({ title: 'Payment Successful!', description: 'Your order has been placed.' });
        } catch {
          toast({ title: 'Payment Verification Failed', description: 'Please contact support.', variant: 'destructive' });
        }
      },
      modal: {
        ondismiss: () => {
          toast({ title: 'Payment Cancelled', description: 'You cancelled the payment.', variant: 'destructive' });
          setIsLoading(false);
        },
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  // ─── Loading / guard states ─────────────────────────────────────────────────
  if (authLoading) {
    return (
      <Layout>
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated || (cartItems.length === 0 && !orderPlaced)) return null;

  // ─── Order success screen ───────────────────────────────────────────────────
  if (orderPlaced) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-scale-in">
            <CheckCircle className="w-12 h-12 text-primary" />
          </div>
          <h2 className="font-display text-3xl font-bold text-foreground mb-4 animate-fade-in">
            Order Placed Successfully!
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto animate-fade-in">
            Thank you for your order. You can view your order details in the My Orders section.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/my-orders">
              <Button variant="outline" size="lg" className="animate-slide-up">
                View My Orders
              </Button>
            </Link>
            <Link to="/">
              <Button size="lg" className="gap-2 animate-slide-up">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  // ─── Main checkout form ─────────────────────────────────────────────────────
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <Link
            to="/cart"
            className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Cart
          </Link>
        </nav>

        <h1 className="font-display text-3xl font-bold text-foreground mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* ── Left column ── */}
          <div className="space-y-6">
            {/* Delivery Address Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePlaceOrder} className="space-y-6" id="checkout-form">
                  {/* Saved Addresses */}
                  {!showNewAddressForm && savedAddresses.length > 0 && (
                    <div className="space-y-4 mb-2">
                      {savedAddresses.map((addr) => (
                        <div
                          key={addr._id}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedAddressId === addr._id
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                            }`}
                          onClick={() => handleAddressSelect(addr._id)}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-4 h-4 rounded-full border mt-1 flex items-center justify-center ${selectedAddressId === addr._id
                                  ? 'border-primary'
                                  : 'border-muted-foreground'
                                }`}
                            >
                              {selectedAddressId === addr._id && (
                                <div className="w-2 h-2 rounded-full bg-primary" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">
                                {addr.fullName}{' '}
                                <span className="text-muted-foreground font-normal">
                                  ({addr.phone})
                                </span>
                              </p>
                              <p className="text-sm text-muted-foreground mt-1">
                                {addr.addressLine}, {addr.city}, {addr.state} -{' '}
                                {addr.pincode}
                              </p>
                              {addr.isDefault && (
                                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded mt-2 inline-block">
                                  Default
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={handleAddNewAddress}
                      >
                        + Add Another Address
                      </Button>
                    </div>
                  )}

                  {/* New Address Form */}
                  {showNewAddressForm && (
                    <div className="space-y-4 animate-fade-in">
                      {savedAddresses.length > 0 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="mb-2 p-0 h-auto hover:bg-transparent text-muted-foreground hover:text-primary"
                          onClick={() => {
                            setShowNewAddressForm(false);
                            if (!selectedAddressId && savedAddresses.length > 0)
                              setSelectedAddressId(savedAddresses[0]._id);
                          }}
                        >
                          <ArrowLeft className="w-3 h-3 mr-1" /> Back to saved addresses
                        </Button>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Enter your full name" disabled={isLoading} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="+91 98765 43210" disabled={isLoading} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Input id="address" name="address" value={formData.address} onChange={handleChange} placeholder="Street address, building, floor" disabled={isLoading} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="city">City</Label>
                          <Input id="city" name="city" value={formData.city} onChange={handleChange} placeholder="City" disabled={isLoading} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="state">State</Label>
                          <Input id="state" name="state" value={formData.state} onChange={handleChange} placeholder="State" disabled={isLoading} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pincode">Pincode</Label>
                        <Input id="pincode" name="pincode" value={formData.pincode} onChange={handleChange} placeholder="6-digit pincode" maxLength={6} disabled={isLoading} />
                      </div>
                      <div className="flex items-center gap-2 pt-2">
                        <input
                          type="checkbox"
                          id="saveAddress"
                          className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                          checked={saveNewAddress}
                          onChange={(e) => setSaveNewAddress(e.target.checked)}
                        />
                        <Label htmlFor="saveAddress" className="cursor-pointer font-normal">
                          Save this address for future orders
                        </Label>
                      </div>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>

            {/* Payment Method Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* COD Option */}
                <div
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'COD'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                    }`}
                  onClick={() => setPaymentMethod('COD')}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === 'COD' ? 'border-primary' : 'border-muted-foreground'
                        }`}
                    >
                      {paymentMethod === 'COD' && (
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      )}
                    </div>
                    <Truck className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Cash on Delivery</p>
                      <p className="text-sm text-muted-foreground">Pay when your order arrives</p>
                    </div>
                  </div>
                </div>

                {/* Online Payment Option */}
                <div
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'ONLINE'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                    }`}
                  onClick={() => setPaymentMethod('ONLINE')}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === 'ONLINE' ? 'border-primary' : 'border-muted-foreground'
                        }`}
                    >
                      {paymentMethod === 'ONLINE' && (
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      )}
                    </div>
                    <CreditCard className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Pay Online</p>
                      <p className="text-sm text-muted-foreground">
                        UPI, Cards, Net Banking via Razorpay
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Place Order Button */}
            <Button
              type="submit"
              form="checkout-form"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {paymentMethod === 'ONLINE' ? 'Processing...' : 'Placing Order...'}
                </>
              ) : paymentMethod === 'ONLINE' ? (
                'Proceed to Pay'
              ) : (
                'Place Order (COD)'
              )}
            </Button>
          </div>

          {/* ── Right column: Order Summary ── */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mb-6">
                  {cartItems.map((item) => (
                    <div key={item.machineId} className="flex gap-4">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder.svg';
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground line-clamp-1">{item.name}</p>
                        <p className="text-muted-foreground text-sm">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                <div className="space-y-3">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{formatPrice(getTotalPrice())}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span className="text-primary font-medium">Free</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Payment</span>
                    <span className="font-medium">
                      {paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online (Razorpay)'}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(getTotalPrice())}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;
