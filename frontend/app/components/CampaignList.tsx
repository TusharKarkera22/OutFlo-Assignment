// frontend/app/components/CampaignList.tsx

'use client';

import { useState } from 'react';
import { Campaign } from '@/app/types';
import { motion, AnimatePresence } from 'framer-motion';

interface CampaignListProps {
  campaigns: Campaign[];
  onEdit: (campaign: Campaign) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

export default function CampaignList({ campaigns, onEdit, onDelete, onToggleStatus }: CampaignListProps) {
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter campaigns based on search term
  const filteredCampaigns = campaigns.filter(campaign => 
    campaign.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (campaign: Campaign) => {
    if (campaign._id) {
      onDelete(campaign._id);
      setConfirmDelete(null);
    }
  };

  const handleToggleStatus = (campaign: Campaign) => {
    if (campaign._id) {
      onToggleStatus(campaign._id);
    }
  };

  const handleConfirmDelete = (campaign: Campaign) => {
    if (campaign._id) {
      setConfirmDelete(campaign._id);
    }
  };
  
  return (
    <div className="overflow-hidden rounded-2xl shadow-lg">
      <div className="bg-gradient-to-r from-[#0E1726] to-[#223356] px-6 py-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h2 className="text-lg font-semibold text-white flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Campaigns
          </h2>
          
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pr-10 bg-gray-800/40 border border-gray-700/30 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <div className="absolute right-3 top-2.5 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto bg-gradient-to-b from-[#FFFFFF] to-[#F5F7FA]">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50/70">
            <tr>
              <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Name</th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Status</th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Leads</th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            <AnimatePresence>
              {filteredCampaigns.length > 0 ? (
                filteredCampaigns.map((campaign) => (
                  <motion.tr
                    key={campaign._id}
                    className="hover:bg-gray-50/80 transition-colors"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 16 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-br from-[#0E1726] to-[#223356] flex items-center justify-center text-white font-semibold">
                          {campaign.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-gray-700">{campaign.name}</div>
                          <div className="text-xs text-gray-500">{`${campaign.accountIds.length} accounts`}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 text-xs font-bold rounded-full ${
                          campaign.status === 'active'
                            ? 'bg-green-50 text-green-600'
                            : 'bg-orange-50 text-orange-600'
                        }`}
                      >
                        {campaign.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-700">{campaign.leads.length}</div>
                      <div className="text-xs text-gray-500">Total leads</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => onEdit(campaign)}
                        className="inline-flex items-center px-3 py-1.5 font-semibold text-xs rounded-md bg-gradient-to-r from-[#0E1726] to-[#223356] text-white hover:from-[#1A2440] hover:to-[#2C3E60] transition-all shadow cursor-pointer"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                        Edit
                      </button>
                      
                      {confirmDelete === campaign._id ? (
                        <div className="inline-flex rounded-md shadow-sm">
                          <button
                            onClick={() => handleDelete(campaign)}
                            className="inline-flex items-center px-2 py-1.5 text-xs font-semibold rounded-l-md bg-red-600 text-white hover:bg-red-700 transition-colors cursor-pointer"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setConfirmDelete(null)}
                            className="inline-flex items-center px-2 py-1.5 text-xs font-semibold rounded-r-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleConfirmDelete(campaign)}
                          className="inline-flex items-center px-3 py-1.5 font-semibold text-xs rounded-md bg-white text-red-600 border border-red-200 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          Delete
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleToggleStatus(campaign)}
                        className={`inline-flex items-center px-3 py-1.5 font-semibold text-xs rounded-md transition-colors cursor-pointer ${
                          campaign.status === 'active'
                            ? 'bg-gradient-to-r from-[#f8f9fa] to-[#e9ecef] text-gray-700 border border-gray-200 hover:bg-gray-50'
                            : 'bg-gradient-to-r from-[#0E1726] to-[#223356] text-white hover:from-[#1A2440] hover:to-[#2C3E60]'
                        }`}
                      >
                        {campaign.status === 'active' ? (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                            </svg>
                            Deactivate
                          </>
                        ) : (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Activate
                          </>
                        )}
                      </button>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      {searchTerm ? (
                        <div>
                          <p className="text-lg font-medium mb-1">No campaigns found</p>
                          <p className="text-sm">No campaigns match "{searchTerm}"</p>
                          <button 
                            onClick={() => setSearchTerm('')}
                            className="mt-3 px-4 py-2 text-sm font-medium rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                          >
                            Clear search
                          </button>
                        </div>
                      ) : (
                        <div>
                          <p className="text-lg font-medium mb-1">No campaigns yet</p>
                          <p className="text-sm">Create your first campaign to get started</p>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}