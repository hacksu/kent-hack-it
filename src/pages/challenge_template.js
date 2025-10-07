import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Navbar, { VerifyAuth } from '../components/navbar.js';
import { SanitizeDescription } from '../components/purification.js';

export function ChallengeDetail() {
    const { search } = useLocation();
    const params = new URLSearchParams(search);
    const id = params.get('id');
    const [challenge, setChallenge] = useState(null);
    const [answer, setAnswer] = useState('');
    const [message, setMessage] = useState('');
    const [isAuth, SetAuth] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [hasRated, setHasRated] = useState(false);
    const [rating, setRating] = useState('');
    const [ratingMessage, setRatingMessage] = useState('');
    const [showRatingReminder, setShowRatingReminder] = useState(false);
    const [teamData, setTeamData] = useState(null);

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

    // Get profile details to check completion status
    const getProfileDetails = async () => {
        try {
            const response = await fetch(`/api/user/info`, {
                method: "GET",
                credentials: 'include'
            });
            const data = await response.json();
            if (data) {
                // Check if user has completed this challenge
                const completed = data.completions?.some(comp => comp.id === id);
                setIsCompleted(completed);
                
                // Check if user has already rated this challenge
                const rated = data.user_rates?.includes(id);
                setHasRated(rated);
                
                // Fetch team data if user has a team
                if (data.team && data.team !== "None") {
                    getTeamDetails();
                }
            }
        } catch (error) {
            console.error("Error getting profile details:", error);
        }
    };

    // Get team details to check team completion status
    const getTeamDetails = async () => {
        try {
            const response = await fetch(`/api/team/info`, {
                method: "GET",
                credentials: 'include'
            });
            const data = await response.json();
            setTeamData(data);
        } catch (error) {
            console.error("Error getting team details:", error);
        }
    };

    useEffect(() => {
        if (isAuth && id) {
            getProfileDetails();
        }
    }, [isAuth, id]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        async function FetchChallenge() {
            try {
                const response = await fetch(`/api/ctf/challenges`);
                const data = await response.json();
                let chall = data.find(challenge => challenge._id === id);

                // append anchor links to challenge description
                if (chall) {
                    if (Array.isArray(chall.hlinks) && chall.hlinks.length > 0) {
                        // Build anchor tags, one per line
                        const target = "https://ctf.hacksu.com/api/ctf/download/";

                        const links = chall.hlinks
                            .map(hlink => `<a href="${target + hlink}" target="_blank">${hlink}</a>`)
                            .join("<br/>");

                        // Append to description
                        chall.description = chall.description + "<br/><br/>Download Challenge Files Below:<br/>" + links;
                    }
                }

                setChallenge(chall);
            } catch (err) {
                console.error('Failed to fetch challenges:', err);
            }
        }
        FetchChallenge();
    }, [id]);

    // Handle rating submission
    const handleRatingSubmit = async (e) => {
        e.preventDefault();
        
        if (!rating || rating === 'select rating') {
            setRatingMessage('Please select a rating');
            return;
        }

        try {
            const response = await fetch(`/api/ctf/rate-challenge`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    "challenge_id": id,
                    "rating": parseInt(rating),
                }),
                credentials: 'include'
            });

            const data = await response.json();
            if (data) {
                setRatingMessage(data.message);
                setHasRated(true);
                setShowRatingReminder(false);
                // Refresh challenge data to show updated rating
                const challengeResponse = await fetch(`/api/ctf/challenges`);
                const challengeData = await challengeResponse.json();
                const updatedChallenge = challengeData.find(c => c._id === id);
                if (updatedChallenge) {
                    setChallenge(updatedChallenge);
                }
            } else {
                setRatingMessage('Error submitting rating');
            }
        } catch (error) {
            console.error("Error submitting rating:", error);
            setRatingMessage('Error submitting rating');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // send the flag over to the backend and validate if they
        // submitted the correct flag
        try {
            const response = await fetch(`/api/ctf/submit-flag`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "flag": answer,
                    "challenge_id": id,
                }),
                credentials: 'include'  // ensures cookies are sent
            });

            // null | { message }
            const data = await response.json();
            if (data) {
                setMessage(data.message);
                setAnswer('');
                // If correct flag, update completion status and show rating reminder
                if (data.message === 'Correct Flag!') {
                    setIsCompleted(true);
                    if (!hasRated) {
                        setShowRatingReminder(true);
                    }
                    // Refresh profile data
                    getProfileDetails();
                }
            } else {
                setMessage("Incorrect Flag!");
                setAnswer('');
            }
        } catch (error) {
            console.error("Error sending request:", error);
            setMessage("Error Submitting Flag.");
            setAnswer('');
        }
    };

    if (!challenge) {
        return (
            <div className="container mt-4">
                <h2>Challenge Details</h2>
                <p>Loading or challenge not found...</p>
            </div>
        );
    }

    return (
        <>
            {isAuth === true ? (
                <>
                    <div className="App">
                        <Navbar />
                        <div className="container mt-4">
                            <div className="row justify-content-center">
                                <div className="col-12 col-md-8 col-lg-6">
                                    <div className="card shadow-sm" style={{position: 'relative'}}>
                                        {/* Team completion indicator */}
                                        {teamData && (
                                            <div 
                                                className="position-absolute" 
                                                style={{
                                                    top: '16px',
                                                    right: '16px',
                                                    zIndex: 10,
                                                    width: '32px',
                                                    height: '32px'
                                                }}
                                                title={teamData.completions?.some(comp => comp.id === id) 
                                                    ? "Completed by your team" 
                                                    : "Not completed by your team"}
                                            >
                                                <img 
                                                    src={teamData.completions?.some(comp => comp.id === id) 
                                                        ? "/team_complete.png" 
                                                        : "/team_nocomplete.png"}
                                                    alt={teamData.completions?.some(comp => comp.id === id) 
                                                        ? "Team completed" 
                                                        : "Team not completed"}
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'contain'
                                                    }}
                                                />
                                            </div>
                                        )}
                                        
                                        <div className="card-body">
                                            <h4 className="card-title">{challenge.name}</h4>
                                            <h6 className="card-subtitle mb-2 text-muted">
                                                {challenge.category} | Difficulty: {challenge.difficulty}
                                            </h6>
                                            <div className="mb-2">
                                                <small className="text-info">
                                                    <i className="fas fa-user"></i> Written by: {challenge.written_by || "Unknown Author"}
                                                </small>
                                            </div>
                                            <p
                                                className="card-text"
                                                dangerouslySetInnerHTML={{ __html: SanitizeDescription(null, challenge.description) }}
                                            />
                                            <p className="card-text">
                                                ⭐ Rating: {challenge.rating.toFixed(1)} / 5
                                            </p>
                                            <p className="card-text">
                                                Points: {challenge.points}
                                            </p>

                                            <hr />

                                            <form onSubmit={handleSubmit}>
                                                <div className="mb-3">
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id="answerInput"
                                                        placeholder="Enter Flag"
                                                        value={answer}
                                                        onChange={(e) => setAnswer(e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                <div className="d-flex gap-2">
                                                    <button type="submit" className="btn btn-primary">
                                                        Submit Flag
                                                    </button>
                                                    <Link to="/compete" className="btn btn-secondary">
                                                        Back
                                                    </Link>
                                                </div>
                                            </form>

                                            {message && (
                                                <div
                                                    className={`alert mt-3 ${message === 'Correct Flag!' ? 'alert-info' : 'alert-danger'}`}
                                                    role="alert"
                                                >
                                                    {message}
                                                </div>
                                            )}

                                            {/* Rating reminder after successful completion */}
                                            {showRatingReminder && (
                                                <div className="alert alert-success mt-3 mb-0" role="alert">
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <div className="d-flex align-items-center">
                                                            <i className="fas fa-star text-warning me-2"></i>
                                                            <span><strong>🎉 Great job!</strong> Consider rating this challenge to help others.</span>
                                                        </div>
                                                        <button 
                                                            type="button" 
                                                            className="btn-close" 
                                                            onClick={() => setShowRatingReminder(false)}
                                                        ></button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Rating section - only show if completed and not already rated */}
                                            {isCompleted && !hasRated && (
                                                <div className="card mt-4 border-primary" style={{ backgroundColor: '#f8f9ff' }}>
                                                    <div className="card-body">
                                                        <h6 className="card-title text-primary mb-3">
                                                            <i className="fas fa-star me-2"></i>
                                                            Rate this Challenge
                                                        </h6>
                                                        <p className="text-muted mb-3" style={{ fontSize: '0.9rem' }}>
                                                            Help other participants by rating the quality of this challenge.
                                                        </p>
                                                        
                                                        <form onSubmit={handleRatingSubmit}>
                                                            <div className="row g-3 align-items-end">
                                                                <div className="col-md-6">
                                                                    <label htmlFor="challengeRating" className="form-label fw-semibold">
                                                                        Your Rating:
                                                                    </label>
                                                                    <select
                                                                        id="challengeRating"
                                                                        className="form-select"
                                                                        value={rating}
                                                                        onChange={(e) => setRating(e.target.value)}
                                                                    >
                                                                        <option value="">Select a rating...</option>
                                                                        <option value="1">⭐ 1 - Poor</option>
                                                                        <option value="2">⭐⭐ 2 - Fair</option>
                                                                        <option value="3">⭐⭐⭐ 3 - Good</option>
                                                                        <option value="4">⭐⭐⭐⭐ 4 - Very Good</option>
                                                                        <option value="5">⭐⭐⭐⭐⭐ 5 - Excellent</option>
                                                                    </select>
                                                                </div>
                                                                <div className="col-md-6 col-lg-4">
                                                                    <button 
                                                                        type="submit" 
                                                                        className="btn btn-primary w-100"
                                                                        disabled={!rating || rating === 'select rating'}
                                                                    >
                                                                        <i className="fas fa-paper-plane me-2"></i>
                                                                        Submit Rating
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </form>

                                                        {ratingMessage && (
                                                            <div 
                                                                className={`alert mt-3 mb-0 ${ratingMessage.includes('Error') ? 'alert-danger' : 'alert-success'}`}
                                                                role="alert"
                                                            >
                                                                <i className={`fas ${ratingMessage.includes('Error') ? 'fa-exclamation-triangle' : 'fa-check-circle'} me-2`}></i>
                                                                {ratingMessage}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Show thank you message if already rated */}
                                            {isCompleted && hasRated && (
                                                <div className="card mt-4 border-info" style={{ backgroundColor: '#e7f3ff' }}>
                                                    <div className="card-body text-center py-3">
                                                        <div className="text-info mb-2">
                                                            <i className="fas fa-star fs-4"></i>
                                                        </div>
                                                        <h6 className="card-title text-info mb-1">Thank you for your feedback!</h6>
                                                        <p className="text-muted small mb-0">
                                                            Your rating helps improve the CTF experience for everyone.
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <>
                    <h1>Page Loading. . .</h1>
                </>
            )}
        </>
    );
}