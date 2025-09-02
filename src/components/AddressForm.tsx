import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import AddressAutocomplete from './AddressAutocomplete';

interface AddressDetails {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
  placeId?: string;
  formattedAddress?: string;
}

interface AddressFormData extends AddressDetails {
  addressType: string;
  isDefault: boolean;
}

interface AddressFormProps {
  onSubmit: (address: AddressFormData) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<AddressFormData>;
  isEditing?: boolean;
}

const AddressForm: React.FC<AddressFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isEditing = false
}) => {
  const [formData, setFormData] = useState<AddressFormData>({
    street: initialData?.street || '',
    city: initialData?.city || '',
    state: initialData?.state || '',
    postalCode: initialData?.postalCode || '',
    country: initialData?.country || 'India',
    latitude: initialData?.latitude,
    longitude: initialData?.longitude,
    placeId: initialData?.placeId,
    formattedAddress: initialData?.formattedAddress,
    addressType: initialData?.addressType || 'HOME',
    isDefault: initialData?.isDefault || false
  });

  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAddressSelect = (address: AddressDetails) => {
    setFormData(prev => ({
      ...prev,
      ...address
    }));
  };

  const handleInputChange = (field: keyof AddressFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.street || !formData.city || !formData.state || !formData.postalCode) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required address fields.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit(formData);
      toast({
        title: "Success",
        description: `Address ${isEditing ? 'updated' : 'added'} successfully.`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : `Failed to ${isEditing ? 'update' : 'add'} address.`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {isEditing ? 'Edit Address' : 'Add New Address'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Google Maps Address Autocomplete */}
          <div>
            <Label htmlFor="address-search">Search Address</Label>
            <AddressAutocomplete
              onAddressSelect={handleAddressSelect}
              placeholder="Start typing your address..."
              initialValue={formData.formattedAddress || ''}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Use the search above for accurate location or fill manually below
            </p>
          </div>

          {/* Manual Address Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="street">Street Address *</Label>
              <Input
                id="street"
                value={formData.street}
                onChange={(e) => handleInputChange('street', e.target.value)}
                placeholder="House/Flat No., Street Name"
                required
              />
            </div>

            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="City"
                required
              />
            </div>

            <div>
              <Label htmlFor="state">State *</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                placeholder="State"
                required
              />
            </div>

            <div>
              <Label htmlFor="postalCode">Postal Code *</Label>
              <Input
                id="postalCode"
                value={formData.postalCode}
                onChange={(e) => handleInputChange('postalCode', e.target.value)}
                placeholder="PIN Code"
                required
              />
            </div>

            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                placeholder="Country"
              />
            </div>
          </div>

          {/* Address Type */}
          <div>
            <Label htmlFor="addressType">Address Type</Label>
            <Select
              value={formData.addressType}
              onValueChange={(value) => handleInputChange('addressType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select address type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="HOME">Home</SelectItem>
                <SelectItem value="WORK">Work</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Default Address Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isDefault"
              checked={formData.isDefault}
              onCheckedChange={(checked) => handleInputChange('isDefault', checked as boolean)}
            />
            <Label htmlFor="isDefault" className="text-sm">
              Set as default address
            </Label>
          </div>

          {/* Location Info Display */}
          {formData.latitude && formData.longitude && (
            <div className="bg-muted/50 p-3 rounded-lg">
              <p className="text-sm text-muted-foreground">
                📍 Location: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
              </p>
              {formData.placeId && (
                <p className="text-xs text-muted-foreground">
                  Google Place ID: {formData.placeId}
                </p>
              )}
            </div>
          )}

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Saving...' : (isEditing ? 'Update Address' : 'Add Address')}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddressForm;
