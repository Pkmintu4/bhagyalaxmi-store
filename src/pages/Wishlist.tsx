import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { wishlistService } from '@/lib/wishlist-service';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Heart, ShoppingCart, Trash2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface WishlistItem {
  id: string;
  title: string;
  price: number;
  image: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  addedAt: string;
}

const Wishlist = () => {
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      loadWishlist();
    }
  }, [isAuthenticated]);

  const loadWishlist = async () => {
    try {
      setLoading(true);
      const wishlistData = await wishlistService.getWishlist();
      setWishlist(wishlistData);
    } catch (error) {
      console.error('Error loading wishlist:', error);
      toast({
        title: "Error",
        description: "Failed to load wishlist",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (productId: string) => {
    try {
      await wishlistService.removeFromWishlist(productId);
      toast({
        title: "Success",
        description: "Item removed from wishlist",
      });
      loadWishlist();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove from wishlist",
        variant: "destructive",
      });
    }
  };

  const handleAddToCart = async (product: WishlistItem) => {
    try {
      await addToCart({
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
        category: product.category,
      });
      toast({
        title: "Added to cart",
        description: `${product.title} has been added to your cart.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add item to cart",
        variant: "destructive",
      });
    }
  };

  // Format price in Indian Rupees
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Login Required</h2>
              <p className="text-muted-foreground mb-4">
                Please log in to view your wishlist.
              </p>
              <Link to="/login">
                <Button>Login</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading wishlist...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Heart className="h-6 w-6 text-red-500" />
          <h1 className="text-3xl font-bold">My Wishlist</h1>
          <Badge variant="secondary" className="ml-2">
            {wishlist.length} items
          </Badge>
        </div>
      </div>

      {wishlist.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Your wishlist is empty</h2>
              <p className="text-muted-foreground mb-6">
                Start adding products to your wishlist by browsing our collection.
              </p>
              <Link to="/">
                <Button>Browse Products</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {wishlist.map((item) => (
            <Card key={item.id} className="group overflow-hidden transition-all duration-300 hover:shadow-lg">
              <div className="relative overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <Badge 
                  variant="secondary" 
                  className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm"
                >
                  {item.category.name}
                </Badge>
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm hover:bg-background/90"
                  onClick={() => handleRemoveFromWishlist(item.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              
              <CardContent className="p-4">
                <h3 className="font-medium text-foreground line-clamp-2 mb-2">
                  {item.title}
                </h3>
                
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xl font-bold text-foreground">
                    {formatPrice(item.price)}
                  </span>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleAddToCart(item)}
                    className="flex-1"
                    size="sm"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist; 