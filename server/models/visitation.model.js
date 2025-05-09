const mongoose = require('mongoose');

const visitationSchema = new mongoose.Schema({
  homeName: {
    type: String,
    required: [true, "Children's home name is required"],
    trim: true
  },
  visitDate: {
    type: Date,
    required: [true, "Visit date is required"],
    min: [Date.now, "Visit date must be in the future"]
  },
  numberOfChildren: {
    type: Number,
    required: [true, "Number of children is required"],
    min: [0, "Number of children cannot be negative"]
  },
  status: {
    type: String,
    enum: ['planned', 'in-progress', 'completed', 'cancelled'],
    default: 'planned'
  },
  notes: String,
  budget: {
    transportation: { type: Number, default: 0 },
    food: { type: Number, default: 0 },
    supplies: { type: Number, default: 0 },
    gifts: { type: Number, default: 0 },
    other: { type: Number, default: 0 }
  },
  images: [{
    public_id: String,
    url: String
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate total budget
visitationSchema.virtual('totalBudget').get(function() {
  return this.budget.transportation + this.budget.food + this.budget.supplies + 
         this.budget.gifts + this.budget.other;
});

module.exports = mongoose.model('Visitation', visitationSchema);