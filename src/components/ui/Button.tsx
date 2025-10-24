import React, { ButtonHTMLAttributes, ReactNode } from 'react';

/**
 * Button - Reusable button component with primary/secondary variants and custom styling
 * 
 * @param children - The content to display inside the button
 * @param variant - The visual style variant ('primary' | 'secondary')
 * @param className - Additional CSS classes
 */
export interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary';
  className?: string;
}

const Button: React.FC<ButtonProps & ButtonHTMLAttributes<HTMLButtonElement>> = ({
  children,
  variant = "primary",
  className = "",
  ...props
}) => {
  // Custom styles based on buttonstyles.txt specifications
  const baseClasses = `
    font-medium
    rounded-md
    transition-all
    duration-200
    flex
    items-center
    justify-center
    gap-2
    focus:outline-none
    border
    w-[356px]
    h-[36px]
    opacity-100
    px-[20px]
    py-[8px]
    border-[1px]
    text-white
    text-sm
    font-medium
    leading-5
    relative
    overflow-hidden
  `;

  const variants: Record<string, string> = {
    primary: `
      bg-[#2D3643]
      border-[#0E0F110F]
      shadow-[0px_2px_5px_0px_#0E0F1129]
      hover:shadow-[0px_3px_8px_0px_#0E0F1129]
      hover:bg-[#1F2937]
      active:bg-[#111827]
      focus:ring-2
      focus:ring-blue-500/20
      focus:ring-offset-2
      before:content-['']
      before:absolute
      before:inset-0
      before:bg-gradient-to-b
      before:from-white/6
      before:to-transparent
      before:opacity-0
      before:transition-opacity
      before:duration-200
      hover:before:opacity-100
      after:content-['']
      after:absolute
      after:inset-0
      after:shadow-[0px_4px_6px_0px_#FFFFFF0F_inset]
      after:pointer-events-none
    `,
    secondary: `
      bg-gray-100
      text-gray-700
      border-gray-200
      hover:bg-gray-200
      focus:ring-gray-300
    `,
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${className}`}
      style={{
        '--action-background-neutral-normal': '#2D3643',
        '--transparent-dark-6': '#0E0F110F',
      } as React.CSSProperties}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;