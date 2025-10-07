import { useEffect, useState } from 'react';
import { SanitizeDescription } from '../purification.js';

function AdminEventStatsTab() {
    const [solvers, setSolvers] = useState([]);
    const [filters, setFilters] = useState({
        challengeSearch: '',
        userSearch: ''
    });

    async function GetSolvers() {
        try {
            const response = await fetch(`/api/admin/ctf/get_solvers`, {
                method: "GET",
                credentials: 'include'
            });

            const data = await response.json();
            if (data && data.acknowledge) {
                setSolvers(data.solvers);
                console.log(data.solvers);
            }
        } catch (err) {
            console.error('Failed to fetch solvers:', err);
        }
    }

    useEffect(() => {
        GetSolvers();
    }, []);

    // Filter solvers based on challenge name and username
    const filteredSolvers = () => {
        let filtered = Object.entries(solvers);

        // Filter by challenge name
        if (filters.challengeSearch) {
            filtered = filtered.filter(([challenge_name]) => 
                challenge_name.toLowerCase().includes(filters.challengeSearch.toLowerCase())
            );
        }

        // Filter by username
        if (filters.userSearch) {
            filtered = filtered.filter(([, usernames]) => 
                usernames.some(username => 
                    username.toLowerCase().includes(filters.userSearch.toLowerCase())
                )
            );
        }

        return filtered;
    };

    const clearFilters = () => {
        setFilters({
            challengeSearch: '',
            userSearch: ''
        });
    };

    return (
        <div className="users-tab container-fluid py-3">
            {/* Filter Controls */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="card">
                        <div className="card-body">
                            <h5 className="card-title mb-3">
                                <i className="bi bi-funnel me-2"></i>
                                Filter Solvers
                            </h5>
                            <div className="row g-3">
                                <div className="col-md-4">
                                    <label htmlFor="challengeSearch" className="form-label">
                                        <i className="bi bi-trophy me-1"></i>
                                        Challenge Name
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="challengeSearch"
                                        placeholder="Search challenges..."
                                        value={filters.challengeSearch}
                                        onChange={(e) => setFilters({...filters, challengeSearch: e.target.value})}
                                    />
                                </div>
                                <div className="col-md-4">
                                    <label htmlFor="userSearch" className="form-label">
                                        <i className="bi bi-person me-1"></i>
                                        Username
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="userSearch"
                                        placeholder="Search users..."
                                        value={filters.userSearch}
                                        onChange={(e) => setFilters({...filters, userSearch: e.target.value})}
                                    />
                                </div>
                                <div className="col-md-4 d-flex align-items-end">
                                    <button
                                        className="btn btn-outline-secondary"
                                        onClick={clearFilters}
                                        disabled={!filters.challengeSearch && !filters.userSearch}
                                    >
                                        <i className="bi bi-x-circle me-1"></i>
                                        Clear Filters
                                    </button>
                                </div>
                            </div>
                            {(filters.challengeSearch || filters.userSearch) && (
                                <div className="mt-3">
                                    <small className="text-muted">
                                        Showing {filteredSolvers().length} of {Object.keys(solvers).length} challenges
                                    </small>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="row g-3">
            {filteredSolvers().length > 0 ? (
                filteredSolvers().map(([challenge_name, usernames]) => (
                <div key={challenge_name} className="col-12 col-sm-6 col-md-4 col-lg-3">
                <div className="card shadow-sm border-0 h-100 rounded-3">
                    <div className="card-body d-flex flex-column p-3">
                    
                    {/* Challenge Title */}
                    <h6 className="card-title mb-3 fw-bold text-center text-primary">
                        {SanitizeDescription(null, challenge_name)} - {usernames.length} solves
                    </h6>

                    {/* Usernames List */}
                    <ul className="list-group list-group-flush flex-grow-1">
                        {usernames.length > 0 ? (
                        usernames.map(username => (
                            <li
                            key={username}
                            className="list-group-item py-1 px-2 border-0 text-muted"
                            style={{ fontSize: "0.9rem" }}
                            >
                            <i className="bi bi-person-fill me-2 text-secondary"></i>
                            {username}
                            </li>
                        ))
                        ) : (
                        <li className="list-group-item py-1 px-2 border-0 text-muted fst-italic">
                            No solvers yet
                        </li>
                        )}
                    </ul>

                    </div>
                </div>
                </div>
                ))
            ) : (
                <div className="col-12">
                    <div className="text-center py-5">
                        <i className="bi bi-search text-muted" style={{fontSize: '3rem'}}></i>
                        <h4 className="text-muted mt-3">No challenges found</h4>
                        <p className="text-muted">
                            {filters.challengeSearch || filters.userSearch 
                                ? 'Try adjusting your filters to see more results.' 
                                : 'No solver data available.'}
                        </p>
                        {(filters.challengeSearch || filters.userSearch) && (
                            <button 
                                className="btn btn-outline-primary"
                                onClick={clearFilters}
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>
                </div>
            )}
            </div>
        </div>
    );
}

export default AdminEventStatsTab;