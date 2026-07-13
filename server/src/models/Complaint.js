const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  category: { 
    type: String, 
    required: true, 
    enum: ['Technical', 'Management', 'Facilities', 'Other'] 
  },
  description: { 
    type: String, 
    required: true 
  },
  isAnonymous: { 
    type: Boolean, 
    default: true 
  },
  status: { 
    type: String, 
    default: 'Pending', 
    enum: ['Pending', 'Reviewed', 'Resolved'] 
  }
}, { timestamps: true });

module.exports = mongoose.model('Complaint', ComplaintSchema);