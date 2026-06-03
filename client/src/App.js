import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="header">
          <h1>Municipal Cooperation System</h1>
          <p>Streamlining Municipal Services</p>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<div>Welcome Page</div>} />
            <Route path="/dashboard" element={<div>Dashboard</div>} />
            <Route path="/complaints" element={<div>Complaints</div>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
