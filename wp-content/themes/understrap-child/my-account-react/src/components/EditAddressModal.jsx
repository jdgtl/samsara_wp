import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Loader2 } from 'lucide-react';

const EditAddressModal = ({ isOpen, onClose, onSuccess, addressType, initialAddress }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    company: '',
    address_1: '',
    address_2: '',
    city: '',
    state: '',
    postcode: '',
    country: 'US',
    email: '',
    phone: '',
  });

  // Populate form with initial address data when modal opens
  useEffect(() => {
    if (isOpen && initialAddress) {
      setFormData({
        first_name: initialAddress.first_name || '',
        last_name: initialAddress.last_name || '',
        company: initialAddress.company || '',
        address_1: initialAddress.address_1 || '',
        address_2: initialAddress.address_2 || '',
        city: initialAddress.city || '',
        state: initialAddress.state || '',
        postcode: initialAddress.postcode || '',
        country: initialAddress.country || 'US',
        email: initialAddress.email || '',
        phone: initialAddress.phone || '',
      });
    }
  }, [isOpen, initialAddress]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const userId = window.samsaraMyAccount?.userId;
      const apiUrl = window.samsaraMyAccount?.apiUrl;
      const nonce = window.samsaraMyAccount?.nonce;

      if (!userId || !apiUrl || !nonce) {
        throw new Error('Missing WordPress configuration');
      }

      // Prepare the update payload
      const updateData = {
        [addressType]: formData
      };

      const response = await fetch(`${apiUrl}wc/v3/customers/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': nonce,
        },
        credentials: 'include',
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update address');
      }

      const data = await response.json();

      // Success!
      onSuccess(data);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update address');
      console.error('Error updating address:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Edit {addressType === 'billing' ? 'Billing' : 'Shipping'} Address
          </DialogTitle>
          <DialogDescription>
            Update your {addressType === 'billing' ? 'billing' : 'shipping'} address information
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name *</Label>
              <Input
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name *</Label>
              <Input
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Company (optional)</Label>
            <Input
              id="company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address_1">Street Address *</Label>
            <Input
              id="address_1"
              name="address_1"
              value={formData.address_1}
              onChange={handleChange}
              placeholder="Street address"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address_2">Apartment, suite, etc. (optional)</Label>
            <Input
              id="address_2"
              name="address_2"
              value={formData.address_2}
              onChange={handleChange}
              placeholder="Apartment, suite, unit, etc."
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State *</Label>
              <Input
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="CA"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="postcode">Zip Code *</Label>
              <Input
                id="postcode"
                name="postcode"
                value={formData.postcode}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>

          {addressType === 'billing' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>
            </>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Address'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditAddressModal;
