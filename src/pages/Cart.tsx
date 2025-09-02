import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const Cart = () => {
  const { items, updateQuantity, removeFromCart, getTotalPrice, clearCart } = useCart();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  // Format price in Indian Rupees
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleQuantityChange = async (productId: string, newQuantity: number) => {
    try {
      if (newQuantity < 1) {
        await removeFromCart(productId);
        toast({
          title: "Item removed",
          description: "Product has been removed from your cart.",
        });
      } else {
        await updateQuantity(productId, newQuantity);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update cart",
        variant: "destructive",
      });
    }
  };

  const handleRemoveItem = async (productId: string) => {
    try {
      await removeFromCart(productId);
      toast({
        title: "Item removed",
        description: "Product has been removed from your cart.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove item",
        variant: "destructive",
      });
    }
  };

  const handleCheckout = async () => {
    setIsProcessing(true);
    try {
      // Simulate checkout process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await clearCart();
      setIsProcessing(false);
      
      toast({
        title: "Order placed successfully!",
        description: "Thank you for your purchase. You'll receive a confirmation email shortly.",
      });
    } catch (error) {
      setIsProcessing(false);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process checkout",
        variant: "destructive",
      });
    }
  };

  const totalPrice = getTotalPrice();
  const shipping = totalPrice > 5000 ? 0 : 500; // Free shipping over ₹5000
  const tax = totalPrice * 0.18; // 18% GST
  const finalTotal = totalPrice + shipping + tax;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center py-16">
            <div className="mb-8">
              <ShoppingBag className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
              <h1 className="text-3xl font-bold text-foreground mb-4">
                Your cart is empty
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Looks like you haven't added any items to your cart yet.
              </p>
            </div>
            
            <div className="space-y-4">
              <Link to="/categories">
                <Button size="lg" className="mr-4">
                  Start Shopping
                </Button>
              </Link>
              <Link to="/">
                <Button size="lg" variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <Link to="/categories">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Continue Shopping
            </Button>
          </Link>
          
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Shopping Cart
          </h1>
          <p className="text-muted-foreground">
            {items.length} {items.length === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full sm:w-24 h-24 object-cover rounded-lg"
                    />
                    
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                        <div>
                          <h3 className="font-medium text-foreground line-clamp-2">
                            {item.title}
                          </h3>
                          <Badge variant="secondary" className="mt-1 w-fit">
                            {item.category.name}
                          </Badge>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-xl font-bold text-foreground">
                            {formatPrice(item.price)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          
                          <span className="w-12 text-center font-medium">
                            {item.quantity}
                          </span>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal ({items.length} items)</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>
                    {shipping === 0 ? (
                      <Badge variant="outline" className="text-success">FREE</Badge>
                    ) : (
                      formatPrice(shipping)
                    )}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span>GST (18%)</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatPrice(finalTotal)}</span>
                </div>
                
                {totalPrice < 5000 && (
                  <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                    Add {formatPrice(5000 - totalPrice)} more for FREE shipping!
                  </div>
                )}
                
                <Button 
                  onClick={handleCheckout}
                  className="w-full" 
                  size="lg"
                  disabled={isProcessing}
                >
                  {isProcessing ? "Processing..." : "Proceed to Checkout"}
                </Button>
                
                <p className="text-xs text-muted-foreground text-center">
                  Secure checkout powered by industry-standard encryption
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;