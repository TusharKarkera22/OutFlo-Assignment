import mongoose from 'mongoose';

const campaignSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  leads: [{
    type: String,
    trim: true
  }],
  accountIds: [{
    type: String,
    trim: true
  }],
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Soft delete middleware
campaignSchema.pre('find', function() {
  this.where({ isDeleted: false });
});

campaignSchema.pre('findOne', function() {
  this.where({ isDeleted: false });
});

export default mongoose.model('Campaign', campaignSchema); 