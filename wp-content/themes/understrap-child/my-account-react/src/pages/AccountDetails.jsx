import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Separator } from '../components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Upload, Mountain, TreePine, Tent, Compass, Flag, Target, Zap, Wind, Sun, Waves, Snowflake, Loader2, AlertTriangle } from 'lucide-react';
import { useCustomer, useCustomerActions } from '../hooks/useCustomer';
import { avatarApi } from '../services/woocommerce';
import { toast } from 'sonner';
import { useAvatar } from '../contexts/AvatarContext';

const AccountDetails = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);

  // Use global avatar context
  const {
    avatarType,
    selectedEmoji,
    uploadedAvatarUrl,
    avatarOptions,
    updateAvatar
  } = useAvatar();

  // Fetch live customer data
  const { customer, loading, error, refetch } = useCustomer();
  const { updateCustomer, actionLoading } = useCustomerActions();

  // Get user data from WordPress global
  const userData = window.samsaraMyAccount?.userData || {};

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    displayName: '',
    email: '',
    phone: ''
  });

  // Initialize form data when customer loads
  useEffect(() => {
    if (customer) {
      setFormData({
        firstName: customer.firstName || '',
        lastName: customer.lastName || '',
        displayName: customer.displayName || userData.displayName || '',
        email: customer.email || userData.email || '',
        phone: customer.billing?.phone || ''
      });
    }
  }, [customer, userData.displayName, userData.email]);

  const handleSave = async () => {
    const updateData = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      billing: {
        ...customer?.billing,
        phone: formData.phone,
        first_name: formData.firstName,
        last_name: formData.lastName,
      }
    };

    const result = await updateCustomer(updateData);
    if (result.success) {
      setIsEditing(false);
      refetch();
    } else {
      alert(`Failed to save changes: ${result.error}`);
    }
  };

  const handleCancel = () => {
    if (customer) {
      setFormData({
        firstName: customer.firstName || '',
        lastName: customer.lastName || '',
        displayName: customer.displayName || userData.displayName || '',
        email: customer.email || userData.email || '',
        phone: customer.billing?.phone || ''
      });
    }
    setIsEditing(false);
  };

  const handleUploadAvatar = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a JPG, PNG, GIF, or WebP image');
      return;
    }

    setAvatarLoading(true);

    try {
      const response = await avatarApi.uploadAvatar(file);
      if (response.success) {
        // Update global context immediately
        updateAvatar('upload', null, response.avatarUrl);
        toast.success('Avatar uploaded successfully!');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to upload avatar');
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleSelectEmoji = async (option) => {
    // Save preference immediately (only save label and color, not the icon component)
    try {
      await avatarApi.savePreferences({
        avatarType: 'emoji',
        avatarEmoji: {
          label: option.label,
          color: option.color,
        },
      });
      // Update global context immediately
      updateAvatar('emoji', option, null);
      toast.success('Avatar style updated!');
    } catch (error) {
      console.error('Failed to save avatar preference:', error);
      toast.error('Failed to save avatar preference');
    }
  };

  const handleResetToDefault = async () => {
    try {
      await avatarApi.savePreferences({
        avatarType: 'initials',
      });
      // Update global context immediately
      updateAvatar('initials', null, null);
      toast.success('Reset to default avatar!');
    } catch (error) {
      console.error('Failed to reset avatar:', error);
      toast.error('Failed to reset avatar');
    }
  };

  const getCurrentAvatar = () => {
    if (avatarType === 'emoji' && selectedEmoji) {
      const Icon = selectedEmoji.icon;
      return (
        <div className={`h-24 w-24 rounded-full flex items-center justify-center flex-shrink-0 ${selectedEmoji.color}`}>
          <Icon className="h-12 w-12 text-white" />
        </div>
      );
    }

    if (avatarType === 'upload' && uploadedAvatarUrl) {
      return (
        <Avatar className="h-24 w-24 flex-shrink-0" data-testid="profile-avatar">
          <AvatarImage
            src={uploadedAvatarUrl}
            alt={`${formData.firstName} ${formData.lastName}`}
            className="object-cover"
          />
          <AvatarFallback className="bg-emerald-600 text-white text-2xl">
            {formData.firstName?.[0]}{formData.lastName?.[0]}
          </AvatarFallback>
        </Avatar>
      );
    }

    return (
      <Avatar className="h-24 w-24 flex-shrink-0" data-testid="profile-avatar">
        <AvatarImage
          src={userData.avatarUrl}
          alt={`${formData.firstName} ${formData.lastName}`}
          className="object-cover"
        />
        <AvatarFallback className="bg-emerald-600 text-white text-2xl">
          {formData.firstName?.[0]}{formData.lastName?.[0]}
        </AvatarFallback>
      </Avatar>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6" data-testid="account-details-loading">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-stone-900">Account Details</h1>
          <p className="text-stone-600">Manage your personal information and account settings</p>
        </div>
        <Card>
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mb-4" />
              <p className="text-stone-600">Loading account information...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-4xl mx-auto space-y-6" data-testid="account-details-error">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-stone-900">Account Details</h1>
          <p className="text-stone-600">Manage your personal information and account settings</p>
        </div>
        <Alert className="border-red-500 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="ml-2">
            <div className="text-red-900">
              <p className="font-medium">Failed to load account information</p>
              <p className="text-sm">{error}</p>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6" data-testid="account-details-page">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-stone-900">Account Details</h1>
        <p className="text-stone-600">Manage your personal information and account settings</p>
      </div>

      {/* Profile Picture */}
      <Card data-testid="profile-picture-section">
        <CardHeader>
          <CardTitle>Profile Picture</CardTitle>
          <CardDescription>Choose an avatar or upload your own image</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
            <div className="flex-shrink-0">
              {getCurrentAvatar()}
            </div>
            <div className="space-y-3 flex-1 w-full sm:w-auto text-center sm:text-left">
              <p className="text-sm text-stone-600">
                Current avatar type: {
                  avatarType === 'upload' ? 'Custom upload' :
                  avatarType === 'emoji' ? 'Icon' :
                  uploadedAvatarUrl ? 'Custom upload' :
                  userData.avatarUrl && userData.avatarUrl.includes('gravatar') ? 'Gravatar' :
                  'Initials'
                }
              </p>
              <div className="relative">
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={handleUploadAvatar}
                  disabled={avatarLoading}
                />
                <Button
                  onClick={() => document.getElementById('avatar-upload').click()}
                  variant="outline"
                  className="gap-2 w-full sm:w-auto"
                  data-testid="upload-avatar-btn"
                  disabled={avatarLoading}
                >
                  {avatarLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Upload New Photo
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <Label>Or choose a custom style</Label>
            <div className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
              {avatarOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = avatarType === 'emoji' && selectedEmoji?.label === option.label;
                return (
                  <button
                    key={option.label}
                    onClick={() => handleSelectEmoji(option)}
                    className={`
                      ${option.color}
                      rounded-full
                      flex items-center
                      aspect-square justify-center p-3
                      sm:aspect-auto sm:justify-start sm:px-4 sm:py-3
                      hover:scale-105 transition-transform
                      ${isSelected ? 'ring-4 ring-emerald-500 ring-offset-2' : ''}
                    `}
                    title={option.label}
                    data-testid={`avatar-option-${option.label.toLowerCase()}`}
                  >
                    <Icon className="h-8 w-8 sm:h-6 sm:w-6 text-white" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reset to Default Button - Only show if custom avatar is set */}
          {(avatarType === 'emoji' || avatarType === 'upload') && (
            <>
              <Separator />
              <div className="space-y-2">
                <Label>Default Avatar</Label>
                <p className="text-sm text-stone-600 mb-2">
                  Reset to use your Gravatar or initials
                </p>
                <Button
                  onClick={handleResetToDefault}
                  variant="outline"
                  className="gap-2"
                  data-testid="reset-avatar-btn"
                >
                  Reset to Default
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card data-testid="personal-info-section">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Your basic account information</CardDescription>
            </div>
            {!isEditing && (
              <Button 
                onClick={() => setIsEditing(true)}
                variant="outline"
                data-testid="edit-profile-btn"
              >
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                disabled={!isEditing}
                placeholder="How you'd like to be called"
                data-testid="display-name-input"
              />
              <p className="text-xs text-stone-500">This is how your name will appear throughout the site</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  disabled={!isEditing}
                  data-testid="first-name-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  disabled={!isEditing}
                  data-testid="last-name-input"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={!isEditing}
                data-testid="email-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={!isEditing}
                data-testid="phone-input"
              />
            </div>
            <div className="space-y-2">
              <Label>Member Since</Label>
              <p className="text-stone-900" data-testid="member-since-display">
                {userData.memberSince ? new Date(userData.memberSince).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                }) : 'N/A'}
              </p>
            </div>
          </div>

          {isEditing && (
            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleSave}
                disabled={actionLoading}
                className="bg-samsara-gold hover:bg-samsara-gold/90 text-samsara-black disabled:opacity-50"
                data-testid="save-changes-btn"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={actionLoading}
                data-testid="cancel-edit-btn"
              >
                Cancel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security - HIDDEN FOR NOW */}
      {/* <Card data-testid="security-section">
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>Manage your password and security settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Password</Label>
              <p className="text-sm text-stone-600 mb-2">Last changed 3 months ago</p>
              <Button
                variant="outline"
                onClick={handleChangePassword}
                data-testid="change-password-btn"
              >
                Change Password
              </Button>
            </div>
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
};

export default AccountDetails;