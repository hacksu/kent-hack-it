import React, { useEffect, useState } from 'react';
import AdminNavbar, { VerifyAdminSession, GetBackendHost } from '../components/admin_navbar.js';
import showPasswordPrompt from '../components/prompt.js';
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
    let msgArea = document.getElementById('msg_popup');
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
      if (msgArea) {
        setMsgContent("<p style='color: red;'> Error Occured! </p>");
      }
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
    let msgArea = document.getElementById('msg_popup');
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
      if (msgArea) {
        setMsgContent("<p style='color: red;'> Error Occured! </p>");
      }
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

  // prompt admin for passphrase to verify admin wishes to delete
  // a challenge, they will have to do this per challenge for safety
  async function DeleteChallenge(challenge_id) {
    let msgArea = document.getElementById('msg_popup');
    if (window.confirm(`Are you sure you want to delete this challenge?`)) {
      showPasswordPrompt(async (password) => {
        if (password !== null) {
          try {
            const response = await fetch(`http://${GetBackendHost()}/admin/delete_challenge`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                "challenge_id": challenge_id,
                "password": password,
              }),
              credentials: 'include'
            });
      
            const data = await response.json();
            
            if (data && data.acknowledge) {
              if (msgArea) {
                setMsgContent("<p style='color: green;'>" + data.message + "</p>");
              }
              FetchChallenges()
            } else {
              if (msgArea) {
                setMsgContent("<p style='color: red;'>" + data.message + "</p>");
              }
            }
          } catch (error) {
            console.error("Error sending request:", error);
            if (msgArea) {
              setMsgContent("<p style='color: red;'> Error Occured! </p>");
            }
          }
        } else {
          // User cancelled password input
          console.log("Password prompt cancelled");
        }
      });
    }
  }

  const UpdateChallenge = async (event) => {
    event.preventDefault();
    let msgArea = document.getElementById('msg_popup');
    
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
      if (msgArea) {
        setMsgContent("<p style='color: red;'> Error Occured! </p>");
      }
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
    let msgArea = document.getElementById('msg_popup');

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
      
      if (data && data.acknowledge) {
        if (msgArea) {
          setMsgContent("<p style='color: green;'>" + data.message + "</p>");
        }
      } else {
        if (msgArea) {
          setMsgContent("<p style='color: red;'>" + data.message + "</p>");
        }
      }
    } catch (error) {
      console.error("Error sending request:", error);
      if (msgArea) {
        setMsgContent("<p style='color: red;'> Error Occured! </p>");
      }
    }
  }

//###############################################################################
//###############################################################################
  const [username, SetUsername] = useState("");
  const [password, SetPassword] = useState("");

  const HandleRegisteration = async (event) => {
    event.preventDefault();
    let msgArea = document.getElementById('msg_popup');

    try {
      const response = await fetch(`http://${GetBackendHost()}/admin/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          {
            "username": username,
            "password": password,
          }
        ),
        credentials: 'include',
      });

      // get the response output from the above fetch call
      const data = await response.text();
      console.log("Server Response:", data);
      
      if (data === "Admin Added Successfully!") {
        if (msgArea) {
          setMsgContent("<p style='color: green;'>Registration Successful!</p>");
        }

        SetUsername("")
        SetPassword("")
        getAdmins()
      } else {
        if (msgArea) {
          setMsgContent("<p style='color: green;'>Registration Failed!</p>");
        }
      }
    } catch (error) {
      console.error("Error sending request:", error);
      if (msgArea) {
        setMsgContent("<p style='color: red;'> Error Occured! </p>");
      }
    }
  }

  const [admins, setAdmins] = useState([]);
  async function getAdmins() {
    try {
      const response = await fetch(`http://${GetBackendHost()}/admin/fetch_admins`, {
        method: "GET",
        credentials: 'include'
      });

      const data = await response.json();
      
      if (data) {
        setAdmins(data)
      }
    } catch (error) {
      console.error("Error sending request:", error);
    }
  };

  async function removeAdmin(username) {
    let msgArea = document.getElementById('msg_popup');

    try {
      const response = await fetch(`http://${GetBackendHost()}/admin/remove_admin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          {
            "username": username,
          }
        ),
        credentials: 'include'
      });

      const data = await response.json();
      
      if (data && data.acknowledge) {
        if (msgArea) {
          setMsgContent("<p style='color: green;'>" + data.message + "</p>");
        }
        getAdmins()
      } else {
        if (msgArea) {
          setMsgContent("<p style='color: red;'>" + data.message + "</p>");
        }
      }
    } catch (error) {
      console.error("Error sending request:", error);
      if (msgArea) {
        setMsgContent("<p style='color: red;'> Error Occured! </p>");
      }
    }
  };

//###############################################################################
//###############################################################################

  const [file, setFile] = useState(null);
  const [files, setFiles] = useState([]);

  async function fetchUploads() {
    try {
      const response = await fetch(`http://${GetBackendHost()}/admin/get_uploads`, {
        method: "GET",
        credentials: 'include'
      });

      const data = await response.json();
      
      if (data) {
        console.log(data)
        setFiles(data);
      }
    } catch (error) {
      console.error("Error sending request:", error);
    }
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (selectedFile && selectedFile.type !== "application/zip" && !selectedFile.name.endsWith(".zip")) {
      alert("Only ZIP files are allowed.");
      e.target.value = ""; // reset input
      setFile(null);
    } else {
      setFile(selectedFile);
    }
  };

  const uploadFile = async (e) => {
    e.preventDefault();

    if (!file) return alert("Please select a ZIP file.");

    const formData = new FormData();
    formData.append("file", file);

    let msgArea = document.getElementById('msg_popup');

    try {
      const response = await fetch(`http://${GetBackendHost()}/admin/upload`, {
        method: "POST",
        body: formData,
        credentials: 'include'
      });

      const data = await response.json();
      
      if (data && data.acknowledge) {
        if (msgArea) {
          setMsgContent("<p style='color: green;'>" + data.message + "</p>");
        }
        
        await fetchUploads();
      } else {
        if (msgArea) {
          setMsgContent("<p style='color: red;'>" + data.message + "</p>");
        }
      }
    } catch (error) {
      console.error("Error sending request:", error);
      if (msgArea) {
        setMsgContent("<p style='color: red;'> Error Occured! </p>");
      }
    }
  };

  async function deleteFile(file) {
    let msgArea = document.getElementById('msg_popup');
    if (window.confirm(`Are you sure you want to delete this file?`)) {
      showPasswordPrompt(async (password) => {
        if (password !== null) {
          try {
            const response = await fetch(`http://${GetBackendHost()}/admin/delete_file`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                "filename": file,
                "password": password,
              }),
              credentials: 'include'
            });
      
            const data = await response.json();
            
            if (data && data.acknowledge) {
              if (msgArea) {
                setMsgContent("<p style='color: green;'>" + data.message + "</p>");
              }
              await fetchUploads();
            } else {
              if (msgArea) {
                setMsgContent("<p style='color: red;'>" + data.message + "</p>");
              }
            }
          } catch (error) {
            console.error("Error sending request:", error);
            if (msgArea) {
              setMsgContent("<p style='color: red;'> Error Occured! </p>");
            }
          }
        } else {
          // User cancelled password input
          console.log("Password prompt cancelled");
        }
      });
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
    setMsgContent("")

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
    if (tab_name === "admins") {
      getAdmins()
    }
    if (tab_name === "upload") {
      await fetchUploads();
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
                className={`nav-link ${activeTab === "admins" ? "active" : ""}`}
                style={{ fontSize: "1.5rem", padding: "0.25rem 0.5rem" }}
                onClick={() => ChangeTab("admins")}
              >
                Admins
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
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "upload" ? "active" : ""}`}
                style={{ fontSize: "1.5rem", padding: "0.25rem 0.5rem" }}
                onClick={() => ChangeTab("upload")}
              >
                Upload
              </button>
            </li>
          </ul>

          <div className="tab-content mt-4">
            <>
              {activeTab === "users" && (
                <div className="users-tab">
                  {/* Search Bar */}
                  <div className="mb-4">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search users by username..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  {/* User Cards */}
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
                  {/* Search Bar */}
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
                      style={{ maxWidth: '400px' }}
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
                            style={{
                              fontSize: "1.25rem",
                              maxHeight: "150px",
                              overflowY: "auto",
                              paddingRight: "8px"
                            }}
                            className="card-text small mt-2"
                          >
                            {challenge.description}
                          </p>

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
                        
                        <div className='container'>
                          <div className="d-flex justify-content-between pt-2">
                            <button
                              className="btn btn-outline-info"
                              onClick={() => EditChallenge(challenge._id)}
                            >
                              <i className="bi bi-pencil me-2"></i> Edit
                            </button>

                            <button
                              className="btn btn-outline-danger"
                              onClick={() => DeleteChallenge(challenge._id)}
                            >
                              <i className="bi bi-trash me-2"></i> Delete
                            </button>
                          </div>
                        </div>
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

            {activeTab === "admins" && (
              <>
              <div className="container">
                <div className="row justify-content-center">
                  <div className="col-md-6">
                    <div className="card shadow">
                      <div className="card-body">
                        <h3 className="card-title text-center mb-4">Register</h3>
                        <div id='msg_popup'>
                        </div>
                        <form onSubmit={HandleRegisteration}>
                          <div className="mb-3">
                            <input
                              type="text"
                              className="form-control"
                              id="username"
                              placeholder="Enter username"
                              value={username}
                              onChange={(e) => SetUsername(e.target.value)}
                            />
                          </div>
    
                          <div className="mb-3">
                            <input
                              type="password"
                              className="form-control"
                              id="password"
                              placeholder="Enter password"
                              value={password}
                              onChange={(e) => SetPassword(e.target.value)}
                            />
                          </div>
    
                          <div className="d-grid">
                            <button type="submit" className="btn btn-primary">
                              Register Admin
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="container mt-4 d-flex justify-content-center align-items-center">
                <div className="row w-100 justify-content-center">
                  <h4>Current Admins</h4>
                  <ul className="list-group w-auto">
                    {admins.map((admin, index) => (
                      <li
                        key={index}
                        className="list-group-item d-flex justify-content-between align-items-center px-3 py-2"
                        style={{ fontSize: '0.9rem', minWidth: '250px', maxWidth: '400px' }}
                      >
                        <span className="text-muted">{admin.username}</span>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => removeAdmin(admin.username)}
                        >
                          <i className="bi bi-trash"></i> Delete
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              </>
            )}

            {activeTab === "upload" && (
              <>
              <div className="container">
                <div className="row justify-content-center">
                  <div className="col-md-6">
                    <div className="card shadow">
                      <div className="card-body">
                        <h3 className="card-title text-center mb-4">Upload Challenge</h3>
                        <div id='msg_popup'>
                        </div>
                        <form onSubmit={uploadFile}>
                          <div className="mb-3">
                            <input
                              type="file"
                              className="form-control"
                              accept=".zip"
                              onChange={handleFileChange}
                            />
                          </div>
                          <div className="d-grid">
                            <button type="submit" className="btn btn-primary">
                              Upload
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <style>
                {`
                  .custom-hover-dark {
                    transition: color 0.2s ease-in-out, transform 0.2s ease-in-out, font-weight 0.2s ease-in-out;
                  }
                  .custom-hover-dark:hover {
                    color: rgb(36, 34, 34) !important;
                    transform: scale(1.15);
                  }
                `}
              </style>

              <div className="container mt-2">
                <h3 style={{padding: '5px'}}>Current Uploads</h3>
                <div className="row justify-content-center">
                  <ul className="list-group w-auto">
                    {files.map((file, index) => (
                      <li
                        key={index}
                        className="list-group-item d-flex justify-content-between align-items-center px-3 py-2"
                        style={{ fontSize: '0.9rem', minWidth: '300px', maxWidth: '600px' }}
                      >
                        <a
                          href={`http://${GetBackendHost()}/download/${file}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-decoration-none text-muted flex-grow-1 custom-hover-dark"
                          style={{ marginRight: '1rem' }}
                        >
                          {file}
                        </a>
                        <button
                          className="btn btn-sm btn-outline-danger flex-shrink-0"
                          onClick={() => deleteFile(file)}
                        >
                          <i className="bi bi-trash"></i> Delete
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              </>
            )}
          </div>
        </div>

      </header>
    </div>
  );
}