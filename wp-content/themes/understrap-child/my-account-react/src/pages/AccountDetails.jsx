import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Upload, Mountain, TreePine, Tent, Compass, Flag, Target, Zap, Wind, Sun, Waves, Snowflake } from 'lucide-react';
import { userData } from '../data/mockData';

const AccountDetails = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: userData.firstName,
    lastName: userData.lastName,
    displayName: userData.displayName,
    email: 'zahan@samsara.com',
    phone: '+1 (555) 123-4567'
  });
  const [avatarType, setAvatarType] = useState(userData.avatarType || 'initials');
  const [selectedEmoji, setSelectedEmoji] = useState(userData.avatarEmoji);

  // Outdoor-themed avatar options
  const avatarOptions = [
    { icon: Mountain, label: 'Mountain', color: 'bg-stone-600' },
    { icon: TreePine, label: 'Pine Tree', color: 'bg-emerald-700' },
    { icon: Tent, label: 'Tent', color: 'bg-amber-600' },
    { icon: Compass, label: 'Compass', color: 'bg-blue-600' },
    { icon: Flag, label: 'Flag', color: 'bg-red-600' },
    { icon: Target, label: 'Target', color: 'bg-orange-600' },
    { icon: Zap, label: 'Lightning', color: 'bg-yellow-600' },
    { icon: Wind, label: 'Wind', color: 'bg-cyan-600' },
    { icon: Sun, label: 'Sun', color: 'bg-yellow-500' },
    { icon: Waves, label: 'Waves', color: 'bg-blue-500' },
    { icon: Snowflake, label: 'Snowflake', color: 'bg-sky-400' },
  ];

  const handleSave = () => {
    alert('Profile changes would be saved here');
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      firstName: userData.firstName,
      lastName: userData.lastName,
      displayName: userData.displayName,
      email: 'zahan@samsara.com',
      phone: '+1 (555) 123-4567'
    });
    setIsEditing(false);
  };

  const handleChangePassword = () => {
    alert('Password change interface would open here');
  };

  const handleUploadAvatar = () => {
    alert('Avatar upload interface would open here');
    setAvatarType('upload');
  };

  const handleSelectEmoji = (option) => {
    setSelectedEmoji(option);
    setAvatarType('emoji');
  };

  const getCurrentAvatar = () => {
    if (avatarType === 'emoji' && selectedEmoji) {
      const Icon = selectedEmoji.icon;
      return (
        <div className={`h-24 w-24 rounded-full flex items-center justify-center ${selectedEmoji.color}`}>
          <Icon className="h-12 w-12 text-white" />
        </div>
      );
    }
    
    return (
      <Avatar className="h-24 w-24" data-testid="profile-avatar">
        <AvatarImage src={userData.avatarUrl} alt={`${formData.firstName} ${formData.lastName}`} />
        <AvatarFallback className="bg-emerald-600 text-white text-2xl">
          {formData.firstName?.[0]}{formData.lastName?.[0]}
        </AvatarFallback>
      </Avatar>
    );
  };

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
          <div className="flex items-center gap-6">
            {getCurrentAvatar()}
            <div className="space-y-2">
              <p className="text-sm text-stone-600">Current avatar type: {avatarType === 'initials' ? 'Initials' : avatarType === 'emoji' ? 'Icon' : 'Custom upload'}</p>
              <Button 
                onClick={handleUploadAvatar}
                variant="outline"
                className="gap-2"
                data-testid="upload-avatar-btn"
              >
                <Upload className="h-4 w-4" />
                Upload New Photo
              </Button>
            </div>
          </div>

          <Separator />

          {/* Outdoor-themed avatar options */}
          <div className="space-y-3">
            <Label>Or choose an outdoor icon</Label>
            <div className="grid grid-cols-6 gap-3">
              {avatarOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = avatarType === 'emoji' && selectedEmoji?.label === option.label;
                return (
                  <button
                    key={option.label}
                    onClick={() => handleSelectEmoji(option)}
                    className={`
                      ${option.color} rounded-full p-4 hover:scale-110 transition-transform
                      ${isSelected ? 'ring-4 ring-emerald-500 ring-offset-2' : ''}
                    `}
                    title={option.label}
                    data-testid={`avatar-option-${option.label.toLowerCase()}`}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </button>
                );
              })}
            </div>
          </div>
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
                {new Date(userData.memberSince).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>
          
          {isEditing && (
            <div className="flex gap-3 mt-6">
              <Button 
                onClick={handleSave}
                className="bg-emerald-600 hover:bg-emerald-700"
                data-testid="save-changes-btn"
              >
                Save Changes
              </Button>
              <Button 
                variant="outline" 
                onClick={handleCancel}
                data-testid="cancel-edit-btn"
              >
                Cancel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security */}
      <Card data-testid="security-section">
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
      </Card>
    </div>
  );
};

export default AccountDetails;