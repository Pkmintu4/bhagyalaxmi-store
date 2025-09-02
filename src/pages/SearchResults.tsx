import { useState, useMemo, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Filter, Search } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { searchProductsData } from "@/lib/data-service";
import { useToast } from "@/hooks/use-toast";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const [sortBy, setSortBy] = useState<string>("default");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const query = searchParams.get("q") || "";
  const { toast } = useToast();

  useEffect(() => {
    const performSearch = async () => {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      setLoading(true);
      try {
        const results = await searchProductsData(query);
        setSearchResults(results);
      } catch (error) {
        console.error('Error searching products:', error);
        toast({
          title: "Search error",
          description: "Unable to search products from database.",
          variant: "destructive"
        });
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [query, toast]);

  const sortedResults = useMemo(() => {
    let filtered = [...searchResults];

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
  }, [searchResults, sortBy]);

  if (!query.trim()) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold text-foreground mb-4">No Search Query</h1>
          <p className="text-muted-foreground mb-6">Please enter a search term to find products.</p>
          <Link to="/">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Searching...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Search Results
              </h1>
              <p className="text-muted-foreground">
                Found {sortedResults.length} results for "{query}"
              </p>
            </div>
            <Link to="/">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Sort by:</span>
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Best Match</SelectItem>
                <SelectItem value="name">Name A-Z</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results */}
        {sortedResults.length === 0 ? (
          <div className="text-center py-16">
            <Search className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold text-foreground mb-4">No Results Found</h2>
            <p className="text-muted-foreground mb-8">
              No products found matching "{query}". Try different keywords or browse our categories.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/categories">
                <Button>
                  Browse Categories
                </Button>
              </Link>
              <Link to="/">
                <Button variant="outline">
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedResults.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults; 