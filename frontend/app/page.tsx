'use client';

import { useState, useEffect } from 'react';
import CampaignList from './components/CampaignList';
import CampaignForm from './components/CampaignForm';
import MessageGenerator from './components/MessageGenerator';
import { Campaign } from '@/app/types';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import ProfileList from './components/ProfileList';

export default function Home() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | undefined>();
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/campaigns`);
        if (!response.ok) throw new Error('Failed to fetch campaigns');
        const data = await response.json();
        setCampaigns(data);
      } catch (error) {
        console.error('Error fetching campaigns:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  const handleSaveCampaign = async (campaignData: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const url = editingCampaign 
        ? `${process.env.NEXT_PUBLIC_API_URL}/campaigns/${editingCampaign._id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/campaigns`;

      const response = await fetch(url, {
        method: editingCampaign ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(campaignData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save campaign');
      }

      const updatedCampaigns = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/campaigns`).then(res => res.json());
      setCampaigns(updatedCampaigns);
      setShowForm(false);
      setEditingCampaign(undefined);
      toast.success(editingCampaign ? 'Campaign updated successfully!' : 'Campaign created successfully!');
    } catch (error) {
      console.error('Error saving campaign:', error);
      toast.error(error instanceof Error ? error.message : 'Error saving campaign');
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/campaigns/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete campaign');

      setCampaigns(campaigns.filter(campaign => campaign._id !== id));
      toast.success('Campaign deleted successfully!');
    } catch (error) {
      console.error('Error deleting campaign:', error);
      toast.error('Error deleting campaign');
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const campaign = campaigns.find(c => c._id === id);
      if (!campaign) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/campaigns/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: campaign.status === 'active' ? 'inactive' : 'active',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update campaign status');
      }

      setCampaigns(campaigns.map(c => 
        c._id === id 
          ? { ...c, status: c.status === 'active' ? 'inactive' : 'active' }
          : c
      ));
    } catch (error) {
      console.error('Error toggling campaign status:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update campaign status');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin h-16 w-16 rounded-full border-4 border-transparent border-t-[#0E1726] border-l-[#0E1726]"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading campaigns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0E1726] to-[#223356] shadow-lg">
            <div className="absolute inset-0 opacity-10">
              <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <pattern id="grid" width="8" height="8" patternUnits="userSpaceOnUse">
                    <path d="M 8 0 L 0 0 0 8" fill="none" stroke="white" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>
            <div className="relative px-8 py-10 md:py-12 flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Campaign Management</h1>
                <p className="text-blue-100/80 max-w-lg">
                  Easily create, manage, and track your marketing campaigns in one place
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setEditingCampaign(undefined);
                  setShowForm(true);
                }}
                className="mt-4 md:mt-0 px-6 py-3 text-sm font-semibold rounded-lg bg-white text-[#0E1726] hover:bg-blue-50 shadow-md transition-all flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Create Campaign
              </motion.button>
            </div>
          </div>
        </div>

        {/* Dashboard Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6 flex items-center border border-gray-100">
            <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#0E1726]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Campaigns</p>
              <h3 className="text-2xl font-bold text-gray-800">{campaigns.length}</h3>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-6 flex items-center border border-gray-100">
            <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium">Active Campaigns</p>
              <h3 className="text-2xl font-bold text-gray-800">{campaigns.filter(c => c.status === 'active').length}</h3>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-6 flex items-center border border-gray-100">
            <div className="h-12 w-12 rounded-full bg-amber-50 flex items-center justify-center mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Leads</p>
              <h3 className="text-2xl font-bold text-gray-800">
                {campaigns.reduce((total, campaign) => total + campaign.leads.length, 0)}
              </h3>
            </div>
          </div>
        </div>

        {/* Main Content - Reorganized Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Campaign List and Profile List stacked */}
          <div className="lg:col-span-2 space-y-8">
            {/* Campaign List */}
            <div>
              <CampaignList
                campaigns={campaigns}
                onEdit={(campaign) => {
                  setEditingCampaign(campaign);
                  setShowForm(true);
                }}
                onDelete={handleDeleteCampaign}
                onToggleStatus={handleToggleStatus}
              />
            </div>
            
            {/* Profile List */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">LinkedIn Profiles</h2>
              <ProfileList />
            </div>
          </div>
          
          {/* Right Column: Message Generator */}
          <div className="space-y-6">
            <MessageGenerator onGenerate={setGeneratedMessage} />
            
            <AnimatePresence>
              {generatedMessage && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="rounded-2xl bg-white shadow-lg overflow-hidden border border-gray-100"
                >
                  <div className="px-6 py-4 bg-gradient-to-r from-[#0E1726] to-[#223356]">
                    <h2 className="text-lg font-semibold text-white flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                        <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                      </svg>
                      Generated Message
                    </h2>
                  </div>
                  <div className="p-6">
                    <div className="whitespace-pre-wrap text-gray-700 bg-gray-50 rounded-lg p-4 border border-gray-100 text-sm">
                      {generatedMessage}
                    </div>
                    <div className="mt-4 flex justify-end">
                      <button 
                        onClick={() => navigator.clipboard.writeText(generatedMessage)}
                        className="text-sm font-medium text-[#0E1726] hover:text-[#223356] flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                          <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                        </svg>
                        Copy to clipboard
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Campaign Form Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900 bg-opacity-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-3xl"
            >
              <CampaignForm
                campaign={editingCampaign}
                onSave={handleSaveCampaign}
                onClose={() => {
                  setShowForm(false);
                  setEditingCampaign(undefined);
                }}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}