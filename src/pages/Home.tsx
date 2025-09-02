import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowRight, TrendingUp, Zap, Shield, Upload, FileText, X, Sparkles, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { useRef, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import ProductCard from "@/components/ProductCard";
import FileUpload from "@/components/FileUpload";
import { getProductsData, getCategoriesData } from "@/lib/data-service";
import heroBanner from "@/assets/hero-banner.jpg";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const featuredProducts = products.slice(0, 8);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, categoriesData] = await Promise.all([
          getProductsData(),
          getCategoriesData()
        ]);
        setProducts(productsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error loading data",
          description: "Unable to load products and categories.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const handleItemsParsed = (items: any[]) => {
    toast({
      title: "Shopping list processed!",
      description: `Found ${items.length} items. You can now search for them in our store.`,
    });
    setShowFileUpload(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: `url(${heroBanner})` }}
        />
        
        <div className="relative container mx-auto px-4 py-24 lg:py-32">
          <div className="max-w-3xl mx-auto text-center animate-fadeIn">
            <Badge variant="secondary" className="mb-6 bg-accent/20 text-accent-foreground">
              <Sparkles className="h-3 w-3 mr-1" />
              New Collection - Elegant Jewellery & Fashion
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Discover Elegant 
              <span className="block text-accent">Jewellery & Fashion</span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-8 opacity-90 leading-relaxed">
              Explore our stunning collection of fine jewellery and trendy fashion items. From timeless pieces to contemporary styles.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/categories">
                <Button size="lg" variant="secondary" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  Explore Collection
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                onClick={() => setShowFileUpload(true)}
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Wishlist
              </Button>
            </div>
            

          </div>
        </div>

        {/* Features */}
        <div className="relative bg-primary-foreground/10 backdrop-blur-sm border-t border-primary-foreground/20">
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="flex items-center justify-center space-x-3">
                <Zap className="h-6 w-6 text-accent" />
                <span className="font-medium">Premium Quality</span>
              </div>
              <div className="flex items-center justify-center space-x-3">
                <Shield className="h-6 w-6 text-accent" />
                <span className="font-medium">Authentic Pieces</span>
              </div>
              <div className="flex items-center justify-center space-x-3">
                <Heart className="h-6 w-6 text-accent" />
                <span className="font-medium">Elegant Designs</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Browse Collections
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover our carefully curated collections of fine jewellery and trendy fashion pieces.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {categories.map((category, index) => (
              <Card 
                key={category.id} 
                className="group overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 animate-fadeIn bg-gradient-to-br from-card to-muted/20"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="relative">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  
                  <CardContent className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="text-2xl font-bold mb-2">{category.name}</h3>
                    <p className="text-base opacity-90 mb-4">{category.description}</p>
                    
                    <Link to={`/category/${category.slug}`}>
                      <Button 
                        variant="secondary" 
                        className="bg-accent hover:bg-accent/90 text-accent-foreground transform transition-all duration-300 group-hover:scale-105"
                      >
                        Explore {category.name}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Upload List Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="bg-muted/30 rounded-2xl p-8 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Have a Wishlist?
              </h3>
              <p className="text-muted-foreground mb-6">
                Upload your wishlist as a text file and we'll help you find all the items quickly.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button 
                  size="lg" 
                  onClick={() => setShowFileUpload(true)}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Upload className="mr-2 h-5 w-5" />
                  Upload Wishlist
                </Button>
                <Button size="lg" variant="outline">
                  <FileText className="mr-2 h-5 w-5" />
                  Create List
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Supported formats: Images, .txt, .csv, .json, .xlsx files
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Featured Pieces
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Handpicked selection of our most elegant jewellery and trendy fashion items.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="text-center">
            <Link to="/categories">
              <Button size="lg" variant="outline">
                View All Collections
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* File Upload Modal */}
      {showFileUpload && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Upload Your Wishlist</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFileUpload(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <FileUpload onItemsParsed={handleItemsParsed} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;