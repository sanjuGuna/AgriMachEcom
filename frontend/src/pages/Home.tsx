import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, ChevronDown, Tractor, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Layout from '@/components/Layout';
import ProductCard from '@/components/ProductCard';
import { machineAPI } from '@/lib/api';
import heroBanner from '@/assets/hero-banner.jpg';

interface Machine {
  _id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
}

const categories = [
  'All Categories',
  'Tractors',
  'Harvesters',
  'Plows',
  'Seeders',
  'Sprayers',
  'Irrigation',
  'Other',
];

const Home: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const { data: machines, isLoading, error } = useQuery({
    queryKey: ['machines'],
    queryFn: async () => {
      const response = await machineAPI.getAll();
      return response.data.machines as Machine[];
    },
  });

  const filteredMachines = machines?.filter((machine) => {
    const matchesCategory =
      selectedCategory === 'All Categories' || machine.category === selectedCategory;
    const matchesSearch =
      machine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      machine.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative h-[500px] md:h-[600px] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroBanner}
            alt="Agricultural Machinery"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-transparent" />
        </div>
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="max-w-2xl animate-slide-up">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6 leading-tight">
              Quality Agricultural
              <span className="block text-secondary">Machinery</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/90 mb-8 leading-relaxed">
              Discover our wide range of farming equipment designed to increase your productivity and efficiency.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="xl"
                variant="hero"
                onClick={() => {
                  document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <Tractor className="w-5 h-5 mr-2" />
                Browse Machinery
              </Button>
              <Button size="xl" variant="hero-outline">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Our <span className="text-primary">Machinery</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Browse our extensive collection of agricultural equipment
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-10 p-4 bg-card rounded-xl border border-border shadow-sm">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search machinery..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
              <p className="text-muted-foreground">Loading machinery...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-20 bg-destructive/10 rounded-xl">
              <p className="text-destructive font-medium mb-2">Failed to load machinery</p>
              <p className="text-muted-foreground text-sm">
                Please ensure the backend server is running on http://localhost:5000
              </p>
            </div>
          )}

          {/* Products Grid */}
          {!isLoading && !error && (
            <>
              {filteredMachines && filteredMachines.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredMachines.map((machine, index) => (
                    <div
                      key={machine._id}
                      className="animate-fade-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <ProductCard
                        id={machine._id}
                        name={machine.name}
                        category={machine.category}
                        price={machine.price}
                        image={machine.images?.[0] || '/placeholder.svg'}
                        stock={machine.stock}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <Tractor className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground">No machinery found matching your criteria</p>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Tractor className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">Quality Equipment</h3>
              <p className="text-muted-foreground text-sm">
                All our machinery is tested and certified for optimal performance
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-secondary/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">Best Prices</h3>
              <p className="text-muted-foreground text-sm">
                Competitive pricing with flexible payment options available
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">Expert Support</h3>
              <p className="text-muted-foreground text-sm">
                Dedicated customer support and after-sales service
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Home;
