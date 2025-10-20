import React from 'react';
import Avatar from './Avatar';

interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  email?: string;
}

interface AvatarGroupProps {
  users: User[];
  maxVisible?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showTooltip?: boolean;
}

const AvatarGroup: React.FC<AvatarGroupProps> = ({
  users,
  maxVisible = 3,
  size = 'md',
  className = '',
  showTooltip = false
}) => {
  const visibleUsers = users.slice(0, maxVisible);
  const remainingCount = users.length - maxVisible;

  return (
    <div className={`flex -space-x-2 ${className}`}>
      {visibleUsers.map((user, index) => (
        <div key={user.id} className="relative">
          <Avatar
            user={user}
            size={size}
            showTooltip={showTooltip}
            className="border-2 border-white shadow-sm"
          />
        </div>
      ))}
      
      {remainingCount > 0 && (
        <div 
          className={`
            ${size === 'xs' ? 'w-4 h-4' : 
              size === 'sm' ? 'w-6 h-6' :
              size === 'md' ? 'w-8 h-8' :
              size === 'lg' ? 'w-12 h-12' :
              'w-16 h-16'
            } 
            bg-gray-300 
            text-gray-600 
            rounded-full 
            flex 
            items-center 
            justify-center 
            font-semibold 
            border-2 
            border-white 
            shadow-sm
            ${size === 'xs' ? 'text-xs' : 
              size === 'sm' ? 'text-xs' :
              size === 'md' ? 'text-sm' :
              size === 'lg' ? 'text-lg' :
              'text-xl'
            }
          `}
          title={`+${remainingCount} autres`}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
};

export default AvatarGroup;
