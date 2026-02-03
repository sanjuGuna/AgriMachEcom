import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';

interface ProductCardProps {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  stock?: number;
}

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  category,
  price,
  image,
  stock,
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Card className="group overflow-hidden card-hover border-border/50 bg-card">
      <div className="relative overflow-hidden aspect-[4/3]">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            e.currentTarget.src = '/placeholder.svg';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <Badge
          variant="secondary"
          className="absolute top-3 left-3 font-medium"
        >
          {category}
        </Badge>
        {stock !== undefined && stock <= 5 && stock > 0 && (
          <Badge
            variant="destructive"
            className="absolute top-3 right-3"
          >
            Only {stock} left
          </Badge>
        )}
        {stock === 0 && (
          <Badge
            variant="destructive"
            className="absolute top-3 right-3"
          >
            Out of Stock
          </Badge>
        )}
      </div>
      <CardContent className="p-5">
        <h3 className="font-display font-semibold text-lg text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
          {name}
        </h3>
        <div className="flex items-center justify-between mt-4">
          <span className="text-2xl font-bold text-primary">
            {formatPrice(price)}
          </span>
          <Link to={`/machines/${id}`}>
            <Button size="sm" className="gap-2">
              <Eye className="w-4 h-4" />
              View Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
