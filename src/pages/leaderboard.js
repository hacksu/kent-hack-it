import React, { useState, useEffect } from 'react';
import Navbar, { GetBackendHost } from '../components/navbar.js';
import '../App.css';

export function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [userData, setUserData] = useState(null);

  async function FetchLeaderboard() {
    try {
      const response = await fetch(`http://${GetBackendHost()}/data/leaderboard`, {
        method: "GET",
        credentials: 'include'
      });

      const data = await response.json();
      setLeaderboard(data);
    } catch (error) {
      console.error("Error sending request:", error);
    }
  }

  useEffect(() => {
    FetchLeaderboard();
  }, []);

  useEffect(() => {
    async function GetInfo() {
      try {
        const response = await fetch(`http://${GetBackendHost()}/user/info`, {
          method: "GET",
          credentials: 'include'  // ensures cookies are sent
        });
    
        const data = await response.json();
        if (data) {
          if (data.username && data.team) {
            setUserData({"username": data.username, "team": data.team})
          } else {
            setUserData(null)  
          }
        } else {
          setUserData(null)
        }
      } catch (error) {
        console.error("Error sending request:", error);
        setUserData(null)
      }
    }
    GetInfo();
  }, []); // run once on page-load

  // Filter leaderboard by search term (case-sensitive)
  const filteredLeaderboard = leaderboard.filter(item =>
    item.name.includes(searchTerm)
  );

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

        {/* Search Bar */}
        <div className="mb-3 mt-3 d-flex justify-content-center">
          <input
            type="text"
            className="form-control"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ maxWidth: '400px', width: '100%' }}
          />
        </div>

        <div className="container mt-2 d-flex justify-content-center gap-3">
          {/* THIS CARD ONLY SHOWS WHEN A USER IS AUTHENTICATED */}
          {console.log(userData)}
          {(userData) && (
            <div
              className="card shadow-sm"
              style={{ minWidth: '200px', maxWidth: '300px', width: '100%' }}
            >
              <div className="card-header bg-primary text-white text-center fw-bold">
                {userData.username}
              </div>

              {(() => {
                const actualIndex = leaderboard.findIndex(
                  (entry) => entry.name === userData.username || entry.name === userData.team
                );

                if (actualIndex === -1) return null;

                const userEntry = leaderboard[actualIndex];
                let badgeColor = "secondary";
                if (actualIndex === 0) badgeColor = "warning";
                else if (actualIndex === 1) badgeColor = "secondary";
                else if (actualIndex === 2) badgeColor = "danger";

                return (
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h6 className="mb-0">Your Placement</h6>
                      <span className={`badge bg-${badgeColor} ms-2`}>
                        #{actualIndex + 1}
                      </span>
                    </div>

                    <div
                      className="d-flex align-items-center d-flex justify-content-between px-4 py-2"
                      style={{ fontSize: "1.25rem" }}>
                      <span className="fw-semibold">{userEntry.name}</span>
                      <span className="text-muted fw-bold">{userEntry.points} pts</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
          
          <div className="card shadow-sm" style={{ minWidth: '200px', maxWidth: '500px', width: '100%' }}>
            <div className="card-header bg-primary text-white text-center fw-bold">
              Leaderboard
            </div>
            <ul
              className="list-group list-group-flush"
              style={{
                maxHeight: '400px',
                overflowY: 'auto',
                scrollbarWidth: 'thin',
                WebkitOverflowScrolling: 'touch',
              }}>
              {filteredLeaderboard.map((item, index) => {
                const actualIndex = leaderboard.findIndex(original => original.name === item.name);
                let badgeColor = "secondary";
                if (actualIndex === 0) badgeColor = "warning";
                else if (actualIndex === 1) badgeColor = "secondary";
                else if (actualIndex === 2) badgeColor = "danger";

                return (
                  <li
                    key={index}
                    className="list-group-item d-flex justify-content-between align-items-center px-4 py-2"
                    style={{ fontSize: "0.95rem" }}
                  >
                    <span>
                      <span className={`badge bg-${badgeColor} me-2`}>
                        {actualIndex + 1}
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