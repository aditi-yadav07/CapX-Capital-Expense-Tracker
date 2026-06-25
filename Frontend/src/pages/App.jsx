import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import Dashboard from './Dashboard';

function App() {
  return (
    <Routes>
      {/* 1. By default agar koi website par aaye to use Login page par bhej do */}
      <Route path="/" element={<Navigate to="/login" />} />
      
      {/* 2. Humare authentication ke pages */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* 3. Dashboard ka rasta */}
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}

export default App;
