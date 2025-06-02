import React, { useState, useEffect } from 'react';
import Navbar, { GetBackendHost } from '../components/navbar.js';
import '../App.css';

export function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);

  async function FetchLeaderboard() {
    try {
      const response = await fetch(`http://${GetBackendHost()}/data/leaderboard`, {
        method: "GET",
        credentials: 'include'  // ensures cookies are sent
      });
  
      const data = await response.json();
      setLeaderboard(data);
    } catch (error) {
      console.error("Error sending request:", error);
    }
  }

  // runs periodically
  useEffect(() => {
    FetchLeaderboard()
  }, []); // [] means execute this once on page-load

  return (
    <div className="App">
      <Navbar />
      <header
        className="App-header"
        style={{
          display: 'block',
          height: 'auto',
          paddingTop: '15px',
        }}>
        <h1>KHI Leaderboard</h1>

        <div className="container mt-4 d-flex justify-content-center">
          <div className="card shadow-sm" style={{ minWidth: '200px', maxWidth: '500px', width: '100%' }}>
            <div className="card-header bg-primary text-white text-center fw-bold">
              Leaderboard
            </div>
            <ul className="list-group list-group-flush">
              {leaderboard.map((item, index) => {
                let badgeColor = "secondary";
                if (index === 0) badgeColor = "warning";       // Gold
                else if (index === 1) badgeColor = "secondary"; // Silver
                else if (index === 2) badgeColor = "danger";    // Bronze

                return (
                  <li
                    key={index}
                    className="list-group-item d-flex justify-content-between align-items-center px-4 py-2"
                    style={{ fontSize: "0.95rem" }}
                  >
                    <span>
                      <span className={`badge bg-${badgeColor} me-2`}>
                        {index + 1}
                      </span>
                      {item.name}
                    </span>
                    <span className="text-muted fw-bold">{item.points} pts</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

      </header>
    </div>
  );
}