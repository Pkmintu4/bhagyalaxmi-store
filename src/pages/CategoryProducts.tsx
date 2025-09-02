import { useState, useMemo, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Filter } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { getProductsByCategoryData, getCategoryBySlugData } from "@/lib/data-service";
import { useToast } from "@/hooks/use-toast";

const CategoryProducts = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [sortBy, setSortBy] = useState<string>("default");
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      if (!categoryId) return;
      
      try {
        const [productsData, categoryData] = await Promise.all([
          getProductsByCategoryData(categoryId),
          getCategoryBySlugData(categoryId)
        ]);
        setProducts(productsData);
        setCategory(categoryData);
      } catch (error) {
        console.error('Error fetching category data:', error);
        toast({
          title: "Error loading category",
          description: "Unable to load category products from database.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [categoryId, toast]);

  const categoryProducts = useMemo(() => {
    let filtered = products;

    // Sort products
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "name":
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        // Keep original order
        break;
    }

    return filtered;
  }, [products, sortBy]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading category...</p>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Category Not Found</h1>
          <Link to="/categories">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Categories
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-muted/30 border-b border-border">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center space-x-4 mb-6">
            <Link to="/categories">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Categories
              </Button>
            </Link>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                {category.name}
              </h1>
              <p className="text-muted-foreground">
                {category.description} • {categoryProducts.length} products
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="px-3 py-1">
                <Filter className="mr-2 h-3 w-3" />
                Filter & Sort
              </Badge>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="name">Name: A to Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container mx-auto px-4 py-8">
        {categoryProducts.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-foreground mb-4">No Products Found</h2>
            <p className="text-muted-foreground mb-8">
              No products available in this category at the moment.
            </p>
            <Link to="/categories">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Browse Other Categories
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categoryProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryProducts;
