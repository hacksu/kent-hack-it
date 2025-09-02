import React, { useState, useEffect } from 'react';
import '../App.css';
import Navbar from '../components/navbar.js';

export function RatingPage() {
  const [profileData, SetProfileData] = useState(null);
  const [unratedChallenges, setUnratedChallenges] = useState({});
  const [challengeDetails, setChallengeDetails] = useState({});
  const [ratings, setRatings] = useState({});  // Store ratings per challenge

  async function GetProfileDetails() {
    try {
      const response = await fetch(`/api/user/info`, {
        method: "GET",
        credentials: 'include'  // ensures cookies are sent
      });

      const data = await response.json();
      if (data) {
        SetProfileData(data);

        let unratedChalls = data.completions;

        if (data.user_rates) {
          unratedChalls = unratedChalls.filter(c => !data.user_rates.includes(c.id));
        }
        setUnratedChallenges(unratedChalls);
      }
    } catch (error) {
      console.error("Error sending request:", error);
    }
  }

  useEffect(() => {
    GetProfileDetails();
  }, []); // runs once when the component mounts

  async function GetChallengeDetails(challengeID) {
    try {
      const response = await fetch(`/api/ctf/challenge`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ "challenge_id": challengeID }),
        credentials: 'include'  // ensures cookies are sent
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error sending request:", error);
    }
  }

  // Fetch the details for each challenge when the component mounts
  const fetchChallengeData = async (challengeID) => {
    const data = await GetChallengeDetails(challengeID);
    if (data) {
      setChallengeDetails((prevData) => ({
        ...prevData,
        [challengeID]: data
      }));
    }
  };

  // Handle rating change for each challenge
  const handleRatingChange = (challengeID, newRating) => {
    setRatings((prevRatings) => ({
      ...prevRatings,
      [challengeID]: newRating,
    }));
  };

  // Handle form submission for each challenge
  const handleSubmit = async (event, challengeID) => {
    event.preventDefault();
    let msgArea = document.getElementById('msg_popup');

    try {
      const response = await fetch(`/api/ctf/rate-challenge`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          "challenge_id": challengeID,
          "rating": ratings[challengeID],
        }),
        credentials: 'include'  // ensures cookies are sent
      });

      const data = await response.json();
      if (data) {
        if (msgArea) {
          msgArea.innerHTML = "<p style='color: green;'>" + data.message + "</p>";
          GetProfileDetails();
        }
      } else {
        if (msgArea) {
          msgArea.innerHTML = "<p style='color: red;'>Error Rating Challenge!</p>";
        }
      }
    } catch (error) {
      console.error("Error sending request:", error);
      if (msgArea) {
        msgArea.innerHTML = "<p style='color: red;'>Error Rating Challenge!</p>";
      }
    }
  };

  return (
    <div className="App page-background">
      <Navbar />
      <div className="container mt-4">
        <div id='msg_popup' style={{ fontSize: "2rem", fontWeight: 'bold' }}>
        </div>
        <h2 className="mb-3">Rating Page</h2>
        <div className="row justify-content-center">
          {(profileData && unratedChallenges.length > 0) ? (
            <>
              {unratedChallenges.map((challenge, idx) => (
                <div
                  className="col-12 col-sm-6 col-md-3 col-lg-3 mb-3"
                  key={idx}
                  style={{ maxWidth: '250px' }}
                >
                  <div className="card h-100 shadow-sm p-2">
                    <div className="card-body p-2">
                      {/* Fetch challenge details if not already loaded */}
                      {challengeDetails[challenge.id] ? (
                        <>
                        <h6 className="card-title mb-1" style={{ color: '#2e5c87' }}>{challengeDetails[challenge.id].name}</h6>
                          <small className="text-muted">
                            {challengeDetails[challenge.id].category} | Difficulty: {challengeDetails[challenge.id].difficulty}
                          </small>
                          <p className="card-text small mt-2" style={{ color: '#333' }}>{challengeDetails[challenge.id].description}</p>
                          <p className="card-text small mb-1" style={{ color: '#333' }}>
                            ⭐ {challengeDetails[challenge.id].rating} / 5
                          </p>

                          <form onSubmit={(event) => handleSubmit(event, challenge.id)}>
                            <div>
                              <label htmlFor={`rating-${challenge.id}`} style={{ color: '#2e5c87', fontWeight: '500' }}>Rating (1-5): </label>
                              <select
                                id={`rating-${challenge.id}`}
                                className="form-control form-control-sm mt-1"
                                value={ratings[challenge.id] || "select rating"} // default rating if not set
                                onChange={(e) => handleRatingChange(challenge.id, e.target.value)}
                              >
                                {["select rating", 1, 2, 3, 4, 5].map((value) => (
                                  <option key={value} value={value}>
                                    {value}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <button
                              className="btn btn-sm btn-primary mt-2"
                              type="submit"
                            >
                              Submit Rating
                            </button>
                          </form>
                        </>
                      ) : (
                        <>
                          <p>Loading Challenge Info. . .</p>
                          {fetchChallengeData(challenge.id)} {/* Fetch the data on load */}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <p>
              As you complete challenges, you can come here
              to optionally leave a rating for the challenges
              you've completed!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}