// src/App.js
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Login from "./pages/Login";
import "./App.css";

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("http://localhost:5001")
      .then((res) => res.text())
      .then((data) => setMessage(data))
      .catch((err) => console.log(err));
  }, []);

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          {/* Navigation */}
          <nav>
            <Link to="/">Home</Link> | <Link to="/login">Login</Link>
          </nav>

          {/* Routes */}
          <Routes>
            <Route path="/" element={<h1>{message}</h1>} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </header>
      </div>
    </Router>
  );
}

export default App;