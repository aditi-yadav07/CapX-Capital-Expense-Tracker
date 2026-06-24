import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      alert('Access Granted. System Booting... 🌐');
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Access Denied: Invalid Credentials');
    }
  };

  // Inline styles for cyberpunk theme
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
      border: '2px solid #00f0ff',
      boxShadow: '0 0 20px rgba(0, 240, 255, 0.3), inset 0 0 15px rgba(0, 240, 255, 0.1)',
      padding: '40px',
      borderRadius: '8px',
      width: '100%',
      maxWidth: '400px',
      backdropFilter: 'blur(10px)',
      textAlign: 'center'
    },
    title: {
      margin: '0 0 30px 0',
      color: '#00f0ff',
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
      background: 'linear-gradient(45deg, #9d00ff, #ff007f)',
      border: 'none',
      borderRadius: '4px',
      color: '#fff',
      fontFamily: 'Orbitron',
      fontWeight: 'bold',
      cursor: 'pointer',
      boxShadow: '0 0 15px rgba(255, 0, 127, 0.4)',
      letterSpacing: '1px'
    },
    link: {
      color: '#ff007f',
      textDecoration: 'none',
      fontWeight: 'bold'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <h2 style={styles.title}> LOGIN_INITIALIZE</h2>
        <form onSubmit={handleLogin}>
          <input 
            type="email" 
            placeholder="USER_EMAIL" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            style={styles.input}
            onFocus={(e) => e.target.style.borderColor = '#00f0ff'}
            onBlur={(e) => e.target.style.borderColor = '#9d00ff'}
          />
          <input 
            type="password" 
            placeholder="PASSWORD" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            style={styles.input}
            onFocus={(e) => e.target.style.borderColor = '#00f0ff'}
            onBlur={(e) => e.target.style.borderColor = '#9d00ff'}
          />
          <button type="submit" style={styles.button}>LOGIN</button>
        </form>
        <p style={{ fontSize: '14px', color: '#aaa', marginTop: '15px' }}>
          Don't Have An Account? <Link to="/register" style={styles.link}>Create Account</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;