import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import '../App.css';
import Navbar, { VerifyAuth } from '../components/navbar.js';
import { SanitizeDescription } from '../components/purification.js';

export function Challenges() {
    const [challenges, setChallenges] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const challengesPerPage = 20;

    const [joinedTeamName, SetJoinedTeamName] = useState("");
    const [profileData, SetProfileData] = useState(null);
    const [teamData, SetTeamData] = useState(null);



    // Filter state
    const [filters, setFilters] = useState({
        category: '',
        difficulty: '',
        searchText: '',
        showCompleted: false,
        showUncompleted: true
    });

    const [availableCategories, setAvailableCategories] = useState([]);
    const [availableDifficulties, setAvailableDifficulties] = useState([]);

    async function GetProfileDetails() {
        try {
            const response = await fetch(`/api/user/info`, {
                method: "GET",
                credentials: 'include'  // ensures cookies are sent
            });

            // { username, email, completions, team, is_leader }
            const data = await response.json();
            if (data === null) {
                SetJoinedTeamName("None");
            } else {
                SetJoinedTeamName(data.team);
                SetProfileData(data);
            }
        } catch (error) {
            console.error("Error sending request:", error);
        }
    }
    useEffect(() => {
        GetProfileDetails();
        // eslint-disable-next-line
    }, []); // <-- [] means run once on page-load

    // used to show leaders their team so they can manage it
    // and used to allow team-members to view their team stats
    async function GetTeamDetails() {
        try {
            const response = await fetch(`/api/team/info`, {
                method: "GET",
                credentials: 'include'  // ensures cookies are sent
            });

            // { name, team_leader, members, completions, join_requests }
            const data = await response.json();
            SetTeamData(data);
        } catch (error) {
            console.error("Error sending request:", error);
        }
    }
    useEffect(() => {
        if (joinedTeamName !== "None" && joinedTeamName !== "") GetTeamDetails();
        // eslint-disable-next-line
    }, [joinedTeamName]); // executes when joinedTeamName changes state





    const ApplyFilters = useCallback((data) => {
        let filteredData = [...data];

        // Filter by category
        if (filters.category) {
            filteredData = filteredData.filter(challenge => 
                challenge.category === filters.category
            );
        }

        // Filter by difficulty
        if (filters.difficulty) {
            filteredData = filteredData.filter(challenge => 
                challenge.difficulty === filters.difficulty
            );
        }

        // Filter by search text
        if (filters.searchText) {
            const searchTerm = filters.searchText.toLowerCase();
            filteredData = filteredData.filter(challenge =>
                challenge.name.toLowerCase().includes(searchTerm) ||
                challenge.category.toLowerCase().includes(searchTerm) ||
                (challenge.written_by && challenge.written_by.toLowerCase().includes(searchTerm))
            );
        }

        // Filter by completion status
        if (!filters.showCompleted || !filters.showUncompleted) {
            const userCompletions = profileData?.completions || [];
            const teamCompletions = teamData?.completions || [];
            
            filteredData = filteredData.filter(challenge => {
                const isCompletedByUser = userCompletions.some(comp => comp.id === challenge._id);
                const isCompletedByTeam = teamCompletions.some(comp => comp.id === challenge._id);
                const isCompleted = isCompletedByUser || isCompletedByTeam;
                
                return (filters.showCompleted && isCompleted) || (filters.showUncompleted && !isCompleted);
            });
        }

        return filteredData;
    }, [filters, profileData, teamData]);

    const FetchChallenges = useCallback(async () => {
        try {
            const response = await fetch(`/api/ctf/challenges`);
            const data = await response.json();

            // Extract unique categories and difficulties for filter options
            const categories = [...new Set(data.map(challenge => challenge.category))].sort();
            const difficulties = [...new Set(data.map(challenge => challenge.difficulty))].sort();
            
            setAvailableCategories(categories);
            setAvailableDifficulties(difficulties);

            // Apply all filters
            const filteredData = ApplyFilters(data);

            setChallenges(filteredData);
        } catch (err) {
            console.error('Failed to fetch challenges:', err);
        }
    }, [ApplyFilters]);

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
    }, [challenges]); // run on state change

    const indexOfLast = currentPage * challengesPerPage;
    const indexOfFirst = indexOfLast - challengesPerPage;
    const currentChallenges = () => {
        if (!challenges || challenges.length === 0) {
            return [];
        }
        return challenges.slice(indexOfFirst, indexOfLast);
    };

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



    useEffect(() => {
        FetchChallenges()
    }, [profileData, teamData, filters, FetchChallenges]);

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [filters]);

    return (
        <>
            {isAuth === true ? (
                <>
                    <div className="App page-background">
                        <Navbar />
                        <div className="container-fluid mt-4">
                            <div className="row">
                                {/* Filter Sidebar */}
                                <div className="col-md-3 col-lg-2">
                                    <div className="card p-3 mb-4">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <h5 className="mb-0">Filters</h5>
                                            <button
                                                className="btn btn-sm btn-outline-secondary d-md-none"
                                                type="button"
                                                data-bs-toggle="collapse"
                                                data-bs-target="#filterCollapse"
                                                aria-expanded="false"
                                                aria-controls="filterCollapse"
                                            >
                                                Toggle
                                            </button>
                                        </div>
                                        <div className="collapse d-md-block" id="filterCollapse">
                                        
                                        {/* Search */}
                                        <div className="mb-3">
                                            <label className="form-label">Search</label>
                                            <input
                                                type="text"
                                                className="form-control form-control-sm"
                                                placeholder="Search challenges..."
                                                value={filters.searchText}
                                                onChange={(e) => setFilters({...filters, searchText: e.target.value})}
                                            />
                                        </div>

                                        {/* Category Filter */}
                                        <div className="mb-3">
                                            <label className="form-label">Category</label>
                                            <select
                                                className="form-select form-select-sm"
                                                value={filters.category}
                                                onChange={(e) => setFilters({...filters, category: e.target.value})}
                                            >
                                                <option value="">All Categories</option>
                                                {availableCategories.map(category => (
                                                    <option key={category} value={category}>{category}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Difficulty Filter */}
                                        <div className="mb-3">
                                            <label className="form-label">Difficulty</label>
                                            <select
                                                className="form-select form-select-sm"
                                                value={filters.difficulty}
                                                onChange={(e) => setFilters({...filters, difficulty: e.target.value})}
                                            >
                                                <option value="">All Difficulties</option>
                                                {availableDifficulties.map(difficulty => (
                                                    <option key={difficulty} value={difficulty}>{difficulty}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Completion Status */}
                                        <div className="mb-3">
                                            <label className="form-label">Show</label>
                                            <div className="form-check">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    id="showCompleted"
                                                    checked={filters.showCompleted}
                                                    onChange={(e) => setFilters({...filters, showCompleted: e.target.checked})}
                                                />
                                                <label className="form-check-label" htmlFor="showCompleted">
                                                    Completed
                                                </label>
                                            </div>
                                            <div className="form-check">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    id="showUncompleted"
                                                    checked={filters.showUncompleted}
                                                    onChange={(e) => setFilters({...filters, showUncompleted: e.target.checked})}
                                                />
                                                <label className="form-check-label" htmlFor="showUncompleted">
                                                    Uncompleted
                                                </label>
                                            </div>
                                        </div>

                                        {/* Clear Filters */}
                                        <button
                                            className="btn btn-sm btn-outline-secondary"
                                            onClick={() => setFilters({
                                                category: '',
                                                difficulty: '',
                                                searchText: '',
                                                showCompleted: false,
                                                showUncompleted: true
                                            })}
                                        >
                                            Clear Filters
                                        </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Main Content */}
                                <div className="col-md-9 col-lg-10">
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h2 className="mb-0">Challenges</h2>
                                        <span className="text-muted">
                                            {challenges.length} challenge{challenges.length !== 1 ? 's' : ''} found
                                        </span>
                                    </div>

                                    {/* Pagination buttons at the top */}
                                    <div className="d-flex justify-content-center gap-4 mb-3">
                                        <button
                                            className="btn btn-sm btn-primary"
                                            onClick={prevPage}
                                            disabled={currentPage === 1}
                                        >
                                            ← Prev
                                        </button>
                                        <span className="align-self-center">
                                            Page {currentPage} of {Math.ceil(challenges.length / challengesPerPage) || 1}
                                        </span>
                                        <button
                                            className="btn btn-sm btn-primary"
                                            onClick={nextPage}
                                            disabled={indexOfLast >= challenges.length}
                                        >
                                            Next →
                                        </button>
                                    </div>

                                    {currentChallenges().length > 0 ? (
                                        <div className="row">
                                            {currentChallenges().map((challenge, idx) => (
                                            <div
                                                className="col-xl-3 col-lg-4 col-md-6 col-sm-6 mb-3"
                                                key={idx}
                                            >
                                                <Link
                                                    to={challenge.is_active ? `/challenge?id=${challenge._id}` : ""}
                                                    className="text-decoration-none text-dark"
                                                >
                                                    <div className={`card h-100 shadow-sm p-2 ${!challenge.is_active ? "opacity-50" : ""}`}>
                                                        <div className="card-body p-2">
                                                            {!challenge.is_active && (
                                                                <>
                                                                    <p>
                                                                        Challenge is currently Out-of-Order and will be back online soon!
                                                                    </p>
                                                                </>
                                                            )}
                                                            <h6 className="card-title mb-1">{challenge.name}</h6>
                                                            <small className="text-muted">
                                                                {challenge.category} | Difficulty: {challenge.difficulty}
                                                            </small>
                                                            <div className="mb-1">
                                                                <small className="text-info">
                                                                    <i className="fas fa-user"></i> By: {challenge.written_by || "Unknown Author"}
                                                                </small>
                                                            </div>
                                                            {challenge.description && (
                                                                <div className="mb-2">
                                                                    <p className="card-text small text-muted" style={{fontSize: '0.75rem'}}>
                                                                        <SanitizeDescription description={challenge.description} maxLength={100} />
                                                                    </p>
                                                                </div>
                                                            )}
                                                            <p className="card-text small mb-1">
                                                                ⭐ {challenge.rating.toFixed(1)} / 5
                                                            </p>
                                                            <p className="card-text small">
                                                                Points: {challenge.points}
                                                            </p>
                                                            <p className="card-text small">
                                                                {challenge.user_completions} Solves
                                                            </p>
                                                        </div>
                                                    </div>
                                                </Link>
                                            </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-5">
                                            <h4 className="text-muted">No challenges found</h4>
                                            <p className="text-muted">Try adjusting your filters to see more challenges.</p>
                                        </div>
                                    )}
                                    <Link className="navbar-brand btn btn-md btn-info" to="/rate-challenge">Rate Challenges</Link>
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