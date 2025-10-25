import React from 'react';

/**
 * Avatar - User profile picture component with fallback to initials when no image provided
 * 
 * @param src - URL of the avatar image
 * @param alt - Alt text for the image or initials to display
 * @param size - CSS classes for sizing (e.g., "w-8 h-8")
 */
export interface AvatarProps {
    src?: string;
    alt?: string;
    size?: string;
}

const Avatar: React.FC<AvatarProps> = ({
    src,
    alt,
    size = "w-8 h-8"
}) => (
    <div className={`${size} rounded-full overflow-hidden bg-linear-to-br from-blue-500 to-blue-600 flex-shrink-0 ring-2 ring-white shadow-sm`}>
        {src ? (
            <img src={src} alt={alt} className="w-full h-full object-cover" />
        ) : (
            <div className="w-full h-full flex items-center justify-center text-white text-sm font-semibold">
                {alt?.charAt(0).toUpperCase() || 'TN'}
            </div>
        )}
    </div>
);

export default Avatar; 