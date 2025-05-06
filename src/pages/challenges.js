import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../App.css';
import Navbar, { VerifySession, LogoutUser, GetBackendHost } from '../components/navbar.js';

export function Challenges() {
  const [challenges, setChallenges] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const challengesPerPage = 10;

  const [joinedTeamName, SetJoinedTeamName] = useState("");
  const [profileData, SetProfileData] = useState(null);
  const [teamData, SetTeamData] = useState(null);

  const [showSelfCompleted, setShowCompleted] = useState(false);

  async function GetProfileDetails() {
    try {
      const response = await fetch(`http://${GetBackendHost()}/user/info`, {
        method: "GET",
        credentials: 'include'  // ensures cookies are sent
      });

      // { username, email, completions, team, is_leader }
      const data = await response.json();
      if (data === null) {
        SetJoinedTeamName("None");
      } else {
        SetJoinedTeamName(data.team);
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
      const response = await fetch(`http://${GetBackendHost()}/team/info`, {
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
    if (joinedTeamName !== "None" && joinedTeamName !== "") GetTeamDetails();
    // eslint-disable-next-line
  }, [joinedTeamName]); // executes when joinedTeamName changes state

  async function SelfFilterChallenges(data) {
    if (!profileData) {
      console.log("No Profile Data!")
      return data;
    }

    if (profileData.completions.length === 0) {
      console.log("No Completions on Profile!")
      return data;
    }

    const filteredChallenges = [];

    // iterate over data (Array of all challenges in the DB)
    for (const challenge of data) {
      const targetName = challenge.name.replaceAll(' ', '_');
      const exists = profileData.completions.find(chall => chall.name === targetName);
      // if the challenge entry doesnt exist in profileData push it to the Array
      if (!exists) {
        filteredChallenges.push(challenge);
      } else {
        console.log("Completed: ", challenge.name)
      }
    }

    // returns an Array of challenge entries
    // that the user has not completed
    return filteredChallenges;
  }
  async function TeamFilterChallenges(data) {
    if (!teamData) {
      return data;
    }

    if (teamData.completions.length === 0) {
      return data;
    }

    const filteredChallenges = [];

    // iterate over data (Array of all challenges in the DB)
    for (const challenge of data) {
      const targetName = challenge.name.replaceAll(' ', '_');
      const exists = teamData.completions.find(chall => chall.name === targetName);
      // if the challenge entry doesnt exist in teamData push it to the Array
      if (!exists) {
        filteredChallenges.push(challenge);
      }
    }

    // returns an Array of challenge entries
    // that the team has not completed
    return filteredChallenges;
  }

  async function FetchChallenges() {
    try {
      const response = await fetch(`http://${GetBackendHost()}/challenges`);
      const data = await response.json();

      const teamFilteredData = await TeamFilterChallenges(data);
      const selfFilteredData = await SelfFilterChallenges(data);

      // when a user has no team they always filter out challenges
      // theyve completed
      if (!teamData || showSelfCompleted) {
        console.log("Heres your unfinished business!: ", selfFilteredData)
        setChallenges(selfFilteredData);
      } else {
        setChallenges(teamFilteredData);
      }
    } catch (err) {
      console.error('Failed to fetch challenges:', err);
    }
  }

  useEffect(() => {
    async function Verify() {
      const authenticated = await VerifySession();
      if (authenticated === false) {
        LogoutUser();
      }
    }
    Verify();
  }, [challenges]); // run on state change
  
  const indexOfLast = currentPage * challengesPerPage;
  const indexOfFirst = indexOfLast - challengesPerPage;
  const currentChallenges = challenges.slice(indexOfFirst, indexOfLast);

  const nextPage = () => {
    if (indexOfLast < challenges.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const toggleFilter = () => {
    setShowCompleted(prev => !prev);
    FetchChallenges();
  };

  useEffect(() => {
    FetchChallenges()
  }, [profileData]);

  return (
    <div className="App">
      <Navbar />
      <div className="container mt-4">
        <h2 className="mb-3">Challenges</h2>

        { teamData && (
        <div className="container mb-3">
          <h5>{showSelfCompleted ?
            'Showing: Team unclaimed Challenges' :
            'Showing: Your unclaimed Challenges'}
          </h5>

          <button className="btn btn-sm btn-secondary" onClick={toggleFilter}>
            {showSelfCompleted ? 'Filter Self Completions' : 'Filter Team Completions'}
          </button>
        </div>
        )}

        {/* Buttons at the top */}
        <div className="d-flex justify-content-center gap-4 mb-3">
          <button
            className="btn btn-sm btn-primary mr-2"
            onClick={prevPage}
            disabled={currentPage === 1}
          >
            ← Prev
          </button>
          <button
            className="btn btn-sm btn-primary"
            onClick={nextPage}
            disabled={indexOfLast >= challenges.length}
          >
            Next →
          </button>
        </div>

        <div className="row justify-content-center">
          {currentChallenges.map((challenge, idx) => (
            <div
              className="col-12 col-sm-6 col-md-3 col-lg-3 mb-3"
              key={idx}
              style={{ maxWidth: '250px' }}
            >
              <Link
                to={`/challenge?id=${challenge._id}`}
                className="text-decoration-none text-dark"
              >
                <div className="card h-100 shadow-sm p-2">
                  <div className="card-body p-2">
                    <h6 className="card-title mb-1">{challenge.name}</h6>
                    <small className="text-muted">
                      {challenge.category} | Difficulty: {challenge.difficulty}
                    </small>
                    <p className="card-text small mt-2">{challenge.description}</p>
                    <p className="card-text small mb-1">
                      ⭐ {challenge.rating.toFixed(1)} / 5
                    </p>
                    <p className="card-text small">
                      Points: {challenge.points}
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}