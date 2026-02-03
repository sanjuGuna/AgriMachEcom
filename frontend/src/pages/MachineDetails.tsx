import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ShoppingCart, ArrowLeft, Loader2, Package, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Layout from '@/components/Layout';
import ImageCarousel from '@/components/ImageCarousel';
import { machineAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';

interface Machine {
  _id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
}

const MachineDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { toast } = useToast();

  const { data: machine, isLoading, error } = useQuery({
    queryKey: ['machine', id],
    queryFn: async () => {
      const response = await machineAPI.getById(id!);
      return response.data as Machine;
    },
    enabled: !!id,
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast({
        title: 'Login Required',
        description: 'Please login to add items to your cart',
        variant: 'destructive',
      });
      navigate('/login', { state: { from: `/machines/${id}` } });
      return;
    }

    if (machine) {
      addToCart({
        machineId: machine._id,
        name: machine.name,
        price: machine.price,
        image: machine.images?.[0] || '/placeholder.svg',
      });
      toast({
        title: 'Added to Cart',
        description: `${machine.name} has been added to your cart`,
      });
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <p className="text-muted-foreground">Loading machine details...</p>
        </div>
      </Layout>
    );
  }

  if (error || !machine) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">
            Machine Not Found
          </h2>
          <p className="text-muted-foreground mb-6">
            The machine you're looking for doesn't exist or couldn't be loaded.
          </p>
          <Link to="/">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
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
            to="/"
            className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Link>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Section */}
          <div className="animate-fade-in">
            <ImageCarousel images={machine.images || []} alt={machine.name} />
          </div>

          {/* Details Section */}
          <div className="animate-slide-up">
            <Badge variant="secondary" className="mb-4">
              {machine.category}
            </Badge>

            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              {machine.name}
            </h1>

            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              {machine.description}
            </p>

            {/* Price */}
            <div className="bg-muted/50 rounded-xl p-6 mb-6">
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-4xl font-bold text-primary">
                  {formatPrice(machine.price)}
                </span>
                <span className="text-muted-foreground">per unit</span>
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2">
                {machine.stock > 0 ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-primary" />
                    <span className="text-foreground font-medium">
                      {machine.stock > 10 ? 'In Stock' : `Only ${machine.stock} left in stock`}
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5 text-destructive" />
                    <span className="text-destructive font-medium">Out of Stock</span>
                  </>
                )}
              </div>
            </div>

            {/* Add to Cart */}
            <Button
              size="xl"
              className="w-full gap-3"
              onClick={handleAddToCart}
              disabled={machine.stock === 0}
            >
              <ShoppingCart className="w-5 h-5" />
              {machine.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </Button>

            {/* Features */}
            <div className="mt-8 pt-8 border-t border-border">
              <h3 className="font-display font-semibold text-lg mb-4">Key Features</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-muted-foreground">
                  <Package className="w-5 h-5 text-primary" />
                  <span>Free delivery on orders above ₹50,000</span>
                </li>
                <li className="flex items-center gap-3 text-muted-foreground">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span>1 Year Manufacturer Warranty</span>
                </li>
                <li className="flex items-center gap-3 text-muted-foreground">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span>Expert Installation Support</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MachineDetails;
