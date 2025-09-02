import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Star, Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { Product, useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { wishlistService } from "@/lib/wishlist-service";
import { useState, useEffect } from "react";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Get all available images (main image + additional images)
  const allImages = [
    ...(product.image ? [product.image] : []),
    ...(product.images || [])
  ].filter(Boolean);

  // Use placeholder if no images available
  const displayImages = allImages.length > 0 ? allImages : ['/placeholder.svg'];

  const handleAddToCart = async () => {
    try {
      await addToCart(product);
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

  // Check if product is in wishlist on component mount
  useEffect(() => {
    if (isAuthenticated) {
      checkWishlistStatus();
    }
  }, [isAuthenticated, product.id]);

  const checkWishlistStatus = async () => {
    try {
      const inWishlist = await wishlistService.isInWishlist(product.id);
      setIsInWishlist(inWishlist);
    } catch (error) {
      console.error('Error checking wishlist status:', error);
    }
  };

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Login required",
        description: "Please log in to add items to your wishlist.",
        variant: "destructive",
      });
      return;
    }

    try {
      setWishlistLoading(true);
      if (isInWishlist) {
        await wishlistService.removeFromWishlist(product.id);
        setIsInWishlist(false);
        toast({
          title: "Removed from wishlist",
          description: `${product.title} has been removed from your wishlist.`,
        });
      } else {
        await wishlistService.addToWishlist(product.id);
        setIsInWishlist(true);
        toast({
          title: "Added to wishlist",
          description: `${product.title} has been added to your wishlist.`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update wishlist",
        variant: "destructive",
      });
    } finally {
      setWishlistLoading(false);
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

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % displayImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-card border-border">
      <div className="relative overflow-hidden">
        <img
          src={displayImages[currentImageIndex].startsWith('/') ? 
            `http://localhost:3001${displayImages[currentImageIndex]}` : 
            displayImages[currentImageIndex]
          }
          alt={product.title}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder.svg';
          }}
        />
        
        {/* Navigation arrows - only show if multiple images */}
        {displayImages.length > 1 && (
          <>
            <Button
              size="sm"
              variant="ghost"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background/90 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={prevImage}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="absolute right-12 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background/90 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={nextImage}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}

        <Badge 
          variant="secondary" 
          className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm"
        >
          {product.category.name}
        </Badge>
        
        {/* Image counter */}
        {displayImages.length > 1 && (
          <Badge 
            variant="secondary" 
            className="absolute bottom-2 left-2 bg-background/80 backdrop-blur-sm text-xs"
          >
            {currentImageIndex + 1}/{displayImages.length}
          </Badge>
        )}

        <Button
          size="sm"
          variant="ghost"
          className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm hover:bg-background/90"
          onClick={handleWishlistToggle}
          disabled={wishlistLoading}
        >
          <Heart 
            className={`h-4 w-4 ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} 
          />
        </Button>

        {/* Image dots indicator */}
        {displayImages.length > 1 && (
          <div className="absolute bottom-2 right-2 flex space-x-1">
            {displayImages.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentImageIndex ? 'bg-primary' : 'bg-background/60'
                }`}
                onClick={() => goToImage(index)}
              />
            ))}
          </div>
        )}
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-medium text-foreground line-clamp-2 mb-2">
          {product.title}
        </h3>
        
        <div className="flex items-center space-x-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              className={`h-3 w-3 ${i < 4 ? 'fill-accent text-accent' : 'text-muted-foreground'}`} 
            />
          ))}
          <span className="text-xs text-muted-foreground ml-2">(127)</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-foreground">
            {formatPrice(product.price)}
          </span>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <Button 
          onClick={handleAddToCart}
          className="w-full"
          size="sm"
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;