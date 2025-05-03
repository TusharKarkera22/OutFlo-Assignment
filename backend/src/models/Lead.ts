// src/models/Lead.ts
import mongoose, { Document, Schema } from 'mongoose';

// Define the Lead interface
export interface ILead extends Document {
  fullName: string;
  jobTitle: string;
  companyName: string;
  location: string;
  profileUrl: string;
  searchQuery: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Create the Lead schema
const leadSchema = new Schema<ILead>({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  jobTitle: {
    type: String,
    trim: true
  },
  companyName: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  profileUrl: {
    type: String,
    trim: true,
    unique: true
  },
  searchQuery: {
    type: String,
    trim: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Soft delete middleware
leadSchema.pre('find', function() {
  this.where({ isDeleted: false });
});

leadSchema.pre('findOne', function() {
  this.where({ isDeleted: false });
});

// Export the Lead model
const Lead = mongoose.model<ILead>('Lead', leadSchema);
export default Lead;