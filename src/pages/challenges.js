import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../App.css';
import Navbar, { VerifySession, LogoutUser } from '../components/navbar.js';

export function Challenges() {
  const [challenges, setChallenges] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const challengesPerPage = 10;

  useEffect(() => {
    async function Verify() {
      const authenticated = await VerifySession();
      if (authenticated === false) {
        LogoutUser();
      }
    }
    Verify();

    async function FetchChallenges() {
      try {
        const response = await fetch(`http://localhost:4000/challenges`);
        const data = await response.json();
        setChallenges(data);
      } catch (err) {
        console.error('Failed to fetch challenges:', err);
      }
    }
    FetchChallenges();
  }, []);

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

  return (
    <div className="App">
      <Navbar />
      <div className="container mt-4">
        <h2 className="mb-3">Challenges</h2>

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