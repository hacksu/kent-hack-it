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
    const [profileData, setProfileData] = useState(null);
    const [isCompleted, setIsCompleted] = useState(false);
    const [hasRated, setHasRated] = useState(false);
    const [rating, setRating] = useState('');
    const [ratingMessage, setRatingMessage] = useState('');
    const [showRatingReminder, setShowRatingReminder] = useState(false);

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
                setProfileData(data);
                // Check if user has completed this challenge
                const completed = data.completions?.some(comp => comp.id === id);
                setIsCompleted(completed);
                
                // Check if user has already rated this challenge
                const rated = data.user_rates?.includes(id);
                setHasRated(rated);
            }
        } catch (error) {
            console.error("Error getting profile details:", error);
        }
    };

    useEffect(() => {
        if (isAuth && id) {
            getProfileDetails();
        }
    }, [isAuth, id]);

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
                                    <div className="card shadow-sm">
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
                                                <div className="alert alert-success mt-3" role="alert">
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <div>
                                                            <strong>🎉 Great job!</strong> Consider rating this challenge to help others.
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
                                                <div className="mt-4">
                                                    <hr />
                                                    <h6>Rate this Challenge</h6>
                                                    <p className="text-muted small">
                                                        Help other participants by rating the quality of this challenge.
                                                    </p>
                                                    
                                                    <form onSubmit={handleRatingSubmit}>
                                                        <div className="row align-items-end">
                                                            <div className="col-auto">
                                                                <label htmlFor="challengeRating" className="form-label">
                                                                    Rating (1-5):
                                                                </label>
                                                                <select
                                                                    id="challengeRating"
                                                                    className="form-select form-select-sm"
                                                                    value={rating}
                                                                    onChange={(e) => setRating(e.target.value)}
                                                                    style={{width: '120px'}}
                                                                >
                                                                    <option value="">Select...</option>
                                                                    <option value="1">1 - Poor</option>
                                                                    <option value="2">2 - Fair</option>
                                                                    <option value="3">3 - Good</option>
                                                                    <option value="4">4 - Very Good</option>
                                                                    <option value="5">5 - Excellent</option>
                                                                </select>
                                                            </div>
                                                            <div className="col-auto">
                                                                <button 
                                                                    type="submit" 
                                                                    className="btn btn-sm btn-success"
                                                                    disabled={!rating || rating === 'select rating'}
                                                                >
                                                                    Submit Rating
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </form>

                                                    {ratingMessage && (
                                                        <div 
                                                            className={`alert mt-2 ${ratingMessage.includes('Error') ? 'alert-danger' : 'alert-success'}`}
                                                            role="alert"
                                                        >
                                                            {ratingMessage}
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Show thank you message if already rated */}
                                            {isCompleted && hasRated && (
                                                <div className="mt-4">
                                                    <hr />
                                                    <div className="alert alert-info" role="alert">
                                                        <i className="fas fa-star text-warning"></i> Thank you for rating this challenge!
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