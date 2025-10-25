import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Utensils, LucideIcon } from 'lucide-react';
import { LuBookText } from 'react-icons/lu';
import { TbZoomScan, TbCookieMan } from 'react-icons/tb';
import logo from '../../assets/logo.png';
import { useSession } from '@supabase/auth-helpers-react';
import Button from '../ui/Button';
import Avatar from '../ui/Avatar';

/**
 * NavItem - Individual navigation item component for navbar
 */
interface NavItemProps {
    icon: LucideIcon | React.ComponentType<{ size?: number; className?: string }>;
    label: string;
    isActive?: boolean;
    onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({
    icon: Icon,
    label,
    isActive = false,
    onClick
}) => (
    <button
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200 ${isActive
            ? 'bg-gray-100 text-gray-900'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
        onClick={onClick}
    >
        <Icon
            size={18}
            className={`transition-colors duration-200 ease-out flex-shrink-0 ${isActive ? 'text-gray-700' : 'text-gray-500'
                }`}
        />
        <span className="text-sm font-medium whitespace-nowrap">{label}</span>
    </button>
);

/**
 * Navbar - Main navigation bar for landing page
 */
const Navbar: React.FC = () => {
    const navigate = useNavigate();
    const session = useSession();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleNavigation = (path: string) => {
        navigate(path);
        setIsMenuOpen(false);
    };

    return (
        <div className="w-full bg-[#f8f6f1] border-b border-gray-200 shadow-sm">
            <div className="flex justify-center py-3 px-4">
                <div className="flex items-center justify-between px-4 py-2 w-full max-w-[1200px] h-[70px]">
                    {/* Logo */}
                    <div className="flex items-center space-x-3">
                        <img
                            src={logo}
                            alt="Pulse Logo"
                            className="w-8 h-8 flex-shrink-0"
                        />
                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            className="text-xl font-semibold text-gray-900 hover:text-gray-700 transition-colors duration-200"
                        >
                            Pulse.ai
                        </button>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-2">
                        <NavItem icon={Home} label="Dashboard" onClick={() => handleNavigation('/dashboard')} />
                        <NavItem icon={TbZoomScan} label="Food Scanner" onClick={() => handleNavigation('/scanner')} />
                        <NavItem icon={Utensils} label="Diet" onClick={() => handleNavigation('/diet')} />
                        <NavItem icon={LuBookText} label="Dairy" onClick={() => handleNavigation('/dairy')} />
                        <NavItem icon={TbCookieMan} label="Coach" onClick={() => handleNavigation('/chats')} />
                    </div>

                    {/* Auth / CTA Section */}
                    <div className="flex items-center gap-4">
                        {session ? (
                            <button onClick={() => navigate('/profile')}>
                                <Avatar
                                    src={session.user.user_metadata.avatar_url}
                                    alt="User Avatar"
                                />
                            </button>
                        ) : (
                            <Button
                                onClick={() => navigate('/login')}
                                className="hidden md:block !w-auto !h-auto !px-4 !py-2 text-sm"
                            >
                                Sign In
                            </Button>
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            className="md:hidden text-gray-700 focus:outline-none"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {isMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
                    <div className="px-6 py-4 space-y-3">
                        <NavItem icon={Home} label="Dashboard" onClick={() => handleNavigation('/dashboard')} />
                        <NavItem icon={TbZoomScan} label="Food Scanner" onClick={() => handleNavigation('/scanner')} />
                        <NavItem icon={Utensils} label="Diet" onClick={() => handleNavigation('/diet')} />
                        <NavItem icon={LuBookText} label="Dairy" onClick={() => handleNavigation('/dairy')} />
                        <NavItem icon={TbCookieMan} label="Coach" onClick={() => handleNavigation('/chats')} />

                        {session ? (
                            <Button
                                variant="primary"
                                className="w-full !h-auto px-6 py-3 rounded-xl font-semibold mt-4"
                                onClick={() => handleNavigation('/profile')}
                            >
                                Profile
                            </Button>
                        ) : (
                            <Button
                                variant="primary"
                                className="w-full !h-auto px-6 py-3 rounded-xl font-semibold mt-4"
                                onClick={() => handleNavigation('/login')}
                            >
                                Sign In
                            </Button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Navbar;
