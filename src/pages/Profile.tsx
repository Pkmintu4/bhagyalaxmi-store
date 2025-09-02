import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { addressService } from '@/lib/address-service';
import { wishlistService } from '@/lib/wishlist-service';
import AdminDashboard from './AdminDashboard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Heart, MapPin, Plus, Edit, Trash2, User, Mail, Phone, Settings, BarChart3 } from 'lucide-react';

interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  addressType: string;
}

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

const Profile = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [activeTab, setActiveTab] = useState('profile');

  // Form state for address
  const [addressForm, setAddressForm] = useState({
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    isDefault: false,
    addressType: 'HOME'
  });

  useEffect(() => {
    if (isAuthenticated) {
      loadUserData();
    }
  }, [isAuthenticated]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const [addressesData, wishlistData] = await Promise.all([
        addressService.getAddresses(),
        wishlistService.getWishlist()
      ]);
      setAddresses(addressesData);
      setWishlist(wishlistData);
    } catch (error) {
      console.error('Error loading user data:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addressService.addAddress(addressForm);
      toast({
        title: "Success",
        description: "Address added successfully",
      });
      setShowAddAddress(false);
      setAddressForm({
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'India',
        isDefault: false,
        addressType: 'HOME'
      });
      loadUserData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add address",
        variant: "destructive",
      });
    }
  };

  const handleUpdateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAddress) return;

    try {
      await addressService.updateAddress(editingAddress.id, addressForm);
      toast({
        title: "Success",
        description: "Address updated successfully",
      });
      setEditingAddress(null);
      setAddressForm({
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'India',
        isDefault: false,
        addressType: 'HOME'
      });
      loadUserData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update address",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    try {
      await addressService.deleteAddress(addressId);
      toast({
        title: "Success",
        description: "Address deleted successfully",
      });
      loadUserData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete address",
        variant: "destructive",
      });
    }
  };

  const handleRemoveFromWishlist = async (productId: string) => {
    try {
      await wishlistService.removeFromWishlist(productId);
      toast({
        title: "Success",
        description: "Item removed from wishlist",
      });
      loadUserData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove from wishlist",
        variant: "destructive",
      });
    }
  };

  const startEditAddress = (address: Address) => {
    setEditingAddress(address);
    setAddressForm({
      street: address.street,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      isDefault: address.isDefault,
      addressType: address.addressType
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Please log in to view your profile.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Admin Navigation */}
      {user?.role === 'ADMIN' && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Admin Panel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button 
                variant={activeTab === 'profile' ? 'default' : 'outline'}
                onClick={() => setActiveTab('profile')}
              >
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>
              <Button 
                variant={activeTab === 'admin' ? 'default' : 'outline'}
                onClick={() => setActiveTab('admin')}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Admin Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'admin' && user?.role === 'ADMIN' ? (
        <AdminDashboard />
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {/* User Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{user?.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{user?.name || 'No name provided'}</span>
              </div>
              {user?.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{user.phone}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Addresses */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Addresses
                </div>
                <Button
                  size="sm"
                  onClick={() => setShowAddAddress(true)}
                  className="flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {addresses.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No addresses added yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {addresses.map((address) => (
                    <div key={address.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={address.isDefault ? "default" : "secondary"}>
                              {address.isDefault ? "Default" : address.addressType}
                            </Badge>
                          </div>
                          <p className="font-medium">{address.street}</p>
                          <p className="text-sm text-muted-foreground">
                            {address.city}, {address.state} {address.postalCode}
                          </p>
                          <p className="text-sm text-muted-foreground">{address.country}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startEditAddress(address)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteAddress(address.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Wishlist */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Wishlist ({wishlist.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {wishlist.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Your wishlist is empty.
                </p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {wishlist.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-32 object-cover rounded-md mb-3"
                          />
                          <h3 className="font-medium mb-1">{item.title}</h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {item.category.name}
                          </p>
                          <p className="font-bold text-lg">₹{item.price}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemoveFromWishlist(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add/Edit Address Modal */}
      {(showAddAddress || editingAddress) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>
                {editingAddress ? 'Edit Address' : 'Add New Address'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={editingAddress ? handleUpdateAddress : handleAddAddress}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="street">Street Address</Label>
                    <Input
                      id="street"
                      value={addressForm.street}
                      onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={addressForm.city}
                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={addressForm.state}
                        onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input
                        id="postalCode"
                        value={addressForm.postalCode}
                        onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        value={addressForm.country}
                        onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="addressType">Address Type</Label>
                    <Select
                      value={addressForm.addressType}
                      onValueChange={(value) => setAddressForm({ ...addressForm, addressType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="HOME">Home</SelectItem>
                        <SelectItem value="WORK">Work</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isDefault"
                      checked={addressForm.isDefault}
                      onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                    />
                    <Label htmlFor="isDefault">Set as default address</Label>
                  </div>
                </div>
                <div className="flex gap-2 mt-6">
                  <Button type="submit" className="flex-1">
                    {editingAddress ? 'Update' : 'Add'} Address
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddAddress(false);
                      setEditingAddress(null);
                      setAddressForm({
                        street: '',
                        city: '',
                        state: '',
                        postalCode: '',
                        country: 'India',
                        isDefault: false,
                        addressType: 'HOME'
                      });
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Profile; 