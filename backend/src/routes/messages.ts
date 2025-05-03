// backend/routes/personalizedMessage.ts
import { Router } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();

// Validate API key
if (!process.env.GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY is not set in environment variables');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/', async (req, res) => {
  try {
    const { leadName, companyName, position, customMessage, location, summary } = req.body;

    // Validate required fields
    if (!leadName || !companyName || !position) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Use the correct model name
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // Create a more comprehensive prompt with location and summary
    const prompt = `Generate a concise and professional LinkedIn outreach message for ${leadName}, who is the ${position} at ${companyName}${location ? ` in ${location}` : ''}.
    
    ${summary ? `Include relevant information from their profile summary: "${summary}"` : ''}
    ${customMessage ? `Also incorporate this custom context: "${customMessage}"` : ''}
    
    The message format should be similar to:
    "Hey [Name], I see you are working as a [Position] at [Company]. Outflo can help automate your outreach to increase meetings & sales. Let's connect!"
    
    Keep the message brief (2-3 short paragraphs max), personalized, and value-focused.
    The tone should be professional but conversational.
    Avoid generic phrases and focus on specific value propositions based on their role and company.
    Do not include any placeholders like [Your Name].`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Add logging for successful message generation
    console.log(`Successfully generated message for ${leadName} at ${companyName}`);

    res.json({ message: text });
  } catch (error: any) {
    console.error('Error generating message:', error);
    
    // Enhanced error handling
    const statusCode = error.status || 500;
    const errorMessage = error.message || 'Unknown error occurred';
    
    res.status(statusCode).json({ 
      message: 'Error generating personalized message',
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

export default router;