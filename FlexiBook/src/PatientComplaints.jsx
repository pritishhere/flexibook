import React, { useState, useEffect } from 'react';

const PatientComplaints = ({ hospitalId }) => {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [myTickets, setMyTickets] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = 'http://localhost:5000/api'; // Apne backend port ke hisaab se change karein
  const token = localStorage.getItem('token'); 

  useEffect(() => {
    fetchMyTickets();
  }, []);

  const fetchMyTickets = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/complaints/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) setMyTickets(data);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    }
  };

  const handleFileComplaint = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/complaints`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ hospitalId, subject, description })
      });

      if (response.ok) {
        alert("Complaint filed successfully! ✅");
        setSubject('');
        setDescription('');
        fetchMyTickets(); 
      }
    } catch (error) {
      console.error("Error filing complaint:", error);
    } finally {
      setLoading(false);
    }
  };

  // Inline Styles Definition (Bulletproof Layout)
  const styles = {
    container: { maxWidth: '700px', margin: '30px auto', padding: '20px', fontFamily: 'Arial, sans-serif' },
    heading: { color: '#333', borderBottom: '2px solid #333', paddingBottom: '10px' },
    formBox: { background: '#f9f9f9', padding: '20px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '30px' },
    inputGroup: { marginBottom: '15px' },
    label: { display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#555' },
    input: { width: '100%', padding: '10px', border: '2px solid #4A90E2', borderRadius: '4px', boxSizing: 'border-box', fontSize: '16px' },
    textarea: { width: '100%', padding: '10px', border: '2px solid #4A90E2', borderRadius: '4px', boxSizing: 'border-box', fontSize: '16px', resize: 'vertical' },
    button: { background: '#4A90E2', color: 'white', border: 'none', padding: '12px 20px', fontSize: '16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
    ticketList: { border: '1px solid #ddd', borderRadius: '6px', padding: '0', listStyleType: 'none' },
    ticketItem: { padding: '15px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'between', alignItems: 'center' }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>📝 File a Feedback / Complaint</h2>
      
      {/* 1. COMPLAINT FORM */}
      <form onSubmit={handleFileComplaint} style={styles.styles.formBox}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Subject:</label>
          <input 
            type="text" 
            value={subject} 
            onChange={(e) => setSubject(e.target.value)} 
            required 
            placeholder="Enter issue subject..."
            style={styles.input}
          />
        </div>
        
        <div style={styles.inputGroup}>
          <label style={styles.label}>Description:</label>
          <textarea 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            required 
            rows="4"
            placeholder="Describe your complaint in detail..."
            style={styles.textarea}
          ></textarea>
        </div>
        
        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? 'Submitting...' : 'Submit Ticket 🚀'}
        </button>
      </form>

      {/* 2. TICKETS TRACKER */}
      <h3 style={{color: '#333'}}>📋 My Ticket History</h3>
      {myTickets.length === 0 ? (
        <p style={{color: '#777', fontStyle: 'italic'}}>No complaints filed yet.</p>
      ) : (
        <ul style={styles.ticketList}>
          {myTickets.map(ticket => (
            <li key={ticket._id} style={styles.ticketItem}>
              <div>
                <strong style={{fontSize: '16px'}}>{ticket.subject}</strong>
                <div style={{fontSize: '12px', color: '#888'}}>{new Date(ticket.createdAt).toLocaleDateString()}</div>
              </div>
              <span style={{fontWeight: 'bold', color: ticket.status === 'resolved' ? 'green' : 'orange'}}>
                [{ticket.status.toUpperCase()}]
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PatientComplaints;