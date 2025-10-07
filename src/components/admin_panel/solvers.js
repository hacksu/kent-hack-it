import { useEffect, useState } from 'react';
import { SanitizeDescription } from '../purification.js';

function AdminEventStatsTab() {
    const [solvers, setSolvers] = useState([]);
    const [challenges, setChallenges] = useState([]);
    const [filters, setFilters] = useState({
        challengeFilter: '',
        userFilter: '',
        difficultyFilter: '',
        ratingFilter: ''
    });
    const [availableChallenges, setAvailableChallenges] = useState([]);
    const [availableUsers, setAvailableUsers] = useState([]);
    const [availableDifficulties, setAvailableDifficulties] = useState([]);
    const [availableRatings, setAvailableRatings] = useState([]);

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
                
                // Extract unique challenges and users for dropdown options
                const challengeNames = Object.keys(data.solvers).sort();
                const users = [...new Set(
                    Object.values(data.solvers).flat()
                )].sort();
                
                setAvailableChallenges(challengeNames);
                setAvailableUsers(users);
            }
        } catch (err) {
            console.error('Failed to fetch solvers:', err);
        }
    }

    async function GetChallenges() {
        try {
            const response = await fetch(`/api/ctf/challenges`);
            const data = await response.json();
            setChallenges(data);

            // Extract unique difficulties and ratings
            const difficultyOrder = ['Simple', 'Easy', 'Medium', 'Hard', 'Extreme'];
            const uniqueDifficulties = [...new Set(data.map(challenge => challenge.difficulty))];
            const difficulties = difficultyOrder.filter(diff => uniqueDifficulties.includes(diff));
            
            const ratings = ['4.0', '3.0', '2.0', '1.0', '0.0'];
            
            setAvailableDifficulties(difficulties);
            setAvailableRatings(ratings);
        } catch (err) {
            console.error('Failed to fetch challenges:', err);
        }
    }

    useEffect(() => {
        GetSolvers();
        GetChallenges();
    }, []);

    // Helper function to get challenge details by name
    const getChallengeByName = (challengeName) => {
        return challenges.find(challenge => challenge.name === challengeName);
    };

    // Filter solvers based on challenge name, username, difficulty, and rating
    const filteredSolvers = () => {
        let filtered = Object.entries(solvers);

        // Filter by challenge name
        if (filters.challengeFilter) {
            filtered = filtered.filter(([challenge_name]) => 
                challenge_name === filters.challengeFilter
            );
        }

        // Filter by username
        if (filters.userFilter) {
            filtered = filtered.filter(([, usernames]) => 
                usernames.includes(filters.userFilter)
            );
        }

        // Filter by difficulty
        if (filters.difficultyFilter) {
            filtered = filtered.filter(([challenge_name]) => {
                const challenge = getChallengeByName(challenge_name);
                return challenge && challenge.difficulty === filters.difficultyFilter;
            });
        }

        // Filter by rating (minimum rating)
        if (filters.ratingFilter) {
            const ratingThreshold = parseFloat(filters.ratingFilter);
            filtered = filtered.filter(([challenge_name]) => {
                const challenge = getChallengeByName(challenge_name);
                return challenge && challenge.rating >= ratingThreshold;
            });
        }

        return filtered;
    };

    const clearFilters = () => {
        setFilters({
            challengeFilter: '',
            userFilter: '',
            difficultyFilter: '',
            ratingFilter: ''
        });
    };

    return (
        <div className="users-tab container-fluid py-3">
            <div className="row">
                {/* Filter Sidebar */}
                <div className="col-md-3 col-lg-2">
                    <div className="card p-3 mb-4">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="mb-0" style={{color: "black", textAlign: "center"}}>Filters</h5>
                            <button
                                className="btn btn-sm btn-outline-secondary d-md-none"
                                type="button"
                                data-bs-toggle="collapse"
                                data-bs-target="#filterCollapse"
                                aria-expanded="false"
                                aria-controls="filterCollapse"
                            >
                                Filter Options
                            </button>
                        </div>
                        <div className="collapse d-md-block" id="filterCollapse">

                        {/* Challenge Filter */}
                        <div className="mb-3">
                            <label className="form-label">Challenge</label>
                            <select
                                className="form-select form-select-sm"
                                value={filters.challengeFilter}
                                onChange={(e) => setFilters({...filters, challengeFilter: e.target.value})}
                            >
                                <option value="">All Challenges</option>
                                {availableChallenges.map(challenge => (
                                    <option key={challenge} value={challenge}>{challenge}</option>
                                ))}
                            </select>
                        </div>

                        {/* User Filter */}
                        <div className="mb-3">
                            <label className="form-label">User</label>
                            <select
                                className="form-select form-select-sm"
                                value={filters.userFilter}
                                onChange={(e) => setFilters({...filters, userFilter: e.target.value})}
                            >
                                <option value="">All Users</option>
                                {availableUsers.map(user => (
                                    <option key={user} value={user}>{user}</option>
                                ))}
                            </select>
                        </div>

                        {/* Difficulty Filter */}
                        <div className="mb-3">
                            <label className="form-label">Difficulty</label>
                            <select
                                className="form-select form-select-sm"
                                value={filters.difficultyFilter}
                                onChange={(e) => setFilters({...filters, difficultyFilter: e.target.value})}
                            >
                                <option value="">All Difficulties</option>
                                {availableDifficulties.map(difficulty => (
                                    <option key={difficulty} value={difficulty}>{difficulty}</option>
                                ))}
                            </select>
                        </div>

                        {/* Rating Filter */}
                        <div className="mb-3">
                            <label className="form-label">Minimum Rating</label>
                            <select
                                className="form-select form-select-sm"
                                value={filters.ratingFilter}
                                onChange={(e) => setFilters({...filters, ratingFilter: e.target.value})}
                            >
                                <option value="">All Ratings</option>
                                {availableRatings.map(rating => (
                                    <option key={rating} value={rating}>
                                        {rating}+ ⭐ ({rating === '4.0' ? 'Excellent' : 
                                                    rating === '3.0' ? 'Good' : 
                                                    rating === '2.0' ? 'Fair' : 'Any'})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Clear Filters */}
                        <button
                            className="btn btn-sm btn-outline-secondary w-100 mb-3"
                            onClick={clearFilters}
                        >
                            Clear Filters
                        </button>

                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="col-md-9 col-lg-10">
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
                            {filters.challengeFilter || filters.userFilter || filters.difficultyFilter || filters.ratingFilter 
                                ? 'Try adjusting your filters to see more results.' 
                                : 'No solver data available.'}
                        </p>
                        {(filters.challengeFilter || filters.userFilter || filters.difficultyFilter || filters.ratingFilter) && (
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
            </div>
        </div>
    );
}

export default AdminEventStatsTab;