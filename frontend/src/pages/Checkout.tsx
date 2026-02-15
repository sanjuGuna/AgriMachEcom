import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, CheckCircle, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Layout from '@/components/Layout';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

import { userAPI } from '@/lib/api';

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

  const [isLoading, setIsLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const { cartItems, getTotalPrice, clearCart } = useCart();
  const { user, isAuthenticated, token, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await userAPI.getProfile();
        if (data.addresses && data.addresses.length > 0) {
          setSavedAddresses(data.addresses);
          const defaultAddr = data.addresses.find((a: Address) => a.isDefault);
          if (defaultAddr) {
            setSelectedAddressId(defaultAddr._id);
          } else {
            setSelectedAddressId(data.addresses[0]._id);
          }
        } else {
          setShowNewAddressForm(true);
        }
      } catch (error) {
        console.error("Failed to fetch profile", error);
        setShowNewAddressForm(true);
      }
    };

    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleAddressSelect = (id: string) => {
    setSelectedAddressId(id);
    setShowNewAddressForm(false);
  };

  const handleAddNewAddress = () => {
    setSelectedAddressId(null);
    setShowNewAddressForm(true);
    setFormData({
      fullName: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
    });
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    let deliveryAddress;

    if (showNewAddressForm) {
      const { fullName, phone, address, city, state, pincode } = formData;
      if (!fullName || !phone || !address || !city || !state || !pincode) {
        toast({
          title: 'Validation Error',
          description: 'Please fill in all delivery details',
          variant: 'destructive',
        });
        return;
      }
      deliveryAddress = {
        fullName,
        phone,
        addressLine: address,
        city,
        state,
        pincode
      };
    } else {
      const selected = savedAddresses.find(a => a._id === selectedAddressId);
      if (!selected) {
        toast({
          title: 'Error',
          description: 'Please select an address',
          variant: 'destructive',
        });
        return;
      }
      deliveryAddress = {
        fullName: selected.fullName,
        phone: selected.phone,
        addressLine: selected.addressLine,
        city: selected.city,
        state: selected.state,
        pincode: selected.pincode
      };
    }

    setIsLoading(true);

    try {
      // Save address if requested
      if (showNewAddressForm && saveNewAddress) {
        await userAPI.addAddress({
          ...deliveryAddress,
          isDefault: savedAddresses.length === 0 // Make default if it's the first one
        });
      }

      const orderData = {
        items: cartItems.map(item => ({
          machineId: item.machineId,
          quantity: item.quantity
        })),
        deliveryAddress
      };

      await axios.post('http://localhost:5000/api/orders', orderData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setOrderPlaced(true);
      clearCart();
      toast({
        title: 'Order Placed Successfully!',
        description: 'You will receive a confirmation email shortly',
      });
    } catch (error: any) {
      console.error('Order placement error:', error);
      toast({
        title: 'Order Failed',
        description: error.response?.data?.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ... (navigation guards remain same)

  // Handle redirects in useEffect to avoid render-phase side effects
  React.useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        navigate('/login', { state: { from: '/checkout' } });
      } else if (cartItems.length === 0 && !orderPlaced) {
        navigate('/cart');
      }
    }
  }, [authLoading, isAuthenticated, cartItems, orderPlaced, navigate]);

  // Show loader while checking auth state
  if (authLoading) {
    return (
      <Layout>
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  // Prevent rendering content if we're about to redirect
  if (!isAuthenticated || (cartItems.length === 0 && !orderPlaced)) {
    return null;
  }

  if (orderPlaced) {
    // ... (success view remains same)
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
          {/* Delivery Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePlaceOrder} className="space-y-6">

                  {/* Saved Addresses List */}
                  {!showNewAddressForm && savedAddresses.length > 0 && (
                    <div className="space-y-4 mb-6">
                      {savedAddresses.map((addr) => (
                        <div
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedAddressId === addr._id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                          key={addr._id}
                          onClick={() => handleAddressSelect(addr._id)}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-4 h-4 rounded-full border mt-1 flex items-center justify-center ${selectedAddressId === addr._id ? 'border-primary' : 'border-muted-foreground'}`}>
                              {selectedAddressId === addr._id && <div className="w-2 h-2 rounded-full bg-primary" />}
                            </div>
                            <div>
                              <p className="font-medium">{addr.fullName} <span className="text-muted-foreground font-normal">({addr.phone})</span></p>
                              <p className="text-sm text-muted-foreground mt-1">
                                {addr.addressLine}, {addr.city}, {addr.state} - {addr.pincode}
                              </p>
                              {addr.isDefault && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded mt-2 inline-block">Default</span>}
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
                            if (!selectedAddressId && savedAddresses.length > 0) {
                              setSelectedAddressId(savedAddresses[0]._id);
                            }
                          }}
                        >
                          <ArrowLeft className="w-3 h-3 mr-1" /> Back to saved addresses
                        </Button>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                          id="fullName"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleChange}
                          placeholder="Enter your full name"
                          disabled={isLoading}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+91 98765 43210"
                          disabled={isLoading}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Input
                          id="address"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          placeholder="Street address, building, floor"
                          disabled={isLoading}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            placeholder="City"
                            disabled={isLoading}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="state">State</Label>
                          <Input
                            id="state"
                            name="state"
                            value={formData.state}
                            onChange={handleChange}
                            placeholder="State"
                            disabled={isLoading}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="pincode">Pincode</Label>
                        <Input
                          id="pincode"
                          name="pincode"
                          value={formData.pincode}
                          onChange={handleChange}
                          placeholder="6-digit pincode"
                          maxLength={6}
                          disabled={isLoading}
                        />
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <input
                          type="checkbox"
                          id="saveAddress"
                          className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                          checked={saveNewAddress}
                          onChange={(e) => setSaveNewAddress(e.target.checked)}
                        />
                        <Label htmlFor="saveAddress" className="cursor-pointer font-normal">Save this address for future orders</Label>
                      </div>
                    </div>
                  )}

                  <Button type="submit" size="lg" className="w-full mt-6" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Placing Order...
                      </>
                    ) : (
                      'Place Order'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
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
