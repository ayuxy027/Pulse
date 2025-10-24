import React from 'react';
import { Inbox, Mail, Clock, Star } from 'lucide-react';

/**
 * InboxPage - Inbox management page displaying messages, notifications, and communication items
 */
interface InboxPageProps {
  sidebarOpen?: boolean;
}

const InboxPage: React.FC<InboxPageProps> = ({ sidebarOpen = true }) => {
  return (
    <div className={`flex-1 flex flex-col h-screen bg-gray-50/30 transition-all duration-300 ease-in-out ${sidebarOpen ? 'ml-0' : 'ml-0'}`}>
      {/* Header */}
      <div className="px-8 pt-8 pb-6">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Inbox</h1>
        <p className="text-lg text-gray-600">Manage your messages and notifications</p>
      </div>

      {/* Inbox Content */}
      <div className="flex-1 px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Inbox size={24} className="text-gray-500" />
              <h2 className="text-xl font-semibold text-gray-900">Messages</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                <Mail size={20} className="text-blue-500" />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">Office Action Response Due</h3>
                  <p className="text-sm text-gray-600">BioTech Protein Synthesis Method - Response due in 3 days</p>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-500">2 hours ago</span>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                <Star size={20} className="text-yellow-500" />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">Patent Application Filed</h3>
                  <p className="text-sm text-gray-600">Wearable Cancer Treatment Device - Application successfully filed</p>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-500">1 day ago</span>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                <Mail size={20} className="text-green-500" />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">Prior Art Search Complete</h3>
                  <p className="text-sm text-gray-600">Quantum Computing Algorithm - Search results available</p>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-500">3 days ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InboxPage; 