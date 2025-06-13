import React, { useState, useEffect } from 'react';
import '../App.css';
import Navbar, { GetBackendHost } from '../components/navbar.js';

export function RatingPage() {
  const [profileData, SetProfileData] = useState(null);
  const [unratedChallenges, setUnratedChallenges] = useState({});
  const [challengeDetails, setChallengeDetails] = useState({});
  const [ratings, setRatings] = useState({});  // Store ratings per challenge

  async function GetProfileDetails() {
    try {
      const response = await fetch(`http://${GetBackendHost()}/user/info`, {
        method: "GET",
        credentials: 'include'  // ensures cookies are sent
      });

      const data = await response.json();
      if (data) {
        SetProfileData(data);

        let unratedChalls = data.completions;

        if (data.user_rates) {
          unratedChalls = unratedChalls.filter(c => !data.user_rates.includes(c.name.replace(/_/g, " ")));
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

  async function GetChallengeDetails(challengeName) {
    try {
      const response = await fetch(`http://${GetBackendHost()}/challenge`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ "challenge_name": challengeName }),
        credentials: 'include'  // ensures cookies are sent
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error sending request:", error);
    }
  }

  // Fetch the details for each challenge when the component mounts
  const fetchChallengeData = async (challengeName) => {
    const data = await GetChallengeDetails(challengeName);
    setChallengeDetails((prevData) => ({
      ...prevData,
      [challengeName]: data
    }));
  };

  // Handle rating change for each challenge
  const handleRatingChange = (challengeName, newRating) => {
    setRatings((prevRatings) => ({
      ...prevRatings,
      [challengeName]: newRating,
    }));
  };

  // Handle form submission for each challenge
  const handleSubmit = async (event, challengeName) => {
    try {
      const response = await fetch(`http://${GetBackendHost()}/rate-challenge`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          "challenge_name": challengeName,
          "rating": ratings[challengeName],
        }),
        credentials: 'include'  // ensures cookies are sent
      });

      const data = await response.json();
    } catch (error) {
      console.error("Error sending request:", error);
    }
  };

  return (
    <div className="App">
      <Navbar />
      <div className="container mt-4">
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
                      <h6 className="card-title mb-1">{challenge.name.replaceAll('_', ' ')}</h6>

                      {/* Fetch challenge details if not already loaded */}
                      {challengeDetails[challenge.name] ? (
                        <>
                          <small className="text-muted">
                            {challengeDetails[challenge.name].category} | Difficulty: {challengeDetails[challenge.name].difficulty}
                          </small>
                          <p className="card-text small mt-2">{challengeDetails[challenge.name].description}</p>
                          <p className="card-text small mb-1">
                            ⭐ {challengeDetails[challenge.name].rating} / 5
                          </p>

                          <form onSubmit={(event) => handleSubmit(event, challenge.name)}>
                            <div>
                              <label htmlFor={`rating-${challenge.name}`}>Rating (1-5): </label>
                              <select
                                id={`rating-${challenge.name}`}
                                value={ratings[challenge.name] || "select rating"} // default rating if not set
                                onChange={(e) => handleRatingChange(challenge.name, e.target.value)}
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
                          {fetchChallengeData(challenge.name)} {/* Fetch the data on load */}
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