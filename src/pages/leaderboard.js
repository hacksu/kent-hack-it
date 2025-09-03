import React, { useState, useEffect } from 'react';
import Navbar from '../components/navbar.js';
import '../App.css';

export function Leaderboard() {
    const [leaderboard, setLeaderboard] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [userData, setUserData] = useState(null);

    async function FetchLeaderboard() {
        try {
            const response = await fetch(`/api/info/leaderboard`, {
                method: "GET",
                credentials: 'include'
            });

            const data = await response.json();
            setLeaderboard(data);
        } catch (error) {
            console.error("Error sending request:", error);
        }
    }

    useEffect(() => {
        FetchLeaderboard();
    }, []);

    useEffect(() => {
        async function GetInfo() {
            try {
                const response = await fetch(`/api/user/info`, {
                    method: "GET",
                    credentials: 'include'  // ensures cookies are sent
                });

                const data = await response.json();
                if (data) {
                    if (data.username && data.team) {
                        setUserData({ "username": data.username, "team": data.team })
                    } else {
                        setUserData(null)
                    }
                } else {
                    setUserData(null)
                }
            } catch (error) {
                console.error("Error sending request:", error);
                setUserData(null)
            }
        }
        GetInfo();
    }, []); // run once on page-load

    // Filter leaderboard by search term (case-sensitive)
    const filteredLeaderboard = leaderboard.filter(item =>
        item.name.includes(searchTerm)
    );

    return (
        <div className="App">
            <Navbar />
            <header
                className="App-header"
                style={{
                    display: 'block',
                    height: 'auto',
                    paddingTop: '15px',
                }}>
                <h1>KHI Leaderboard</h1>

                {/* Search Bar */}
                <div className="mb-3 mt-3 d-flex justify-content-center">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search by name..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        style={{ maxWidth: '400px', width: '100%' }}
                    />
                </div>

                <div className="container mt-2 d-flex justify-content-center gap-3">
                    {/*
                        THIS CARD ONLY SHOWS WHEN A USER IS AUTHENTICATED
                        ADMINS THAT PARTICIPATE WILL NOT SEE PLACEMENT
                        STATUS ON LEADERBOARD
                    */}
                    {userData && (
                        <div
                            className="card shadow-sm border-0 rounded-3"
                            style={{ minWidth: "220px", maxWidth: "320px", width: "100%" }}
                        >
                            {/* Header */}
                            <div className="card-header bg-gradient text-white text-center fw-bold rounded-top-3"
                                style={{ background: "linear-gradient(90deg, #0d6efd, #0a58ca)" }}>
                                <i className="bi bi-person-circle me-2"></i>
                                {userData.username}
                            </div>

                            {(() => {
                                const actualIndex = leaderboard.findIndex(
                                    (entry) => entry.name === userData.username || entry.name === userData.team
                                );

                                if (actualIndex === -1) return null;

                                const userEntry = leaderboard[actualIndex];
                                let badgeColor = "secondary";
                                if (actualIndex === 0) badgeColor = "warning";
                                else if (actualIndex === 1) badgeColor = "info";
                                else if (actualIndex === 2) badgeColor = "danger";

                                return (
                                    <div className="card-body">
                                        {/* Placement row */}
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <h6 className="mb-0 text-muted">Your Placement</h6>
                                            <span
                                                className={`badge bg-${badgeColor} rounded-pill px-3 py-2`}
                                                style={{ fontSize: "1rem" }}
                                            >
                                                #{actualIndex + 1}
                                            </span>
                                        </div>

                                        {/* User entry row */}
                                        <div
                                            className="d-flex justify-content-between align-items-center bg-light rounded-3 px-3 py-2 shadow-sm"
                                            style={{ fontSize: "1.1rem" }}
                                        >
                                            <span className="fw-semibold">
                                                <i className="bi bi-trophy me-2 text-warning"></i>
                                                {userEntry.name}
                                            </span>
                                            <span className="fw-bold text-primary">{userEntry.points} pts</span>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    )}

                    <div className="card shadow-sm" style={{ minWidth: '200px', maxWidth: '500px', width: '100%' }}>
                        <div className="card-header bg-primary text-white text-center fw-bold">
                            Leaderboard
                        </div>
                        <ul
                            className="list-group list-group-flush"
                            style={{
                                maxHeight: '400px',
                                overflowY: 'auto',
                                scrollbarWidth: 'thin',
                                WebkitOverflowScrolling: 'touch',
                            }}>
                            {filteredLeaderboard.map((item, index) => {
                                const actualIndex = leaderboard.findIndex(original => original.name === item.name);
                                let badgeColor = "secondary";
                                if (actualIndex === 0) badgeColor = "warning";
                                else if (actualIndex === 1) badgeColor = "secondary";
                                else if (actualIndex === 2) badgeColor = "danger";

                                return (
                                    <li
                                        key={index}
                                        className="list-group-item d-flex justify-content-between align-items-center px-4 py-2"
                                        style={{ fontSize: "0.95rem" }}
                                    >
                                        <span>
                                            <span className={`badge bg-${badgeColor} me-2`}>
                                                #{actualIndex + 1}
                                            </span>
                                            {item.name}
                                        </span>
                                        <span className="text-muted fw-bold">{item.points} pts</span>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>
            </header>
        </div>
    );
}