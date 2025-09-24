import '../App.css';
import { useState, useEffect } from 'react';
import Navbar, { VerifyAuth } from '../components/navbar.js'

import LeaderView from '../components/leader_view.js';
import MemberView from '../components/member_view.js';

import Stats from '../components/stats.js';

const Team = () => {
    const [joinedTeamName, SetJoinedTeamName] = useState("");
    const [profileData, SetProfileData] = useState(null);

    const [teamName, SetTeamName] = useState("");
    const [newTeamName, SetNewTeamName] = useState(teamName);

    const [teamData, SetTeamData] = useState(null);
    const [isLeader, SetIsLeader] = useState(false);

    const [reqTeamName, SetReqTeamName] = useState("");
    const [availableTeams, SetAvailableTeams] = useState([]);

    const [reqTeamMsg, SetReqTeamMsg] = useState("");
    const [teamUpdateMsg, SetTeamUpdateMsg] = useState("");
    const [teamCreateMsg, SetTeamCreateMsg] = useState("");

    const [isAuth, SetAuth] = useState(false);

    useEffect(() => {
        async function Verify() {
            const authenticated = await VerifyAuth();
            SetAuth(authenticated);
            if (authenticated === false) {
                window.location.href = "/login";
            }
        }
        Verify();
    }, []); // run on-load

    const onShowProfile = () => {
        window.location.href = "/profile?mode=0";
    };

    /*
        "// eslint-disable-next-line" is for warning suppression!
    */

    async function GetProfileDetails() {
        try {
            const response = await fetch(`/api/user/info`, {
                method: "GET",
                credentials: 'include'  // ensures cookies are sent
            });

            // { username, email, completions, team, is_leader }
            const data = await response.json();
            if (data === null) {
                SetJoinedTeamName("None");
            } else {
                SetJoinedTeamName(data.team);
                // leaders can manage the team | non-leaders view-only
                SetIsLeader(data.is_leader);
                SetProfileData(data);
            }
        } catch (error) {
            console.error("Error sending request:", error);
        }
    }

    useEffect(() => {
        GetProfileDetails();
        // eslint-disable-next-line
    }, []); // <-- [] means run once on page-load

    // used to show leaders their team so they can manage it
    // and used to allow team-members to view their team stats
    async function GetTeamDetails() {
        try {
            const response = await fetch(`/api/team/info`, {
                method: "GET",
                credentials: 'include'  // ensures cookies are sent
            });

            // { name, team_leader, members, completions, join_requests }
            const data = await response.json();
            SetTeamData(data);
        } catch (error) {
            console.error("Error sending request:", error);
        }
    }

    useEffect(() => {
        if (joinedTeamName !== "None" && joinedTeamName !== "") {
            GetTeamDetails();
        } else if (joinedTeamName === "None") {
            // If user doesn't have a team, fetch available teams for joining
            GetAvailableTeams();
        }
        // eslint-disable-next-line
    }, [joinedTeamName]); // executes when joinedTeamName changes state

    const GetAvailableTeams = async () => {
        try {
            const response = await fetch(`/api/team/list`, {
                method: "GET",
                credentials: 'include'
            });

            const teams = await response.json();
            SetAvailableTeams(teams);
        } catch (error) {
            console.error("Error fetching teams:", error);
            SetAvailableTeams([]);
        }
    };

    const SendJoinRequest = async () => {
        try {
            const response = await fetch(`/api/team/request`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "team_name": reqTeamName
                }),
                credentials: 'include'  // ensures cookies are sent
            });

            const data = await response.json();
            SetReqTeamMsg(data.message);
            // Refresh available teams after sending a request
            GetAvailableTeams();
        } catch (error) {
            console.error("Error sending request:", error);
        }
    };
    const CreateNewTeam = async () => {
        try {
            const response = await fetch(`/api/team/create`, {
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

            // auto redirect
            setTimeout(() => {
                window.location.href = "/profile?mode=1";
            }, 300);
        } catch (error) {
            console.error("Error sending request:", error);
        }
    };
    const UpdateTeamName = async () => {
        try {
            const response = await fetch(`/api/team/update`, {
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

    return (
        <>
            {isAuth === true ? (
                <>
                    <div className="App">
                        <Navbar />
                        <header className="App-header">
                            <div className="container mt-5">
                                <div className="row justify-content-center">

                                    {/* Show the Request Join Team Response */}
                                    {reqTeamMsg === "Request Sent Successfully!" ? (
                                        <h3 style={{ color: "green" }}>
                                            {reqTeamMsg}
                                        </h3>
                                    ) : (
                                        <h3 style={{ color: "red" }}>
                                            {reqTeamMsg}
                                        </h3>
                                    )}

                                    {/* Show the Team Creation Response */}
                                    {teamCreateMsg === "Team created Successfully!" ? (
                                        <h3 style={{ color: "green" }}>
                                            {teamCreateMsg}
                                        </h3>
                                    ) : (
                                        <h3 style={{ color: "red" }}>
                                            {teamCreateMsg}
                                        </h3>
                                    )}

                                    {/* Show the Team Update Response */}
                                    {teamUpdateMsg.toLowerCase().includes("success") ? (
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
                                                                    <select
                                                                        className="form-select"
                                                                        id="reqTeamName"
                                                                        value={reqTeamName}
                                                                        onChange={(e) => SetReqTeamName(e.target.value)}
                                                                    >
                                                                        <option value="">Select a team to join...</option>
                                                                        {availableTeams.map((team, index) => (
                                                                            <option key={index} value={team.name}>
                                                                                {team.name} ({team.memberCount}/3 members, {team.spotsLeft} spots left)
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                    {availableTeams.length === 0 && (
                                                                        <small className="text-muted">
                                                                            No teams available to join. Create a new team instead!
                                                                        </small>
                                                                    )}
                                                                </div>

                                                                <div className="d-grid">
                                                                    <button
                                                                        className="btn btn-primary"
                                                                        onClick={SendJoinRequest}
                                                                        disabled={!reqTeamName}
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
                                                                {/* TEAM-LEADER VIEW */}
                                                                <LeaderView
                                                                    TEAM_DATA={teamData}
                                                                    UpdateTeamName={() => UpdateTeamName()}
                                                                    newTeamName={newTeamName}
                                                                    SetNewTeamName={SetNewTeamName}
                                                                    SetTeamUpdateMsg={SetTeamUpdateMsg}
                                                                />
                                                            </>
                                                        ) : (
                                                            <>
                                                                {/* MEMBER-LEADER VIEW */}
                                                                <MemberView TEAM_DATA={teamData} />
                                                            </>
                                                        )
                                                    ) : (
                                                        <p className="text-center text-muted">Loading team data...</p>
                                                    )}
                                                </>

                                                <Stats TEAM_DATA={teamData} PROFILE_DATA={profileData} />
                                                <hr />

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
                </>
            ) : (
                <>
                    <h1>Page Loading. . .</h1>
                </>
            )}
        </>
    );
};
export default Team;