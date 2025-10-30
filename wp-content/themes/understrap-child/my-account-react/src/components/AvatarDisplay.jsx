import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

/**
 * Reusable avatar display component that handles different avatar types
 * @param {string} avatarType - Type of avatar: 'initials', 'emoji', or 'upload'
 * @param {object} selectedEmoji - Selected emoji object with icon, label, and color
 * @param {string} uploadedAvatarUrl - URL of uploaded avatar image
 * @param {object} userData - User data containing firstName, lastName, avatarUrl
 * @param {string} size - Size class for avatar (e.g., 'h-24 w-24', 'h-16 w-16')
 * @param {string} textSize - Text size for fallback initials (e.g., 'text-2xl', 'text-lg')
 */
const AvatarDisplay = ({
  avatarType = 'initials',
  selectedEmoji = null,
  uploadedAvatarUrl = null,
  userData = {},
  size = 'h-16 w-16',
  textSize = 'text-lg',
  loading = false,
}) => {
  // Emoji avatar
  if (avatarType === 'emoji' && selectedEmoji) {
    const Icon = selectedEmoji.icon;
    return (
      <div className={`${size} rounded-full flex items-center justify-center ${selectedEmoji.color}`}>
        <Icon className={`${size === 'h-24 w-24' ? 'h-12 w-12' : size === 'h-16 w-16' ? 'h-8 w-8' : 'h-6 w-6'} text-white`} />
      </div>
    );
  }

  // Uploaded custom avatar
  if (avatarType === 'upload' && uploadedAvatarUrl) {
    return (
      <Avatar className={size}>
        <AvatarImage src={uploadedAvatarUrl} alt={userData.displayName || 'User'} />
        <AvatarFallback className={`bg-emerald-600 text-white ${textSize}`}>
          {userData.firstName?.[0]}{userData.lastName?.[0]}
        </AvatarFallback>
      </Avatar>
    );
  }

  // Default: Only show Gravatar if not loading and truly using initials type
  // This prevents flicker while loading custom avatar preferences
  return (
    <Avatar className={size}>
      {!loading && <AvatarImage src={userData.avatarUrl} alt={userData.displayName || 'User'} />}
      <AvatarFallback className={`bg-samsara-gold text-samsara-black ${textSize}`}>
        {userData.firstName?.[0]}{userData.lastName?.[0]}
      </AvatarFallback>
    </Avatar>
  );
};

export default AvatarDisplay;
