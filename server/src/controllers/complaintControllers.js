// A simple array acting as an in-memory database
let complaintsDatabase = [];

// 1. Submit a new complaint
exports.submitComplaint = async (req, res) => {
  try {
    const { title, category, description, isAnonymous } = req.body;
    
    const newComplaint = {
      id: complaintsDatabase.length + 1,
      title,
      category,
      description,
      isAnonymous: isAnonymous ?? true,
      status: 'Pending',
      createdAt: new Date()
    };

    complaintsDatabase.push(newComplaint);
    res.status(201).json({ success: true, message: 'Complaint filed successfully', data: newComplaint });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 2. Get all complaints for the Admin Dashboard
exports.getAllComplaints = async (req, res) => {
  try {
    // Return complaints sorted by newest first
    const sortedComplaints = [...complaintsDatabase].reverse();
    res.status(200).json({ success: true, data: sortedComplaints });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 3. Update processing status
exports.updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const complaint = complaintsDatabase.find(c => c.id === parseInt(id));
    
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }
    
    complaint.status = status;
    res.status(200).json({ success: true, data: complaint });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};