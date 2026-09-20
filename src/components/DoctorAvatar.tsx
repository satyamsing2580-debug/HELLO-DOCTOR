import React from 'react';

interface Props {
  emoji?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const DoctorAvatar: React.FC<Props> = ({
  emoji = '👨‍⚕️',
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-10 h-10 text-xl rounded-xl',
    md: 'w-14 h-14 text-3xl rounded-2xl',
    lg: 'w-16 h-16 text-3xl rounded-2xl',
    xl: 'w-20 h-20 text-4xl rounded-3xl'
  };

  return (
    <div
      className={`bg-gradient-to-br from-sky-50 via-teal-50/50 to-indigo-50/60 border border-sky-100/90 flex items-center justify-center shrink-0 shadow-xs select-none ${sizeClasses[size]} ${className}`}
      aria-label="Doctor Emoji Avatar"
    >
      <span className="transform hover:scale-110 transition-transform duration-150">
        {emoji}
      </span>
    </div>
  );
};
