import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://cap-x-capital-expense-tracker.vercel.app/api/auth/register', { username: username, email: email, password:password });
      alert('Registration Successful! Node Registered. 🚀');
      navigate('/login');
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed');
    }
  };

  const styles = {
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      padding: '0 20px'
    },
    box: {
      background: 'rgba(5, 5, 20, 0.8)',
      border: '2px solid #ff007f',
      boxShadow: '0 0 20px rgba(255, 0, 127, 0.3), inset 0 0 15px rgba(255, 0, 127, 0.1)',
      padding: '40px',
      borderRadius: '8px',
      width: '100%',
      maxWidth: '400px',
      backdropFilter: 'blur(10px)',
      textAlign: 'center'
    },
    title: {
      margin: '0 0 30px 0',
      color: '#ff007f',
      fontSize: '24px'
    },
    input: {
      width: '100%',
      padding: '12px',
      margin: '10px 0',
      background: 'rgba(255, 255, 255, 0.03)',
      border: '1px solid #9d00ff',
      borderRadius: '4px',
      color: '#fff',
      fontFamily: 'Rajdhani',
      fontSize: '16px',
      boxSizing: 'border-box',
      outline: 'none',
      transition: '0.3s'
    },
    button: {
      width: '100%',
      padding: '12px',
      margin: '20px 0 10px 0',
      background: 'linear-gradient(45deg, #00f0ff, #9d00ff)',
      border: 'none',
      borderRadius: '4px',
      color: '#fff',
      fontFamily: 'Orbitron',
      fontWeight: 'bold',
      cursor: 'pointer',
      boxShadow: '0 0 15px rgba(0, 240, 255, 0.4)',
      letterSpacing: '1px'
    },
    link: {
      color: '#00f0ff',
      textDecoration: 'none',
      fontWeight: 'bold'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <h2 style={styles.title}> REGISTER_NEW_NODE</h2>
        <form onSubmit={handleRegister}>
          <input 
            type="text" 
            placeholder="NAME" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            required 
            style={styles.input}
            onFocus={(e) => e.target.style.borderColor = '#ff007f'}
            onBlur={(e) => e.target.style.borderColor = '#9d00ff'}
          />
          <input 
            type="email" 
            placeholder="EMAIL" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            style={styles.input}
            onFocus={(e) => e.target.style.borderColor = '#ff007f'}
            onBlur={(e) => e.target.style.borderColor = '#9d00ff'}
          />
          <input 
            type="password" 
            placeholder="PASSWORD" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            style={styles.input}
            onFocus={(e) => e.target.style.borderColor = '#ff007f'}
            onBlur={(e) => e.target.style.borderColor = '#9d00ff'}
          />
          <button type="submit" style={styles.button}>SIGNUP</button>
        </form>
        <p style={{ fontSize: '14px', color: '#aaa', marginTop: '15px' }}>
          Registered? <Link to="/login" style={styles.link}>Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;