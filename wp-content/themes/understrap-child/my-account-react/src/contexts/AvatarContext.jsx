import React, { createContext, useContext, useState, useEffect } from 'react';
import { avatarApi } from '../services/woocommerce';
import { Mountain, TreePine, Tent, Compass, Flag, Target, Zap, Wind, Sun, Waves, Snowflake } from 'lucide-react';

// Avatar options mapping
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

const AvatarContext = createContext();

export const AvatarProvider = ({ children }) => {
  const [avatarType, setAvatarType] = useState('initials');
  const [selectedEmoji, setSelectedEmoji] = useState(null);
  const [uploadedAvatarUrl, setUploadedAvatarUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load avatar preferences on mount
  useEffect(() => {
    loadAvatarPreferences();
  }, []);

  const loadAvatarPreferences = async () => {
    setLoading(true);
    try {
      const response = await avatarApi.getPreferences();
      if (response.success && response.preferences) {
        const prefs = response.preferences;
        setAvatarType(prefs.avatarType || 'initials');

        if (prefs.avatarType === 'emoji' && prefs.avatarEmoji) {
          const matchedEmoji = avatarOptions.find(opt => opt.label === prefs.avatarEmoji.label);
          if (matchedEmoji) {
            setSelectedEmoji(matchedEmoji);
          }
        } else {
          setSelectedEmoji(null);
        }

        if (prefs.avatarType === 'upload' && prefs.avatarUrl) {
          setUploadedAvatarUrl(prefs.avatarUrl);
        } else {
          setUploadedAvatarUrl(null);
        }
      }
    } catch (error) {
      console.error('Failed to load avatar preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update avatar state (called from AccountDetails when user changes avatar)
  const updateAvatar = (type, emoji = null, url = null) => {
    setAvatarType(type);
    setSelectedEmoji(emoji);
    setUploadedAvatarUrl(url);
  };

  const value = {
    avatarType,
    selectedEmoji,
    uploadedAvatarUrl,
    loading,
    avatarOptions,
    updateAvatar,
    refetchAvatar: loadAvatarPreferences,
  };

  return (
    <AvatarContext.Provider value={value}>
      {children}
    </AvatarContext.Provider>
  );
};

export const useAvatar = () => {
  const context = useContext(AvatarContext);
  if (!context) {
    throw new Error('useAvatar must be used within an AvatarProvider');
  }
  return context;
};
