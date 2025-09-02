import { useState } from "react";
import { Search, ShoppingCart, Menu, User, LogOut, Heart, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { items } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  
  const cartItemsCount = items.reduce((total, item) => total + item.quantity, 0);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">S</span>
            </div>
            <span className="text-xl font-bold text-foreground">BhagyaLaxmi Online</span>
          </Link>

          {/* Search Bar - Hidden on mobile */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <form onSubmit={handleSearch} className="relative w-full flex">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                placeholder="Search for products..." 
                className="pl-10 pr-12 py-2 w-full rounded-r-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button 
                type="submit" 
                size="sm" 
                className="rounded-l-none border-l-0"
                disabled={!searchQuery.trim()}
              >
                Search
              </Button>
            </form>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Categories - Hidden on mobile */}
            <Link to="/categories" className="hidden lg:block">
              <Button variant="ghost" size="sm">
                Categories
              </Button>
            </Link>

            {/* User account */}
            {isAuthenticated ? (
              <div className="hidden md:flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  Hi, {user?.name}
                </span>
                {user?.role === 'ADMIN' && (
                  <Link to="/admin">
                    <Button variant="ghost" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Admin
                    </Button>
                  </Link>
                )}
                <Link to="/profile">
                  <Button variant="ghost" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </Button>
                </Link>
                <Link to="/wishlist">
                  <Button variant="ghost" size="sm">
                    <Heart className="h-4 w-4 mr-2" />
                    Wishlist
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleLogout}
                  className="text-destructive hover:text-destructive"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="outline" size="sm">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}

            {/* Cart */}
            <Link to="/cart">
              <Button variant="ghost" size="sm" className="relative">
                <ShoppingCart className="h-4 w-4" />
                {cartItemsCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {cartItemsCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* Mobile menu button */}
            <Button 
              variant="ghost" 
              size="sm"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="space-y-4">
              <form onSubmit={handleSearch} className="relative flex">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input 
                  placeholder="Search for products..." 
                  className="pl-10 pr-12 py-2 w-full rounded-r-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button 
                  type="submit" 
                  size="sm" 
                  className="rounded-l-none border-l-0"
                  disabled={!searchQuery.trim()}
                >
                  Search
                </Button>
              </form>
              <div className="flex flex-col space-y-2">
                <Link to="/categories">
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    Categories
                  </Button>
                </Link>
                {isAuthenticated ? (
                  <>
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                      Hi, {user?.name}
                    </div>
                    {user?.role === 'ADMIN' && (
                      <Link to="/admin">
                        <Button variant="ghost" size="sm" className="w-full justify-start">
                          <Settings className="h-4 w-4 mr-2" />
                          Admin Dashboard
                        </Button>
                      </Link>
                    )}
                    <Link to="/profile">
                      <Button variant="ghost" size="sm" className="w-full justify-start">
                        <User className="h-4 w-4 mr-2" />
                        Profile
                      </Button>
                    </Link>
                    <Link to="/wishlist">
                      <Button variant="ghost" size="sm" className="w-full justify-start">
                        <Heart className="h-4 w-4 mr-2" />
                        Wishlist
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-start text-destructive"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/login">
                      <Button variant="ghost" size="sm" className="w-full justify-start">
                        <User className="h-4 w-4 mr-2" />
                        Login
                      </Button>
                    </Link>
                    <Link to="/register">
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        Sign Up
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;