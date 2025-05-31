import React, { useEffect, useState, useCallback } from 'react';
import AdminNavbar, { VerifyAdminSession, GetBackendHost } from '../components/admin_navbar.js';
import '../App.css';

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState("users");

  const [users, setUsers] = useState([]);
  const [challenges, setChallenges] = useState([]);

  const [newChallenge, setNewChallenge] = useState("");

  const removeUser = (id) => {
  };

  const addChallenge = () => {
  };

  useEffect(() => {
    async function GetUsers() {
      try {
        const response = await fetch(`http://${GetBackendHost()}/admin/get_users`, {
          method: "GET",
          credentials: 'include'  // ensures cookies are sent
        });

        const data = await response.json();
        if (data) {
          console.log(data)
          setUsers(data);
        }
      } catch (err) {
        console.error('Failed to fetch users:', err);
      }
    }
    GetUsers();
  }, []);

  const FetchChallenges = useCallback(async () => {
    try {
      const response = await fetch(`http://${GetBackendHost()}/challenges`);
      const data = await response.json();
      if (data) setChallenges(data);
    } catch (err) {
      console.error('Failed to fetch challenges:', err);
    }
  }, [setChallenges]);
  
  // execute FetchChallenges once on-load
  useEffect(() => {
    FetchChallenges();
  }, []);

  useEffect(() => {
    async function Verify() {
      const authenticated = await VerifyAdminSession();
      if (authenticated === false) {
        window.location.href = "/admin"
      }
    }
    Verify();
  }, []); // run once on page-load

  const [searchTerm, setSearchTerm] = useState("");
  // Filter users based on the search term (case-insensitive)
  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="App">
      <AdminNavbar />
      <header className="App-header">
        <h1>Admin Panel</h1>

        <div className="container mt-5">
          <ul className="nav nav-tabs">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "users" ? "active" : ""}`}
                style={{ fontSize: "1.5rem", padding: "0.25rem 0.5rem" }}
                onClick={() => setActiveTab("users")}
              >
                Users
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "create" ? "active" : ""}`}
                style={{ fontSize: "1.5rem", padding: "0.25rem 0.5rem" }}
                onClick={() => setActiveTab("create")}
              >
                Create Challenge
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "view" ? "active" : ""}`}
                style={{ fontSize: "1.5rem", padding: "0.25rem 0.5rem" }}
                onClick={() => setActiveTab("view")}
              >
                View Challenges
              </button>
            </li>
          </ul>

          <div className="tab-content mt-4">
          <>
            {activeTab === "users" && (
              <div className="users-tab">
                {/* 🔍 Search Bar */}
                <div className="mb-4">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search users by username..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* 👤 User Cards */}
                <div className="row">
                  {filteredUsers.map(user => (
                    <div className="col-md-4 mb-4" key={user.id}>
                      <div className="card shadow-sm border-0 h-100">
                        <div className="card-body d-flex flex-column justify-content-between">
                          <div>
                            <h5
                              style={{ fontSize: "1.75rem", padding: "0.25rem 0.5rem" }}
                              className="card-title mb-2"
                            >
                              {user.username}
                            </h5>
                            <p
                              style={{ fontSize: "1.25rem", padding: "0.25rem 0.5rem" }}
                              className="card-text text-muted mb-1"
                            >
                              <strong>Email:</strong> {user.email}
                            </p>
                            <p
                              style={{ fontSize: "1.25rem", padding: "0.25rem 0.5rem" }}
                              className="card-text text-muted"
                            >
                              <strong>Team ID:</strong> {user.team_id}
                            </p>
                          </div>
                          <button
                            className="btn btn-outline-danger mt-3 align-self-start"
                            onClick={() => removeUser(user.id)}
                          >
                            <i className="bi bi-trash me-2"></i> Remove User
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>

            {activeTab === "create" && (
              <div>
                <h5>Create a New Challenge</h5>
                <div className="input-group mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Challenge title"
                    value={newChallenge}
                    onChange={e => setNewChallenge(e.target.value)}
                  />
                  <button className="btn btn-primary" onClick={addChallenge}>
                    Add
                  </button>
                </div>
              </div>
            )}

            {activeTab === "view" && (
              <div>
                <h5>Current Challenges</h5>
                <ul className="list-group">
                  {challenges.map(challenge => (
                    <li key={challenge.id} className="list-group-item">
                      {challenge.title}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

      </header>
    </div>
  );
}