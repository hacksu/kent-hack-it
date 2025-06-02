import React, { useEffect, useState } from 'react';
import AdminNavbar, { VerifyAdminSession, GetBackendHost } from '../components/admin_navbar.js';
import '../App.css';

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState("users");
  const [msgContent, setMsgContent] = useState("");

  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [challenges, setChallenges] = useState([]);

//###############################################################################
//###############################################################################

  async function GetTeams() {
    try {
      const response = await fetch(`http://${GetBackendHost()}/admin/get_teams`, {
        method: "GET",
        credentials: 'include'  // ensures cookies are sent
      });

      const data = await response.json();
      if (data) {
        setTeams(data);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  }
  useEffect(() => {
    GetTeams();
  }, []);

  async function removeTeam(id) {
    try {
      const response = await fetch(`http://${GetBackendHost()}/admin/remove_team`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          {
            "team_id": id,
          }
        ),
        credentials: 'include'
      });

      const data = await response.json();
      let msgArea = document.getElementById('msg_popup');
      
      if (data && data.acknowledge) {
        if (msgArea) {
          setMsgContent("<p style='color: green;'>" + data.message + "</p>");
        }
        GetTeams();
      } else {
        if (msgArea) {
          setMsgContent("<p style='color: red;'>" + data.message + "</p>");
        }
      }
    } catch (error) {
      console.error("Error sending request:", error);
    }
  };

//###############################################################################
//###############################################################################

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
  useEffect(() => {
    GetUsers();
  }, []);

  async function removeUser(user_id) {
    try {
      const response = await fetch(`http://${GetBackendHost()}/admin/remove_user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          {
            "user_id": user_id,
          }
        ),
        credentials: 'include'
      });

      const data = await response.json();
      let msgArea = document.getElementById('msg_popup');
      
      if (data && data.acknowledge) {
        if (msgArea) {
          setMsgContent("<p style='color: green;'>" + data.message + "</p>");
        }
        GetUsers()
      } else {
        if (msgArea) {
          setMsgContent("<p style='color: red;'>" + data.message + "</p>");
        }
      }
    } catch (error) {
      console.error("Error sending request:", error);
    }
  };

//###############################################################################
//###############################################################################

  const [updateFormData, setUpdateFormData] = useState({
    name: '',
    description: '',
    category: '',
    difficulty: '',
    flag: '',
    points: ''
  });

  const handleUpdateChange = e => {
    const { name, value } = e.target;
    setUpdateFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  async function FetchChallenges() {
    try {
      const response = await fetch(`http://${GetBackendHost()}/challenges`);
      const data = await response.json();
      if (data) setChallenges(data);
    } catch (err) {
      console.error('Failed to fetch challenges:', err);
    }
  }

  async function GetChallengeInfo(id) {
    try {
      const response = await fetch(`http://${GetBackendHost()}/admin/fetch_challenges`);
      const data = await response.json();
      if (data) {
        const challenge = data.find(c => c._id === id);

        setUpdateFormData(prev => ({
          ...prev,
          'name': challenge.name
        }));
        setUpdateFormData(prev => ({
          ...prev,
          'description': challenge.description
        }));
        setUpdateFormData(prev => ({
          ...prev,
          'category': challenge.category
        }));
        setUpdateFormData(prev => ({
          ...prev,
          'difficulty': challenge.difficulty
        }));
        setUpdateFormData(prev => ({
          ...prev,
          'flag': challenge.flag
        }));
        setUpdateFormData(prev => ({
          ...prev,
          'points': challenge.points
        }));
      }
    } catch (err) {
      console.error('Failed to fetch challenges:', err);
    }
  }

  // execute FetchChallenges once on-load
  useEffect(() => {
    FetchChallenges()
  }, []);

  const [editId, setEditID] = useState("");

  // change to invisible tab where edit form is located
  async function EditChallenge(challenge_id) {
    await GetChallengeInfo(challenge_id)
    setActiveTab("edit");
    setEditID(challenge_id);
  }

  const UpdateChallenge = async (event) => {
    event.preventDefault();
    
    try {
      const response = await fetch(`http://${GetBackendHost()}/admin/update_challenge`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          "challenge_id": editId,
          "name": updateFormData.name,
          "description": updateFormData.description,
          "category": updateFormData.category,
          "difficulty": updateFormData.difficulty,
          "flag": updateFormData.flag,
          "points": updateFormData.points,
        }),
        credentials: 'include'  // ensures cookies are sent
      });

      // get the response output from the above fetch call
      const data = await response.json();
      let msgArea = document.getElementById('msg_popup');
      
      if (data && data.acknowledge) {
        if (msgArea) {
          setMsgContent("<p style='color: green;'>" + data.message + "</p>");
        }
        GetTeams();
      } else {
        if (msgArea) {
          setMsgContent("<p style='color: red;'>" + data.message + "</p>");
        }
      }
    } catch (error) {
      console.error("Error sending request:", error);
    }
  }


  const [newFormData, setNewFormData] = useState({
    name: '',
    description: '',
    category: '',
    difficulty: '',
    flag: '',
    points: ''
  });

  const handleNewChange = e => {
    const { name, value } = e.target;
    setNewFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addChallenge = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch(`http://${GetBackendHost()}/admin/create_challenge`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          "name": newFormData.name,
          "description": newFormData.description,
          "category": newFormData.category,
          "difficulty": newFormData.difficulty,
          "flag": newFormData.flag,
          "points": newFormData.points,
        }),
        credentials: 'include'  // ensures cookies are sent
      });

      // get the response output from the above fetch call
      const data = await response.json();
      let msgArea = document.getElementById('msg_popup');
      
      if (data && data.acknowledge) {
        if (msgArea) {
          setMsgContent("<p style='color: green;'>" + data.message + "</p>");
        }
        GetTeams();
      } else {
        if (msgArea) {
          setMsgContent("<p style='color: red;'>" + data.message + "</p>");
        }
      }
    } catch (error) {
      console.error("Error sending request:", error);
    }
  }

//###############################################################################
//###############################################################################

  useEffect(() => {
    async function Verify() {
      const authenticated = await VerifyAdminSession();
      if (authenticated === false) {
        window.location.href = "/admin"
      }
    }
    Verify();
  }, []); // run once on page-load

  async function ChangeTab(tab_name) {
    setActiveTab(tab_name);

    if (tab_name === "teams") {
      GetTeams();
    }
    if (tab_name === "users") {
      GetUsers();
    }
    if (tab_name === "view") {
      FetchChallenges();
    }
  }

  const [searchTerm, setSearchTerm] = useState("");
  // Filter users based on the search term (case-insensitive)
  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="App">
      <AdminNavbar />
      <header
        className="App-header"
        style={{
          display: 'block',
          height: 'auto',
          paddingTop: '0',
        }}>
        <h1 style={{ padding: '15px' }}>Admin Panel</h1>

        {/* msgContent is not user controlled */}
        <div
          id='msg_popup'
          style={{ padding: '5px' }}
          dangerouslySetInnerHTML={{ __html: msgContent }}>
        </div>

        <div className="container">
          <ul className="nav nav-tabs">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "users" ? "active" : ""}`}
                style={{ fontSize: "1.5rem", padding: "0.25rem 0.5rem" }}
                onClick={() => ChangeTab("users")}
              >
                Users
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "teams" ? "active" : ""}`}
                style={{ fontSize: "1.5rem", padding: "0.25rem 0.5rem" }}
                onClick={() => ChangeTab("teams")}
              >
                Teams
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "view" ? "active" : ""}`}
                style={{ fontSize: "1.5rem", padding: "0.25rem 0.5rem" }}
                onClick={() => ChangeTab("view")}
              >
                View Challenges
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
                      <div className="col-md-4 mb-4" key={user._id}>
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
                              onClick={() => removeUser(user._id)}
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

            <>
              {activeTab === "teams" && (
                <div className="teams-tab">
                  {/* 🔍 Search Bar */}
                  <div className="mb-4">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search Team by name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  {/* Team Cards */}
                  <div className="row">
                    {filteredTeams.map(team => (
                      <div className="col-md-4 mb-4" key={team._id}>
                        <div className="card shadow-sm border-0 h-100">
                          <div className="card-body d-flex flex-column justify-content-between">
                            <div>
                              <h5
                                style={{ fontSize: "1.75rem", padding: "0.25rem 0.5rem" }}
                                className="card-title mb-2"
                              >
                                {team.name}
                              </h5>
                              <h5
                                style={{ fontSize: "1.75rem", padding: "0.25rem 0.5rem" }}
                                className="card-title mb-2"
                              >
                                Members:
                              </h5>

                              <ul 
                                style={{ fontSize: "1.5rem", padding: "0.25rem 0.5rem" }}className="ps-4 mb-0">
                                {team.members.map((member, index) => (
                                  <li key={index}>{member}</li>
                                ))}
                              </ul>
                            </div>
                            <button
                              className="btn btn-outline-danger mt-3 align-self-start"
                              onClick={() => removeTeam(team._id)}
                            >
                              <i className="bi bi-trash me-2"></i> Remove Team
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
              <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                <h5>Create a New Challenge</h5>
                <form onSubmit={addChallenge}>
                  <div className="mb-3">
                    <label className="form-label">Challenge Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={newFormData.name}
                      onChange={handleNewChange}
                      required
                    />
                  </div>
              
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      name="description"
                      value={newFormData.description}
                      onChange={handleNewChange}
                      style={{
                        minHeight: '120px',
                        maxHeight: '300px',
                        overflowY: 'auto',
                        resize: 'vertical', // allow vertical resizing
                        width: '100%',
                      }}
                      placeholder="Enter description"
                    />
                  </div>
              
                  <div className="mb-3">
                    <label className="form-label">Category</label>
                    <select
                      className="form-select"
                      name="category"
                      value={newFormData.category}
                      onChange={handleNewChange}
                      required
                    >
                      <option value="" disabled>Select Category</option>
                      <option value="Web Exploitation">Web Exploitation</option>
                      <option value="Cryptography">Cryptography</option>
                      <option value="Reverse Engineering">Reverse Engineering</option>
                      <option value="Forensics">Forensics</option>
                      <option value="Binary Exploitation">Binary Exploitation</option>
                      <option value="General">General</option>
                    </select>
                  </div>
              
                  <div className="mb-3">
                    <label className="form-label">Difficulty</label>
                    <select
                      className="form-select"
                      name="difficulty"
                      value={newFormData.difficulty}
                      onChange={handleNewChange}
                      required
                    >
                      <option value="" disabled>Select difficulty</option>
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
              
                  <div className="mb-3">
                    <label className="form-label">Flag</label>
                    <input
                      type="text"
                      className="form-control"
                      name="flag"
                      value={newFormData.flag}
                      onChange={handleNewChange}
                      required
                    />
                  </div>
              
                  <div className="mb-3">
                    <label className="form-label">Points</label>
                    <div style={{ textAlign: 'center' }}>
                      <input
                        type="number"
                        className="form-control"
                        name="points"
                        value={newFormData.points}
                        onChange={handleNewChange}
                        required
                        style={{ width: '100px', display: 'inline-block' }} // smaller width and inline-block to respect centering
                      />
                    </div>
                  </div>
              
                  <button type="submit" className="btn btn-primary">
                    Submit
                  </button>
                </form>
              </div>
            )}

            {activeTab === "view" && (
              <div>
                <h5>Current Challenges</h5>
                <ul className="row">
                  {challenges.map((challenge, idx) => (
                    <div
                      className="col-12 col-sm-6 col-md-3 col-lg-3 mb-3"
                      key={idx}
                      style={{ maxWidth: '250px' }}
                    >
                      <div className="card h-100 shadow-sm p-2">
                        <div className="card-body p-2">
                          <h6 className="card-title mb-1">{challenge.name}</h6>
                          <small 
                              style={{ fontSize: "1.25rem" }}
                              className="text-muted">
                            {challenge.category} | Difficulty: {challenge.difficulty}
                          </small>
                          <p 
                              style={{ fontSize: "1.25rem" }}
                              className="card-text small mt-2">{challenge.description}</p>
                          <p 
                              style={{ fontSize: "1.25rem" }}
                              className="card-text small mb-1">
                            ⭐ {challenge.rating.toFixed(1)} / 5
                          </p>
                          <p 
                              style={{ fontSize: "1.25rem" }}
                              className="card-text small">
                            Points: {challenge.points}
                          </p>
                        </div>

                        <button
                            className="btn btn-outline-info align-self-start"
                            onClick={() => EditChallenge(challenge._id)}
                        >
                          <i className="bi bi-trash me-2"></i> Edit
                        </button>
                      </div>
                    </div>
                  ))}
                </ul>
              </div>
            )}

            {activeTab === "edit" && (
              <div style={{ maxWidth: '600px', margin: '0 auto' }}>
              <h5>Edit Challenge</h5>
              <form onSubmit={UpdateChallenge}>
                <div className="mb-3">
                  <label className="form-label">Challenge Name</label>
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    value={updateFormData.name}
                    onChange={handleUpdateChange}
                    required
                  />
                </div>
            
                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    name="description"
                    value={updateFormData.description}
                    onChange={handleUpdateChange}
                    style={{
                      minHeight: '120px',
                      maxHeight: '300px',
                      overflowY: 'auto',
                      resize: 'vertical', // allow vertical resizing
                      width: '100%',
                    }}
                    placeholder="Enter description"
                  />
                </div>
            
                <div className="mb-3">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    name="category"
                    value={updateFormData.category}
                    onChange={handleUpdateChange}
                    required
                  >
                    <option value="" disabled>Select Category</option>
                    <option value="Web Exploitation">Web Exploitation</option>
                    <option value="Cryptography">Cryptography</option>
                    <option value="Reverse Engineering">Reverse Engineering</option>
                    <option value="Forensics">Forensics</option>
                    <option value="Binary Exploitation">Binary Exploitation</option>
                    <option value="General">General</option>
                  </select>
                </div>
            
                <div className="mb-3">
                  <label className="form-label">Difficulty</label>
                  <select
                    className="form-select"
                    name="difficulty"
                    value={updateFormData.difficulty}
                    onChange={handleUpdateChange}
                    required
                  >
                    <option value="" disabled>Select difficulty</option>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
            
                <div className="mb-3">
                  <label className="form-label">Flag</label>
                  <input
                    type="text"
                    className="form-control"
                    name="flag"
                    value={updateFormData.flag}
                    onChange={handleUpdateChange}
                    required
                  />
                </div>
            
                <div className="mb-3">
                  <label className="form-label">Points</label>
                  <div style={{ textAlign: 'center' }}>
                    <input
                      type="number"
                      className="form-control"
                      name="points"
                      value={updateFormData.points}
                      onChange={handleUpdateChange}
                      required
                      style={{ width: '100px', display: 'inline-block' }} // smaller width and inline-block to respect centering
                    />
                  </div>
                </div>
            
                <button type="submit" className="btn btn-primary">
                  Submit
                </button>
              </form>
            </div>            
            )}
          </div>
        </div>

      </header>
    </div>
  );
}