import React from 'react';

const ProfileImage = ({ user, size = 40, className = '' }) => {
  // Use profileImageUrl from your schema
  const imageUrl = user?.profileImageUrl || 
                 `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || '')}&background=random`;

  return (
    <div 
      className={`rounded-full overflow-hidden ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src={imageUrl}
        alt={user?.name}
        className="w-full h-full object-cover"
        onError={(e) => {
          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || '')}&background=random`;
        }}
      />
    </div>
  );
};

export default ProfileImage;