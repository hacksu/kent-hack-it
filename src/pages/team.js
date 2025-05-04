import '../App.css';
import { useState, useEffect } from 'react';
import Navbar from '../components/navbar.js'

const Team = ({ onShowProfile, profileUsername }) => {
  const [joinedTeamName, SetJoinedTeamName] = useState("");

  const [teamName, SetTeamName] = useState("");
  const [newTeamName, SetNewTeamName] = useState(teamName);

  const [teamData, SetTeamData] = useState(null);
  const [isLeader, SetIsLeader] = useState(false);

  const [reqTeamName, SetReqTeamName] = useState("");
  
  const [reqTeamMsg, SetReqTeamMsg] = useState("");
  const [teamUpdateMsg, SetTeamUpdateMsg] = useState("");
  const [teamCreateMsg, SetTeamCreateMsg] = useState("");

  /*
      "// eslint-disable-next-line" is for warning suppression!
  */

  async function GetProfileDetails() {
    try {
      const response = await fetch("http://localhost:4000/user/info", {
        method: "GET",
        credentials: 'include'  // ensures cookies are sent
      });

      // { username, team, is_leader }
      const data = await response.json();
      if (data === null) {
        SetJoinedTeamName("None");
      } else {
        SetJoinedTeamName(data.team);
        // leaders can manage the team | non-leaders view-only
        SetIsLeader(data.is_leader);
      }
    } catch (error) {
      console.error("Error sending request:", error);
    }
  }

  // runs periodically
  useEffect(() => {
    GetProfileDetails();
    // eslint-disable-next-line
  }, []); // <-- [] means run once on page-load
  
  // used to show leaders their team so they can manage it
  // and used to allow team-members to view their team stats
  async function GetTeamDetails() {
    try {
      const response = await fetch("http://localhost:4000/team/info", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "team_name": joinedTeamName
          // eslint-disable-next-line
        }),
        credentials: 'include'  // ensures cookies are sent
      });

      // { name, team_leader, members, completions }
      const data = await response.json();
      SetTeamData(data);
    } catch (error) {
      console.error("Error sending request:", error);
    }
  }

  useEffect(() => {
    if (joinedTeamName !== "None" && joinedTeamName !== "") GetTeamDetails();
    // eslint-disable-next-line
  }, [joinedTeamName]); // executes when joinedTeamName changes state

  const SendJoinRequest = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch("http://localhost:4000/team/request", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "sender": profileUsername,
          "team_name": reqTeamName
        }),
        credentials: 'include'  // ensures cookies are sent
      });

      const data = await response.json();
      SetReqTeamMsg(data.message);
    } catch (error) {
      console.error("Error sending request:", error);
    }
  };
  const CreateNewTeam = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch("http://localhost:4000/team/create", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "team_name": teamName
        }),
        credentials: 'include'  // ensures cookies are sent
      });

      const data = await response.json();
      SetTeamCreateMsg(data.message);
    } catch (error) {
      console.error("Error sending request:", error);
    }
  };
  const UpdateTeamName = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch("http://localhost:4000/team/update", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "team_name": newTeamName
        }),
        credentials: 'include'  // ensures cookies are sent
      });

      const data = await response.json();
      if (data) {
        // if we get a message back refetch profile and team details
        SetTeamUpdateMsg(data.message);
        await GetProfileDetails();
        await GetTeamDetails();
      }
    } catch (error) {
      console.error("Error sending request:", error);
    }
  };

  const RemoveMember = async (event) => {
    event.preventDefault();
  };
  const AddMember = async (event) => {
    event.preventDefault();
  };

  return (
    <div className="App">
      <Navbar />
      <header className="App-header">
        <div className="container mt-5">
          <div className="row justify-content-center">

            {/* Show the Request Join Team Response */}
            { reqTeamMsg === "Request Sent Successfully!" ? (
              <h3 style={{ color: "green" }}>
                {reqTeamMsg}
              </h3>
            ) : (
              <h3 style={{ color: "red" }}>
                {reqTeamMsg}
              </h3>
            )}

            {/* Show the Team Creation Response */}
            { teamCreateMsg === "Team created Successfully!" ? (
              <h3 style={{ color: "green" }}>
                {teamCreateMsg}
              </h3>
            ) : (
              <h3 style={{ color: "red" }}>
                {teamCreateMsg}
              </h3>
            )}

            {/* Show the Team Update Response */}
            { teamUpdateMsg.toLowerCase().includes("success") ? (
              <h3 style={{ color: "green" }}>
                {teamUpdateMsg}
              </h3>
            ) : (
              <h3 style={{ color: "red" }}>
                {teamUpdateMsg}
              </h3>
            )}

            <div className="col-md-6">
              <div className="card shadow">
                <div className="card-body">
                  <h3 className="card-title text-center mb-4">Team</h3>
                  {/*
                      "<></>"  This is used to chain complex HTML blocks
                               and other ReactJS conditioning
                  */}
                  <>
                    {joinedTeamName === "None" ? (
                      <>
                        {/*
                            A user can either request to join
                            a team or create one
                        */}
                        <div>
                            <div className="mb-3">
                              <input
                                type="text"
                                className="form-control"
                                id="teamName"
                                placeholder="Enter team name"
                                value={teamName}
                                onChange={(e) => SetTeamName(e.target.value)}
                              />
                            </div>
  
                            <div className="d-grid">
                              <button type="submit"
                              className="btn btn-primary"
                              onClick={CreateNewTeam}>
                                Create Team
                              </button>
                            </div>
                        </div>
                        <hr />
  
                        <div>
                          <div className="mb-3">
                            <input
                              type="text"
                              className="form-control"
                              id="reqTeamName"
                              placeholder="Enter team name"
                              value={reqTeamName}
                              onChange={(e) => SetReqTeamName(e.target.value)}
                            />
                          </div>
  
                          <div className="d-grid">
                            <button
                              className="btn btn-primary"
                              onClick={() => SendJoinRequest(reqTeamName)}
                            >
                              Request Join Team
                            </button>
                          </div>
                        </div>
                        <hr />
                      </>
                    ) : teamData ? (
                      isLeader === true ? (
                        <>
                          {/*
                              A Team-Leader can Update Team Details:
                                - Add/Remove Members
                                - Change Team Name
                          */}

                          <div className="container mt-4">
                            <div className="card shadow">
                              <div className="card-body">
                                <h3 className="card-title text-center mb-3">Team: {teamData.name}</h3>
    
                                <div className="mb-4">
                                  <label className="form-label">Change Team Name:</label>
                                  <div className="input-group">
                                    <input
                                      type="text"
                                      className="form-control"
                                      value={newTeamName}
                                      onChange={(e) => SetNewTeamName(e.target.value)}
                                    />
                                    <button
                                      className="btn btn-primary"
                                      onClick={UpdateTeamName}
                                    >
                                      Update
                                    </button>
                                  </div>
                                </div>
                                <hr />
    
                                <p><strong>Team Leader:</strong> {teamData.team_leader}</p>
    
                                <div className="mb-3">
                                  <h5>Members:</h5>
                                  <ul className="list-group">
                                    {teamData.members && teamData.members.length > 0 ? (
                                      teamData.members.map((member, index) => (
                                        <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                                          {member}
                                          <button
                                            className="btn btn-sm btn-danger"
                                            onClick={() => RemoveMember(member)}
                                            disabled={member === teamData.team_leader}
                                          >
                                            Remove
                                          </button>
                                        </li>
                                      ))
                                    ) : (
                                      <li className="list-group-item text-muted">No members</li>
                                    )}
                                  </ul>
                                </div>
                                <hr />
    
                                <div>
                                  <h5>Completions:</h5>
                                  <ul className="list-group">
                                    {teamData.completions && teamData.completions.length > 0 ? (
                                      teamData.completions.map((challenge, index) => (
                                        <li key={index} className="list-group-item">
                                          {challenge}
                                        </li>
                                      ))
                                    ) : (
                                      <li className="list-group-item text-muted">No completions yet</li>
                                    )}
                                  </ul>
                                </div>
                                <hr />
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          {/*
                              A team-member can ONLY view team details
                          */}
                          <div className="container mt-4">
                            <div className="card shadow">
                              <div className="card-body">
                                <h3 className="card-title text-center mb-3">{teamData.name}</h3>
    
                                <p><strong>Team Leader:</strong> {teamData.team_leader}</p>
    
                                <div className="mb-3">
                                  <h5>Members:</h5>
                                  <ul className="list-group">
                                    {teamData.members && teamData.members.length > 0 ? (
                                      teamData.members.map((member, index) => (
                                        <li key={index} className="list-group-item">
                                          {member}
                                        </li>
                                      ))
                                    ) : (
                                      <li className="list-group-item text-muted">No members</li>
                                    )}
                                  </ul>
                                </div>
    
                                <div>
                                  <h5>Completions:</h5>
                                  <ul className="list-group">
                                    {teamData.completions && teamData.completions.length > 0 ? (
                                      teamData.completions.map((challenge, index) => (
                                        <li key={index} className="list-group-item">
                                          {challenge}
                                        </li>
                                      ))
                                    ) : (
                                      <li className="list-group-item text-muted">No completions yet</li>
                                    )}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
                      )
                    ) : (
                      <p className="text-center text-muted">Loading team data...</p>
                    )}
                  </>
  
                  <div className="d-flex justify-content-center gap-4 mt-3">
                    <button
                      className="btn btn-secondary"
                      onClick={onShowProfile}
                    >
                      Go to Profile Page
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
    </div>
  );  
};
export default Team;