import express, { Request, Response, Router } from 'express';
import mongoose, { Schema, Document, Model, Connection } from 'mongoose';

const scrapedRoutes: Router = express.Router();

interface IProfile extends Document {
  [key: string]: any;
}

// Create a separate connection to the second database
const scrapedDbConnection: Connection = mongoose.createConnection(process.env.MONGODB_SCRAPED_URI!, {
  dbName: 'linkedin_db',
});

// Define schema and model using the new connection
const profileSchema = new Schema({}, { strict: false });
const Profile: Model<IProfile> = scrapedDbConnection.model<IProfile>('Profile', profileSchema, 'profiles');

// Route
scrapedRoutes.get('/', async (req: Request, res: Response) => {
  try {
    const profiles = await Profile.find({});
    res.status(200).json(profiles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profiles', details: error });
  }
});

export default scrapedRoutes;
