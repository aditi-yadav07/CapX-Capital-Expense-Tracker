import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../Dashboard.css';
import { Html5QrcodeScanner } from "html5-qrcode";

function Dashboard() {
  const [showScanner, setShowScanner] = useState(false);
  const [scannedUpi, setScannedUpi] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [payDescription, setPayDescription] = useState('');
  const [selectedPayCategory, setSelectedPayCategory] = useState('');
  const [showAdvancedDetails, setShowAdvancedDetails] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [budgetsStatus, setBudgetsStatus] = useState([]);
  
  // Chat Overlay States
  const [isChatOpen, setIsChatOpen] = useState(false); // Modal control state
  const [chatInput, setChatInput] = useState('');
  const [chatLog, setChatLog] = useState([
    { sender: 'bot', text: 'Cyber-Neural Link Active. Main aapke live mainframe se synced hu. Poochye kya suggestion chahiye?' }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');

  const [budgetAmount, setBudgetAmount] = useState('');
  const [budgetCategoryId, setBudgetCategoryId] = useState('');

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const messagesEndRef = useRef(null);

  const fetchData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const resTx = await axios.get('http://localhost:5000/api/transactions', config);
      setTransactions(resTx.data);

      const resCat = await axios.get('http://localhost:5000/api/transactions/categories', config);
      setCategories(resCat.data);
      if (resCat.data.length > 0) {
        setCategoryId(resCat.data[0].id);
        setBudgetCategoryId(resCat.data[0].id);
      }

      const resBudget = await axios.get('http://localhost:5000/api/budgets/status', config);
      setBudgetsStatus(resBudget.data);
    } catch (err) {
      console.error('Data lane me error:', err);
    }
  };

  // Scanner open aur QR string read karne ka function
  const startScanning = () => {
    setShowScanner(true);
    setTimeout(() => {
      const scanner = new Html5QrcodeScanner("reader", { 
        fps: 10, 
        qrbox: { width: 250, height: 250 } 
      });

      scanner.render((decodedText) => {
        if (decodedText.includes("upi://pay")) {
          const urlParams = new URLSearchParams(decodedText.split('?')[1]);
          const upiId = urlParams.get('pa'); 
          setScannedUpi(upiId || decodedText);
        } else {
          setScannedUpi(decodedText);
        }
        scanner.clear(); // ID milte hi camera box stop aur clear ho jaye
      }, (err) => {});
    }, 300);
  };

  // Payment Execute aur DB ledger sync karne ka function
  const handleFastUpiPayment = async (e) => {
    e.preventDefault();
    if (!scannedUpi || !payAmount) {
      alert("Please enter amount and target UPI ID.");
      return;
    }

    // Direct Mobile UPI deep linking route trigger
    const intentUrl = `upi://pay?pa=${scannedUpi}&cu=INR&am=${payAmount}`;
    window.location.href = intentUrl;

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const payload = {
        amount: parseFloat(payAmount),
        description: showAdvancedDetails && payDescription ? payDescription : `Quick scan code to ${scannedUpi}`,
        category_id: showAdvancedDetails && selectedPayCategory ? selectedPayCategory : null,
        receiver_identity: scannedUpi
      };

      await axios.post('http://localhost:5000/api/payments/verify-record', payload, config);

      // Clean states
      setShowScanner(false);
      setScannedUpi('');
      setPayAmount('');
      setPayDescription('');
      setShowAdvancedDetails(false);
      fetchData(); // Tables refresh data grid
    } catch (err) {
      alert("Ledger synchronization processing failed.");
    }
  };

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [token]);

  useEffect(() => {
    if (isChatOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatLog, isTyping, isChatOpen]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = chatInput;
    setChatLog(prev => [...prev, { sender: 'user', text: userMessage }]);
    setChatInput('');
    setIsTyping(true);

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.post('http://localhost:5000/api/chat/message', { message: userMessage }, config);
      
      setChatLog(prev => [...prev, { sender: 'bot', text: res.data.reply }]);
    } catch (err) {
      setChatLog(prev => [...prev, { sender: 'bot', text: '⚠️ ERROR: AI Core communication timeout.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post('http://localhost:5000/api/transactions', {
        category_id: categoryId,
        type,
        amount: parseFloat(amount),
        description,
        transaction_date: date
      }, config);

      // Successful hone par koi alert nahi, bas reset aur fetch hoga
      setAmount('');
      setDescription('');
      fetchData(); 
    } catch (err) {
      // Sirf error aane par alert dikhayega
      alert('Transaction injection failed! Please check your network or inputs.');
    }
  };

  const handleSetBudget = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const currentMonthYear = new Date().toISOString().slice(0, 7); 
      await axios.post('http://localhost:5000/api/budgets', {
        category_id: budgetCategoryId,
        amount: parseFloat(budgetAmount),
        month_year: currentMonthYear
      }, config);

      // Successful hone par koi alert nahi, bas reset aur fetch hoga
      setBudgetAmount('');
      fetchData();
    } catch (err) {
      // Sirf error aane par alert dikhayega
      alert('Core budget mapping failed! Please try again.');
    }
  };


  const handleDelete = async (id) => {
    if (window.confirm('Purge this transaction record from main mainframe?')) {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        await axios.delete(`http://localhost:5000/api/transactions/${id}`, config);
        fetchData();
      } catch (err) {
        alert('Purge operation failed');
      }
    }
  };

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const balance = totalIncome - totalExpense;

  return (
    <div className="dashboard-container">

      {/* ================= EXACT COPY FLOATING SCANNER BUTTON ================= */}
        <div>
          <button 
            type="button" 
            onClick={startScanning} 
            style={{ 
              position: 'fixed', 
              bottom: '95px', // "NEED HELP?" ke just upar bina cross hue set hoga
              right: '20px', 
              width: '280px', // Exact matching width
              height: '62px', // Exact matching height
              borderRadius: '50px', // Perfect capsule/pill shape
              background: 'linear-gradient(90deg, #00d2ff 0%, #9b30ff 100%)', // Seamless matching gradient
              border: '2px solid #ffffff', // Clean white border matching the lower widget
              boxShadow: '0 0 20px rgba(0, 210, 255, 0.6), inset 0 0 10px rgba(255, 255, 255, 0.2)', // Dual neon glow
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: '12px', 
              zIndex: 998,
              fontFamily: '"Orbitron", "Segoe UI", sans-serif', // Tech typography tracking
              fontWeight: '900', // Heavy bold style
              fontSize: '1.1rem', // Text scaling
              letterSpacing: '1.5px',
              cursor: 'pointer',
              color: '#ffffff', // Clean crisp white text
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              transition: 'all 0.2s ease-in-out'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.03) translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 0 25px rgba(0, 210, 255, 0.9)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1) translateY(0)';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 210, 255, 0.6)';
            }}
          >
            {/* Swapped payment layout icon instead of robot */}
            <span style={{ fontSize: '1.4rem', display: 'inline-flex', alignItems: 'center' }}>💳</span> 
            <span style={{ color: '#000000' }}>PAY HERE</span> 
          </button>

          {/* Modal Pop-up: Scan interface remains protected inside the wrapper */}
          {showScanner && (
            <div className="scanner-modal-backdrop" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 999 }}>
              <div className="scanner-modal-box" style={{ background: '#0d0d13', border: '2px solid #00f0ff', padding: '20px', borderRadius: '8px', width: '90%', maxWidth: '450px' }}>
                <h3 className="card-title" style={{ fontSize: '1rem', color: '#00f0ff' }}>// RADAR_LIVE_STREAM</h3>
                
                <div id="reader" style={{ width: '100%', background: '#111', borderRadius: '4px' }}></div>
                
                <form onSubmit={handleFastUpiPayment} style={{ marginTop: '15px' }}>
                  <label className="cyber-label">TARGET UPI ID</label>
                  <input 
                    type="text" 
                    className="cyber-input"
                    value={scannedUpi} 
                    onChange={(e) => setScannedUpi(e.target.value)} 
                    placeholder="Scan QR or type manually"
                    required
                  />

                  <label className="cyber-label">AMOUNT (₹)</label>
                  <input 
                    type="number" 
                    className="cyber-input"
                    value={payAmount} 
                    onChange={(e) => setPayAmount(e.target.value)} 
                    placeholder="₹ 0.00"
                    required
                    style={{ fontSize: '1.4rem', color: '#00f0ff', fontWeight: 'bold' }}
                  />

                  <div style={{ margin: '15px 0' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#888', fontSize: '0.9rem' }}>
                      <input 
                        type="checkbox" 
                        checked={showAdvancedDetails} 
                        onChange={(e) => setShowAdvancedDetails(e.target.checked)}
                      />
                      Add category/memo note? (Optional)
                    </label>
                  </div>

                  {showAdvancedDetails && (
                    <div style={{ borderLeft: '2px solid #ff007f', paddingLeft: '10px', marginBottom: '15px' }}>
                      <label className="cyber-label">SECTOR CATEGORY</label>
                      <select 
                        className="cyber-input"
                        value={selectedPayCategory}
                        onChange={(e) => setSelectedPayCategory(e.target.value)}
                      >
                        <option value="">Select Category</option>
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{c.name.toUpperCase()}</option>
                        ))}
                      </select>

                      <label className="cyber-label">TRANSACTION MEMO NOTE</label>
                      <input 
                        type="text" 
                        className="cyber-input"
                        value={payDescription} 
                        onChange={(e) => setPayDescription(e.target.value)} 
                        placeholder="E.g., Chai, Lunch"
                      />
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                    <button type="submit" className="btn-cyber" style={{ flex: 2 }}>⚡ EXECUTE PAY</button>
                    <button type="button" onClick={() => setShowScanner(false)} className="btn-cyber erase" style={{ flex: 1 }}>CLOSE</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      
      {/* Floating Robot Bubble */}
      <div className="cyber-bot-bubble" onClick={() => setIsChatOpen(true)}>
        <span className="bot-icon">🤖</span> NEED HELP?
      </div>

      {/* Sliding Side Chat Panel */}
      {isChatOpen && (
        <div className="chat-panel-overlay">
          <div className="chat-panel-header">
            <h3>🔮 FINANCIAL_AI_MAINFRAME</h3>
            <button className="close-panel-btn" onClick={() => setIsChatOpen(false)}>X</button>
          </div>
          <div className="chat-messages">
            {chatLog.map((chat, idx) => (
              <div key={idx} className={`chat-bubble ${chat.sender === 'user' ? 'bubble-user' : 'bubble-bot'}`}>
                {chat.sender === 'bot' && <strong style={{color:'#9d00ff'}}>BOT: </strong>}
                {chat.sender === 'user' && <strong style={{color:'#00f0ff'}}>YOU: </strong>}
                {chat.text}
              </div>
            ))}
            {isTyping && (
              <div className="chat-bubble bubble-bot" style={{fontStyle: 'italic', color: '#aaa'}}>
                Reading financial data matrix...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSendMessage} className="chat-input-area">
            <input 
              type="text" 
              placeholder="Ask me anything about your logs..." 
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              className="chat-input-field"
            />
            <button type="submit" className="chat-send-btn">SEND</button>
          </form>
        </div>
      )}

      {/* Main Framework Dashboard UI */}
      <div className="cyber-header">
        <h1>// CORE_MAIN_FRAME_v1.0</h1>
        <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="disconnect-btn">
          DISCONNECT
        </button>
      </div>

      <div className="summary-grid">
        <div className="summary-card card-balance">
          <h3>NET_BALANCE</h3>
          <p>₹{balance}</p>
        </div>
        <div className="summary-card card-inflow">
          <h3>TOTAL_INFLOW</h3>
          <p>₹{totalIncome}</p>
        </div>
        <div className="summary-card card-outflow">
          <h3>TOTAL_OUTFLOW</h3>
          <p>₹{totalExpense}</p>
        </div>
      </div>

      <div className="main-workstation">
        <div className="control-column">
          <form onSubmit={handleAddTransaction} className="cyber-form tx-form">
            <h3>// LOG_TRANSACTION</h3>
            <input type="number" placeholder="AMOUNT (INR)" value={amount} onChange={e => setAmount(e.target.value)} required className="cyber-input" />
            <select value={type} onChange={e => setType(e.target.value)} className="cyber-input">
              <option value="expense">TYPE: EXPENSE</option>
              <option value="income">TYPE: INCOME</option>
            </select>
            <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="cyber-input">
              {categories.map(c => <option key={c.id} value={c.id}>{c.name.toUpperCase()}</option>)}
            </select>
            <input type="text" placeholder="REMARK / DESCRIPTION" value={description} onChange={e => setDescription(e.target.value)} className="cyber-input" />
            <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="cyber-input" />
            <button type="submit" className="cyber-btn tx-btn">INJECT_DATA</button>
          </form>

          <form onSubmit={handleSetBudget} className="cyber-form budget-form">
            <h3>// DEFINE_THRESHOLD</h3>
            <select value={budgetCategoryId} onChange={e => setBudgetCategoryId(e.target.value)} className="cyber-input">
              {categories.map(c => <option key={c.id} value={c.id}>{c.name.toUpperCase()}</option>)}
            </select>
            <input type="number" placeholder="LIMIT CAPACITY (INR)" value={budgetAmount} onChange={e => setBudgetAmount(e.target.value)} required className="cyber-input" />
            <button type="submit" className="cyber-btn budget-btn">SET_LIMIT</button>
          </form>
        </div>

        <div className="status-column">
          <div>
            <h3 className="table-title-budget">// THRESHOLD_STATUS_MONITOR</h3>
            <div className="table-wrapper">
              <table className="cyber-table budget-table">
                <thead>
                  <tr>
                    <th>SECTOR</th>
                    <th>LIMIT</th>
                    <th>USED</th>
                    <th>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {budgetsStatus.map((b, index) => (
                    <tr key={index}>
                      <td style={{ fontWeight: '500' }}>{b.category_name.toUpperCase()}</td>
                      <td>₹{b.limit_amount}</td>
                      <td>₹{b.total_spent}</td>
                      <td className={b.is_exceeded ? 'status-critical' : 'status-stable'}>
                        {b.is_exceeded ? 'CRITICAL' : 'STABLE'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="table-title-tx">// MEMORY_LOG_STREAM</h3>
            <div className="table-wrapper">
              <table className="cyber-table tx-table">
                <thead>
                  <tr>
                    <th>TIMESTAMP</th>
                    <th>SECTOR</th>
                    <th>FLOW</th>
                    <th>VALUE</th>
                    <th>REMARK</th>
                    <th>PURGE</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(t => (
                    <tr key={t.id} style={{ color: '#d0d0ff' }}>
                      <td>{new Date(t.transaction_date).toLocaleDateString()}</td>
                      <td>{t.category_name.toUpperCase()}</td>
                      <td className={t.type === 'income' ? 'flow-income' : 'flow-expense'}>{t.type.toUpperCase()}</td>
                      <td>₹{t.amount}</td>
                      <td style={{ fontSize: '14px', color: '#aaa' }}>{t.description || 'N/A'}</td>
                      <td>
                        <button onClick={() => handleDelete(t.id)} className="purge-btn">X</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;