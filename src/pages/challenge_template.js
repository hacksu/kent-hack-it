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