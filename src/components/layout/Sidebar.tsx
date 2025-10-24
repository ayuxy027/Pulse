import React, { ReactNode, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Plus,
    Search,
    Home,
    Inbox,
    FolderOpen,
    MessageCircle,
    Command,
    ChevronDown,
    LucideIcon,
    PlusCircle,
    PanelLeftClose,
    PanelLeft
} from 'lucide-react';
import Avatar from '../ui/Avatar';
import avatar from '../../assets/Icon/Avatar.svg';
import knowliaLogo from '../../assets/Icon/KnowliaLogo.svg';
import { fetchChatConversations, ChatConversation } from '../../services/mockDataService';

/**
 * NavItem - Individual navigation item component for sidebar with active states and shortcuts
 */
interface NavItemProps {
    icon: LucideIcon;
    label: string;
    isActive?: boolean;
    badge?: ReactNode;
    shortcut?: string | null;
    isCollapsed?: boolean;
    onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({
    icon: Icon,
    label,
    isActive = false,
    badge = null,
    shortcut = null,
    isCollapsed = false,
    onClick
}) => (
    <div
        className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors duration-200 group ${isActive
            ? 'bg-gray-100 text-gray-900'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            } ${isCollapsed ? 'justify-center' : ''}`}
        title={isCollapsed ? label : undefined}
        onClick={onClick}
    >
        <Icon
            size={18}
            className={`transition-colors duration-200 ease-out flex-shrink-0 ${isActive ? 'text-gray-700' : 'text-gray-500 group-hover:text-gray-700'
                }`}
        />

        <div className={`flex items-center flex-1 gap-2 overflow-hidden transition-all duration-200 ease-out ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'
            }`}>
            <span className="text-sm font-medium whitespace-nowrap">{label}</span>

            {shortcut && (
                <div className="flex items-center gap-1 text-xs text-gray-400 ml-auto">
                    <Command size={10} />
                    <span>{shortcut}</span>
                </div>
            )}

            {badge && (
                <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium whitespace-nowrap">
                    {badge}
                </span>
            )}
        </div>
    </div>
);

/**
 * RecentItem - Recent conversation/item component for sidebar with truncation
 */
interface RecentItemProps {
    conversation: ChatConversation;
    isActive?: boolean;
    isCollapsed?: boolean;
    onClick?: () => void;
}

const RecentItem: React.FC<RecentItemProps> = ({ conversation, isActive = false, isCollapsed = false, onClick }) => (
    <div
        className={`px-3 py-2 text-sm cursor-pointer rounded-md transition-colors duration-200 group ${isActive
            ? 'bg-gray-100 text-gray-900'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
        title={isCollapsed ? conversation.title : undefined}
        onClick={onClick}
    >
        <div className={`overflow-hidden transition-all duration-200 ease-out ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'
            }`}>
            <div className="truncate font-medium">{conversation.title}</div>
        </div>
    </div>
);

/**
 * UserProfile - User profile component for sidebar bottom with avatar and role display
 */
interface UserProfileProps {
    name: string;
    role: string;
    avatar?: string;
    isCollapsed?: boolean;
}

const UserProfile: React.FC<UserProfileProps> = ({ name, role, avatar, isCollapsed = false }) => (
    <div className={`flex items-center gap-1 p-5 border-t border-gray-100 bg-gray-50/50 hover:bg-gray-100/50 transition-colors duration-200 cursor-pointer group ${isCollapsed ? 'justify-center px-2' : ''
        }`}>
        <Avatar src={avatar} alt={name} size="w-9 h-9" />

        <div className={`flex-1 min-w-0 overflow-hidden transition-all duration-200 ease-out ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'
            }`}>
            <p className="text-sm ml-2 font-semibold text-gray-900 truncate group-hover:text-gray-800 transition-colors duration-200">
                {name}
            </p>
            <p className="text-xs ml-2 text-gray-500 truncate">{role}</p>
        </div>

        <ChevronDown
            size={16}
            className={`text-gray-400 group-hover:text-gray-600 transition-opacity duration-200 flex-shrink-0 ${isCollapsed ? 'opacity-0' : 'opacity-100'
                }`}
        />
    </div>
);

/**
 * Sidebar - Main navigation sidebar with collapsible design, navigation items, recent items, and user profile
 */
interface SidebarProps {
    isOpen?: boolean;
    onToggle?: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [conversations, setConversations] = useState<ChatConversation[]>([]);
    const [loading, setLoading] = useState(true);

    // Get current view from URL path
    const getCurrentView = () => {
        const path = location.pathname;
        if (path === '/') return 'home';
        if (path === '/chats') return 'chats';
        if (path === '/cases') return 'cases';
        if (path === '/inbox') return 'inbox';
        return 'home';
    };

    const currentView = getCurrentView();

    // Initialize sidebar state from localStorage or default to true
    const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
        if (typeof window !== 'undefined' && window.localStorage) {
            try {
                const saved = localStorage.getItem('sidebar-open');
                return saved !== null ? JSON.parse(saved) : (isOpen ?? true);
            } catch (error) {
                console.warn('Failed to read sidebar state from localStorage:', error);
                return isOpen ?? true;
            }
        }
        return isOpen ?? true;
    });

    // Fetch chat conversations from Supabase
    useEffect(() => {
        const loadConversations = async () => {
            try {
                setLoading(true);
                const fetchedConversations = await fetchChatConversations();
                setConversations(fetchedConversations);
            } catch (error) {
                console.error('Error loading conversations:', error);
            } finally {
                setLoading(false);
            }
        };

        loadConversations();
    }, []);

    // Update localStorage whenever sidebar state changes
    useEffect(() => {
        if (typeof window !== 'undefined' && window.localStorage) {
            try {
                localStorage.setItem('sidebar-open', JSON.stringify(isSidebarOpen));
            } catch (error) {
                console.warn('Failed to save sidebar state to localStorage:', error);
            }
        }
    }, [isSidebarOpen]);

    // Sync with external prop changes
    useEffect(() => {
        if (isOpen !== undefined && isOpen !== isSidebarOpen) {
            setIsSidebarOpen(isOpen);
        }
    }, [isOpen, isSidebarOpen]);

    const handleToggle = () => {
        const newState = !isSidebarOpen;
        setIsSidebarOpen(newState);
        onToggle?.(newState);
    };

    const handleConversationClick = () => {
        navigate('/chats');
    };

    return (
        <div
            className={`overflow-hidden flex flex-col bg-white border-r border-gray-200 shadow-sm transition-all duration-300 ease-out ${isSidebarOpen ? 'w-[226px]' : 'w-[64px]'
                }`}
            style={{
                height: '100vh',
                gap: 8
            }}
        >
            {/* Header */}
            <div className="p-4 border-b border-gray-100">
                <div className={`flex items-center ${isSidebarOpen ? 'justify-between' : 'justify-center'
                    }`}>
                    {/* Logo and Brand */}
                    <div className={`flex items-center gap-3 overflow-hidden transition-opacity duration-200 ease-out ${isSidebarOpen ? 'opacity-100' : 'opacity-0'
                        }`}>
                        <img
                            src={knowliaLogo}
                            alt="Knowlia Logo"
                            className="w-8 h-8 flex-shrink-0"
                        />
                        <button
                            type="button"
                            onClick={() => {
                                window.location.href = "/";
                            }}
                            style={{
                                fontFamily: 'Inter, sans-serif',
                                fontWeight: 500,
                                fontStyle: 'normal',
                                fontSize: 16,
                                lineHeight: '24px',
                                letterSpacing: '-0.3px',
                                color: '#0A0C11',
                                border: 'none',
                                borderRadius: 4,
                                padding: '0 8px',
                                cursor: 'pointer',
                                transition: 'all 200ms ease-out',
                                outline: 'none',
                                boxShadow: 'none',
                                display: 'inline-block',
                                height: 32,
                                background: 'transparent',
                            }}
                            className="hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-opacity-50"
                        >
                            Knowlia
                        </button>
                    </div>

                    {/* Toggle Button */}
                    <button
                        type="button"
                        className="p-1 rounded-md hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-opacity-50 flex-shrink-0"
                        onClick={handleToggle}
                        title={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
                    >
                        {isSidebarOpen ? (
                            <PanelLeftClose size={20} className="text-gray-500 hover:text-gray-700 transition-colors duration-200" />
                        ) : (
                            <PanelLeft size={20} className="text-gray-500 hover:text-gray-700 transition-colors duration-200" />
                        )}
                    </button>
                </div>
            </div>

            {/* Navigation and Recent Section */}
            <div className="flex-1 overflow-hidden">
                <div className={`h-full transition-opacity duration-200 ease-out ${isSidebarOpen ? 'opacity-100' : 'opacity-0'
                    }`}>
                    <div className="p-3 space-y-1">
                        <NavItem
                            icon={PlusCircle}
                            label="New chat"
                            isCollapsed={!isSidebarOpen}
                            onClick={() => navigate('/chats')}
                        />
                        <NavItem
                            icon={Search}
                            label="Search"
                            shortcut="K"
                            isCollapsed={!isSidebarOpen}
                        />
                        <NavItem
                            icon={Home}
                            label="Home"
                            isActive={currentView === 'home'}
                            isCollapsed={!isSidebarOpen}
                            onClick={() => navigate('/')}
                        />
                        <NavItem
                            icon={Inbox}
                            label="Inbox"
                            isActive={currentView === 'inbox'}
                            isCollapsed={!isSidebarOpen}
                            onClick={() => navigate('/inbox')}
                        />
                        <NavItem
                            icon={FolderOpen}
                            label="Cases"
                            isActive={currentView === 'cases'}
                            isCollapsed={!isSidebarOpen}
                            onClick={() => navigate('/cases')}
                        />
                        <NavItem
                            icon={MessageCircle}
                            label="Chats"
                            isActive={currentView === 'chats'}
                            isCollapsed={!isSidebarOpen}
                            onClick={() => navigate('/chats')}
                        />
                    </div>

                    {/* Recent Section */}
                    <div className="px-3 py-2 mt-4">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-1">
                                Recent
                            </h3>
                            <Plus
                                size={14}
                                className="text-gray-400 cursor-pointer hover:text-gray-600 transition-colors duration-200"
                            />
                        </div>
                        <div className="space-y-1">
                            {loading ? (
                                <div className="px-3 py-2 text-sm text-gray-500">Loading...</div>
                            ) : conversations.length > 0 ? (
                                conversations.slice(0, 3).map((conversation) => (
                                    <RecentItem
                                        key={conversation.id}
                                        conversation={conversation}
                                        isCollapsed={!isSidebarOpen}
                                        onClick={() => handleConversationClick()}
                                    />
                                ))
                            ) : (
                                <div className="px-3 py-2 text-sm text-gray-500">No recent conversations</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* User Profile */}
            <div className="transition-opacity duration-200 ease-out">
                <UserProfile
                    name="Toni Nijm"
                    role="Patent attorney"
                    avatar={avatar}
                    isCollapsed={!isSidebarOpen}
                />
            </div>
        </div>
    );
};

export default Sidebar;