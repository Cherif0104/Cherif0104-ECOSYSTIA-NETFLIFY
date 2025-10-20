import React from 'react';

interface AvatarProps {
  user?: {
    firstName?: string;
    lastName?: string;
    first_name?: string;
    last_name?: string;
    name?: string;
    email?: string;
  };
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showTooltip?: boolean;
}

const Avatar: React.FC<AvatarProps> = ({ 
  user, 
  size = 'md', 
  className = '', 
  showTooltip = false 
}) => {
  // Tailles prédéfinies
  const sizeClasses = {
    xs: 'w-4 h-4 text-xs',
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl'
  };

  // Obtenir les initiales
  const getInitials = () => {
    if (!user) return '?';
    
    const firstName = user.firstName || user.first_name || '';
    const lastName = user.lastName || user.last_name || '';
    const name = user.name || '';
    
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    
    if (name) {
      const nameParts = name.split(' ');
      if (nameParts.length >= 2) {
        return `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`.toUpperCase();
      }
      return name.charAt(0).toUpperCase();
    }
    
    if (user.email) {
      return user.email.charAt(0).toUpperCase();
    }
    
    return '?';
  };

  // Couleur de fond basée sur les initiales pour la cohérence
  const getBackgroundColor = () => {
    const initials = getInitials();
    const colors = [
      'bg-blue-500',
      'bg-green-500', 
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500',
      'bg-orange-500',
      'bg-red-500'
    ];
    
    const index = initials.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const initials = getInitials();
  const backgroundColor = getBackgroundColor();
  const sizeClass = sizeClasses[size];

  const avatarElement = (
    <div 
      className={`
        ${sizeClass} 
        ${backgroundColor} 
        text-white 
        rounded-full 
        flex 
        items-center 
        justify-center 
        font-semibold 
        shadow-sm 
        border-2 
        border-white
        ${className}
      `}
    >
      {initials}
    </div>
  );

  if (showTooltip && user) {
    const displayName = user.name || `${user.firstName || user.first_name || ''} ${user.lastName || user.last_name || ''}`.trim();
    return (
      <div className="relative group">
        {avatarElement}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
          {displayName}
        </div>
      </div>
    );
  }

  return avatarElement;
};

export default Avatar;
