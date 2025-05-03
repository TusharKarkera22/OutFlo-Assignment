// frontend/app/components/MessageGenerator.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MessageGeneratorProps {
  onGenerate: (message: string) => void;
}

export default function MessageGenerator({ onGenerate }: MessageGeneratorProps) {
  const [leadName, setLeadName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [position, setPosition] = useState('');
  const [location, setLocation] = useState('');
  const [summary, setSummary] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/personalizedmessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          leadName,
          companyName,
          position,
          location,
          summary,
          customMessage,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate message');
      }

      const data = await response.json();
      setGeneratedMessage(data.message);
      setShowMessage(true);
      onGenerate(data.message);
    } catch (error) {
      console.error('Error generating message:', error);
      // Fallback to template if API fails
      const fallbackMessage = `Hey ${leadName},

I noticed you're the ${position} at ${companyName}${location ? ` in ${location}` : ''}. ${customMessage}

Outflo can help automate your outreach to increase meetings & sales. Let's connect!

Best regards,
[Your Name]`;
      setGeneratedMessage(fallbackMessage);
      setShowMessage(true);
      onGenerate(fallbackMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <motion.div
        className="rounded-2xl overflow-hidden shadow-lg"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <div className="bg-gradient-to-r from-[#0E1726] to-[#223356] px-6 py-4">
          <h2 className="text-lg font-semibold text-white flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
            Message Generator
          </h2>
        </div>
        
        <div className="bg-gradient-to-b from-[#FFFFFF] to-[#F5F7FA] p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="leadName" className="block text-sm font-medium text-gray-600 mb-1">
                Lead's Name
              </label>
              <input
                type="text"
                id="leadName"
                value={leadName}
                onChange={(e) => setLeadName(e.target.value)}
                className="w-full px-4 py-2 bg-white/70 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#223356] focus:border-transparent transition-all"
                required
                placeholder="John Smith"
              />
            </div>

            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-600 mb-1">
                Company Name
              </label>
              <input
                type="text"
                id="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-4 py-2 bg-white/70 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#223356] focus:border-transparent transition-all"
                required
                placeholder="Acme Corp"
              />
            </div>

            <div>
              <label htmlFor="position" className="block text-sm font-medium text-gray-600 mb-1">
                Position
              </label>
              <input
                type="text"
                id="position"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full px-4 py-2 bg-white/70 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#223356] focus:border-transparent transition-all"
                required
                placeholder="Marketing Director"
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-600 mb-1">
                Location
              </label>
              <input
                type="text"
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-2 bg-white/70 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#223356] focus:border-transparent transition-all"
                placeholder="San Francisco, CA"
              />
            </div>

            <div>
              <label htmlFor="summary" className="block text-sm font-medium text-gray-600 mb-1">
                Profile Summary
              </label>
              <textarea
                id="summary"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 bg-white/70 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#223356] focus:border-transparent transition-all"
                placeholder="Experienced in AI & ML..."
              />
            </div>

            <div>
              <label htmlFor="customMessage" className="block text-sm font-medium text-gray-600 mb-1">
                Custom Message
              </label>
              <textarea
                id="customMessage"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 bg-white/70 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#223356] focus:border-transparent transition-all"
                placeholder="I came across your recent article about digital marketing trends and was impressed by your insights..."
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isGenerating}
                className="px-5 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-[#0E1726] to-[#223356] text-white hover:from-[#1A2440] hover:to-[#2C3E60] transition-all shadow-md flex items-center cursor-pointer disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Generate Message
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>

      <AnimatePresence>
        {showMessage && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden"
            >
              <div className="bg-gradient-to-r from-[#0E1726] to-[#223356] px-6 py-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-white">Generated Message</h3>
                  <button
                    onClick={() => setShowMessage(false)}
                    className="text-gray-300 hover:text-white transition-colors cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="whitespace-pre-wrap text-gray-700 bg-gray-50 rounded-lg p-4 border border-gray-100 max-h-[60vh] overflow-y-auto">
                  {generatedMessage}
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedMessage);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="text-sm font-medium text-[#0E1726] hover:text-[#223356] flex items-center cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Copied!
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                          <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                        </svg>
                        Copy to clipboard
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}