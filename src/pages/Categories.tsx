import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Upload, FileText, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useRef, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import FileUpload from "@/components/FileUpload";
import { getCategoriesData } from "@/lib/data-service";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await getCategoriesData();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast({
          title: "Error loading categories",
          description: "Unable to load categories from database.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
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
          <p className="text-lg text-muted-foreground">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Product Categories
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Browse through our wide range of product categories to find exactly what you're looking for.
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
                  <h2 className="text-2xl font-bold mb-2">{category.name}</h2>
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

        {/* Upload List Section */}
        <div className="text-center mt-16">
          <div className="bg-muted/30 rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Upload Your Shopping List
            </h3>
            <p className="text-muted-foreground mb-6">
              Have a shopping list? Upload it as a text file and we'll help you find all the items quickly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                onClick={() => setShowFileUpload(true)}
                className="bg-primary hover:bg-primary/90"
              >
                <Upload className="mr-2 h-5 w-5" />
                Upload List
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

      {/* File Upload Modal */}
      {showFileUpload && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Upload Your Shopping List</h3>
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

export default Categories;