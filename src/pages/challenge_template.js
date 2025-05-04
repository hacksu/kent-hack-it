import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Navbar, { GetBackendHost } from '../components/navbar.js';

export function ChallengeDetail() {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const id = params.get('id');
  const [challenge, setChallenge] = useState(null);
  const [answer, setAnswer] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function FetchChallenge() {
      try {
        const response = await fetch(`http://${GetBackendHost()}/challenges`);
        const data = await response.json();
        const chall = data.find(challenge => challenge._id === id);
        setChallenge(chall);
      } catch (err) {
        console.error('Failed to fetch challenges:', err);
      }
    }
    FetchChallenge();
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would send 'answer' to your backend
    setMessage(`Submitted answer: ${answer}`);
    setAnswer('');
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
                <p className="card-text">{challenge.description}</p>
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
                    <div className="alert alert-info mt-3" role="alert">
                    {message}
                    </div>
                )}
                </div>
            </div>
            </div>
        </div>
        </div>
    </div>
  );
}