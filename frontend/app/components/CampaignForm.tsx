// frontend/app/components/CampaignForm.tsx

'use client';

import { useState, useEffect } from 'react';
import { Campaign } from '@/app/types';
import { motion, AnimatePresence } from 'framer-motion';

interface CampaignFormProps {
  campaign?: Campaign;
  onSave: (campaign: Omit<Campaign, 'createdAt' | 'updatedAt'>) => void;
  onClose: () => void;
}

export default function CampaignForm({ campaign, onSave, onClose }: CampaignFormProps) {
  const [name, setName] = useState('');
  const [leads, setLeads] = useState('');
  const [accountIds, setAccountIds] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (campaign) {
      setName(campaign.name);
      setLeads(campaign.leads.join('\n'));
      setAccountIds(campaign.accountIds.join('\n'));
    }
  }, [campaign]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Simulate brief loading
    setTimeout(() => {
      onSave({
        _id: campaign?._id,
        name,
        status: campaign?.status || 'active',
        leads: leads.split('\n').filter(lead => lead.trim()),
        accountIds: accountIds.split('\n').filter(id => id.trim()),
      });
      setIsSaving(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 bg-gray-900/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <AnimatePresence>
        <motion.div
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          <div className="bg-gradient-to-r from-[#0E1726] to-[#223356] px-6 py-4 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">
                {campaign ? 'Edit Campaign' : 'Create New Campaign'}
              </h3>
              <button 
                onClick={onClose}
                className="text-gray-300 hover:text-white transition-colors cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-gradient-to-b from-[#FFFFFF] to-[#F5F7FA] p-6 space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-600 mb-1">
                Campaign Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 bg-white/70 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#223356] focus:border-transparent transition-all"
                required
                placeholder="Summer Sales 2025"
              />
            </div>

            <div>
              <label htmlFor="leads" className="block text-sm font-medium text-gray-600 mb-1">
                Leads (one per line)
              </label>
              <textarea
                id="leads"
                value={leads}
                onChange={(e) => setLeads(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 bg-white/70 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#223356] focus:border-transparent transition-all"
                placeholder="john.doe@example.com
mary.smith@company.com
robert.jones@organization.org"
              />
              <p className="mt-1 text-xs text-gray-500">Each line will be treated as a separate lead</p>
            </div>

            <div>
              <label htmlFor="accountIds" className="block text-sm font-medium text-gray-600 mb-1">
                Account IDs (one per line)
              </label>
              <textarea
                id="accountIds"
                value={accountIds}
                onChange={(e) => setAccountIds(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 bg-white/70 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#223356] focus:border-transparent transition-all"
                placeholder="ACC-12345
ACC-67890
ACC-24680"
              />
              <p className="mt-1 text-xs text-gray-500">Each line will be treated as a separate account ID</p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-[#f8f9fa] to-[#e9ecef] text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-[#0E1726] to-[#223356] text-white hover:from-[#1A2440] hover:to-[#2C3E60] shadow-md transition-all flex items-center cursor-pointer disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Save Campaign
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}