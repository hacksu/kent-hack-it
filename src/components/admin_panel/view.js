import { useEffect, useState } from 'react';
import AdminChallengeEditTab from './edit.js';
import { SanitizeDescription } from '../../components/purification.js';

function AdminChallengeViewTab() {
    const [activeTab, setActiveTab] = useState("");
    const [challenges, setChallenges] = useState([]);
    const [editId, setEditId] = useState("");
    const [filterYear, setFilterYear] = useState("all");
    const [showArchived, setShowArchived] = useState(true);
    const [availableYears, setAvailableYears] = useState([]);

    async function FetchChallenges() {
        try {
            const response = await fetch(`/api/admin/ctf/fetch_challenges`, {
                credentials: 'include'
            });
            const data = await response.json();
            if (data) {
                setChallenges(data);
                // Extract unique years and sort them
                const years = [...new Set(data.map(c => c.year).filter(y => y))].sort((a, b) => b - a);
                setAvailableYears(years);
            }
        } catch (err) {
            console.error('Failed to fetch challenges:', err);
        }
    }
    // execute FetchChallenges once on-load
    useEffect(() => {
        FetchChallenges()
    }, []);

    // change to invisible tab where edit form is located
    async function EditChallenge(challenge_id) {
        setActiveTab("edit");
        setEditId(challenge_id)
    }

    // prompt admin for passphrase to verify admin wishes to delete
    // a challenge, they will have to do this per challenge for safety
    async function DeleteChallenge(challenge_id) {
        let msgArea = document.getElementById('msg_popup');
        if (window.confirm(`Are you sure you want to delete this challenge?`)) {
            try {
                const response = await fetch(`/api/admin/ctf/delete_challenge`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        "challenge_id": challenge_id
                    }),
                    credentials: 'include'
                });

                const data = await response.json();

                if (data && data.acknowledge) {
                    if (msgArea) {
                        msgArea.innerHTML = SanitizeDescription(msgArea, "<p style='color: green; background: white; padding: 4px 10px; border-radius: 9999px; display: inline-block;'>" + data.message + "</p>");
                    }
                    FetchChallenges()
                } else {
                    if (msgArea) {
                        msgArea.innerHTML = SanitizeDescription(msgArea, "<p style='color: red; background: white; padding: 4px 10px; border-radius: 9999px; display: inline-block;'>" + data.message + "</p>");
                    }
                }
            } catch (error) {
                console.error("Error sending request:", error);
                if (msgArea) {
                    msgArea.innerHTML = SanitizeDescription(msgArea, "<p style='color: red; background: white; padding: 4px 10px; border-radius: 9999px; display: inline-block;'> Error Occured! </p>");
                }
            }
        }
    }

    async function ChangeStatus(challenge_id) {
        let msgArea = document.getElementById('msg_popup');
        try {
            const response = await fetch(`/api/admin/ctf/toggle_status`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    "challenge_id": challenge_id
                }),
                credentials: 'include'
            });

            const data = await response.json();

            if (data && data.acknowledge) {
                if (msgArea) {
                    msgArea.innerHTML = SanitizeDescription(msgArea, "<p style='color: green; background: white; padding: 4px 10px; border-radius: 9999px; display: inline-block;'>" + data.message + "</p>");
                }
                FetchChallenges();
            } else {
                if (msgArea) {
                    msgArea.innerHTML = SanitizeDescription(msgArea, "<p style='color: red; background: white; padding: 4px 10px; border-radius: 9999px; display: inline-block;'>" + data.message + "</p>");
                }
            }
        } catch (error) {
            console.error("Error sending request:", error);
            if (msgArea) {
                msgArea.innerHTML = SanitizeDescription(msgArea, "<p style='color: red; background: white; padding: 4px 10px; border-radius: 9999px; display: inline-block;'> Error Occured! </p>");
            }
        }
    }

    async function ToggleArchive(challenge_id) {
        let msgArea = document.getElementById('msg_popup');
        try {
            const response = await fetch(`/api/admin/ctf/toggle_archive`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    "challenge_id": challenge_id
                }),
                credentials: 'include'
            });

            const data = await response.json();

            if (data && data.acknowledge) {
                if (msgArea) {
                    msgArea.innerHTML = SanitizeDescription(msgArea, "<p style='color: green; background: white; padding: 4px 10px; border-radius: 9999px; display: inline-block;'>" + data.message + "</p>");
                }
                FetchChallenges();
            } else {
                if (msgArea) {
                    msgArea.innerHTML = SanitizeDescription(msgArea, "<p style='color: red; background: white; padding: 4px 10px; border-radius: 9999px; display: inline-block;'>" + data.message + "</p>");
                }
            }
        } catch (error) {
            console.error("Error sending request:", error);
            if (msgArea) {
                msgArea.innerHTML = SanitizeDescription(msgArea, "<p style='color: red; background: white; padding: 4px 10px; border-radius: 9999px; display: inline-block;'> Error Occured! </p>");
            }
        }
    }

    // Function to go back to view from edit
    const goBackToView = () => {
        setActiveTab("");
        FetchChallenges(); // Refresh the challenges list
    };

    // Filter challenges based on selected filters
    const filteredChallenges = challenges.filter(challenge => {
        const yearMatch = filterYear === "all" || challenge.year === parseInt(filterYear);
        return yearMatch;
    });

    // Group challenges by year and archive status
    const groupedChallenges = filteredChallenges.reduce((acc, challenge) => {
        const year = challenge.year || 'Unknown';
        const status = challenge.is_archived ? 'archived' : 'active';
        
        if (!acc[status]) acc[status] = {};
        if (!acc[status][year]) acc[status][year] = [];
        
        acc[status][year].push(challenge);
        return acc;
    }, { active: {}, archived: {} });

    // Sort years within each group (newest first)
    const sortedActiveYears = Object.keys(groupedChallenges.active).sort((a, b) => {
        if (a === 'Unknown') return 1;
        if (b === 'Unknown') return -1;
        return b - a;
    });
    const sortedArchivedYears = Object.keys(groupedChallenges.archived).sort((a, b) => {
        if (a === 'Unknown') return 1;
        if (b === 'Unknown') return -1;
        return b - a;
    });

    // Calculate statistics
    const stats = {
        total: challenges.length,
        active: challenges.filter(c => !c.is_archived).length,
        archived: challenges.filter(c => c.is_archived).length,
        filtered: filteredChallenges.length
    };

    return (
        <>
            {activeTab === "edit" ? (
                <>
                    <AdminChallengeEditTab 
                        target_challenge_id={editId} 
                        onUpdateSuccess={goBackToView}
                    />
                </>
            ) : (
                <>
                    <div>
                        <h5>Current Challenges</h5>
                        
                        {/* Filter Controls */}
                        <div className="card mb-3 p-3 shadow-sm">
                            <div className="row align-items-center">
                                <div className="col-md-4">
                                    <label className="form-label fw-semibold mb-1">Filter by Year</label>
                                    <select 
                                        className="form-select"
                                        value={filterYear}
                                        onChange={(e) => setFilterYear(e.target.value)}
                                    >
                                        <option value="all">All Years</option>
                                        {availableYears.map(year => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label fw-semibold mb-1">Archive Status</label>
                                    <div className="form-check form-switch" style={{ fontSize: "1.1rem", paddingTop: "0.5rem" }}>
                                        <input 
                                            className="form-check-input" 
                                            type="checkbox" 
                                            id="showArchivedSwitch"
                                            checked={showArchived}
                                            onChange={(e) => setShowArchived(e.target.checked)}
                                        />
                                        <label className="form-check-label" htmlFor="showArchivedSwitch">
                                            Show Archived
                                        </label>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label fw-semibold mb-1">Statistics</label>
                                    <div className="small">
                                        <div><strong>Total:</strong> {stats.total} | <strong>Active:</strong> {stats.active} | <strong>Archived:</strong> {stats.archived}</div>
                                        <div><strong>Showing:</strong> {stats.filtered} challenges</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <ul className="row">
                            {filteredChallenges.length === 0 ? (
                                <div className="col-12 text-center py-5">
                                    <p className="text-muted">No challenges match the current filters.</p>
                                </div>
                            ) : (
                                <>
                                    {/* Active Challenges Section */}
                                    {sortedActiveYears.length > 0 && (
                                        <div className="col-12 mb-4">
                                            <h4 className="mb-3">
                                                <i className="bi bi-lightning-fill text-success me-2"></i>
                                                Active Challenges
                                            </h4>
                                            {sortedActiveYears.map(year => (
                                                <div key={`active-${year}`} className="mb-4">
                                                    <h5 className="text-muted mb-3">
                                                        <i className="bi bi-calendar3 me-2"></i>
                                                        {year} ({groupedChallenges.active[year].length} challenges)
                                                    </h5>
                                                    <div className="row">
                                                        {groupedChallenges.active[year].map((challenge, idx) => (
                                                            <div
                                                                className="col-12 col-sm-6 col-md-3 col-lg-3 mb-3"
                                                                key={idx}
                                                                style={{ maxWidth: '400px' }}
                                                            >
                                                                <div className="card h-100 shadow-sm p-2">
                                                                    <div className="container">
                                                                        <div className="d-flex justify-content-between gap-2 pt-2">
                                                                            <button
                                                                                className={`btn btn-sm ${challenge.is_active ? "btn-outline-danger" : "btn-outline-success"}`}
                                                                                onClick={() => ChangeStatus(challenge._id)}
                                                                            >
                                                                                {challenge.is_active ? "Disable" : "Enable"}
                                                                            </button>
                                                                            <button
                                                                                className="btn btn-sm btn-outline-warning"
                                                                                onClick={() => ToggleArchive(challenge._id)}
                                                                            >
                                                                                Archive
                                                                            </button>
                                                                        </div>
                                                                    </div>

                                                                    <div className="card-body p-2">
                                                                        <h6 className="card-title mb-1">{challenge.name}</h6>

                                                                        <small
                                                                            style={{ fontSize: "1.25rem" }}
                                                                            className="text-muted">
                                                                            {challenge.category} | Difficulty: {challenge.difficulty}
                                                                        </small>
                                                                        
                                                                        <div className="mb-1">
                                                                            <small className="text-info">
                                                                                <i className="fas fa-user"></i> By: {challenge.written_by || "Unknown Author"}
                                                                            </small>
                                                                        </div>

                                                                        <p
                                                                            style={{
                                                                                fontSize: "1.25rem",
                                                                                maxHeight: "150px",
                                                                                overflowY: "auto",
                                                                                paddingRight: "8px"
                                                                            }}
                                                                            className="card-text small mt-2"
                                                                            dangerouslySetInnerHTML={{ __html: SanitizeDescription(null, challenge.description) }}
                                                                        />

                                                                        <p
                                                                            style={{ fontSize: "1.25rem" }}
                                                                            className="card-text small mb-1">
                                                                            ⭐ {challenge.rating.toFixed(1)} / 5
                                                                        </p>

                                                                        <p
                                                                            style={{ fontSize: "1.25rem" }}
                                                                            className="card-text small">
                                                                            Points: {challenge.points}
                                                                        </p>
                                                                    </div>

                                                                    <div className='container'>
                                                                        <div className="d-flex justify-content-between pt-2">
                                                                            <button
                                                                                className="btn btn-outline-info"
                                                                                onClick={() => EditChallenge(challenge._id)}
                                                                            >
                                                                                <i className="bi bi-pencil me-2"></i> Edit
                                                                            </button>

                                                                            <button
                                                                                className="btn btn-outline-danger"
                                                                                onClick={() => DeleteChallenge(challenge._id)}
                                                                            >
                                                                                <i className="bi bi-trash me-2"></i> Delete
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Archived Challenges Section */}
                                    {showArchived && sortedArchivedYears.length > 0 && (
                                        <div className="col-12 mb-4">
                                            <h4 className="mb-3">
                                                <i className="bi bi-archive-fill text-warning me-2"></i>
                                                Archived Challenges
                                            </h4>
                                            {sortedArchivedYears.map(year => (
                                                <div key={`archived-${year}`} className="mb-4">
                                                    <h5 className="text-muted mb-3">
                                                        <i className="bi bi-calendar3 me-2"></i>
                                                        {year} ({groupedChallenges.archived[year].length} challenges)
                                                    </h5>
                                                    <div className="row">
                                                        {groupedChallenges.archived[year].map((challenge, idx) => (
                                                            <div
                                                                className="col-12 col-sm-6 col-md-3 col-lg-3 mb-3"
                                                                key={idx}
                                                                style={{ maxWidth: '400px' }}
                                                            >
                                                                <div className="card h-100 shadow-sm p-2 border-warning">
                                                                    <div className="container">
                                                                        <div className="d-flex justify-content-between gap-2 pt-2">
                                                                            <button
                                                                                className={`btn btn-sm ${challenge.is_active ? "btn-outline-danger" : "btn-outline-success"}`}
                                                                                onClick={() => ChangeStatus(challenge._id)}
                                                                            >
                                                                                {challenge.is_active ? "Disable" : "Enable"}
                                                                            </button>
                                                                            <button
                                                                                className="btn btn-sm btn-outline-success"
                                                                                onClick={() => ToggleArchive(challenge._id)}
                                                                            >
                                                                                Unarchive
                                                                            </button>
                                                                        </div>
                                                                        <div className="alert alert-warning mt-2 mb-0 py-1 px-2 small" role="alert">
                                                                            <i className="bi bi-archive-fill me-1"></i> Archived
                                                                        </div>
                                                                    </div>

                                                                    <div className="card-body p-2">
                                                                        <h6 className="card-title mb-1">{challenge.name}</h6>

                                                                        <small
                                                                            style={{ fontSize: "1.25rem" }}
                                                                            className="text-muted">
                                                                            {challenge.category} | Difficulty: {challenge.difficulty}
                                                                        </small>
                                                                        
                                                                        <div className="mb-1">
                                                                            <small className="text-info">
                                                                                <i className="fas fa-user"></i> By: {challenge.written_by || "Unknown Author"}
                                                                            </small>
                                                                        </div>

                                                                        <p
                                                                            style={{
                                                                                fontSize: "1.25rem",
                                                                                maxHeight: "150px",
                                                                                overflowY: "auto",
                                                                                paddingRight: "8px"
                                                                            }}
                                                                            className="card-text small mt-2"
                                                                            dangerouslySetInnerHTML={{ __html: SanitizeDescription(null, challenge.description) }}
                                                                        />

                                                                        <p
                                                                            style={{ fontSize: "1.25rem" }}
                                                                            className="card-text small mb-1">
                                                                            ⭐ {challenge.rating.toFixed(1)} / 5
                                                                        </p>

                                                                        <p
                                                                            style={{ fontSize: "1.25rem" }}
                                                                            className="card-text small">
                                                                            Points: {challenge.points}
                                                                        </p>
                                                                    </div>

                                                                    <div className='container'>
                                                                        <div className="d-flex justify-content-between pt-2">
                                                                            <button
                                                                                className="btn btn-outline-info"
                                                                                onClick={() => EditChallenge(challenge._id)}
                                                                            >
                                                                                <i className="bi bi-pencil me-2"></i> Edit
                                                                            </button>

                                                                            <button
                                                                                className="btn btn-outline-danger"
                                                                                onClick={() => DeleteChallenge(challenge._id)}
                                                                            >
                                                                                <i className="bi bi-trash me-2"></i> Delete
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </ul>
                    </div>
                </>
            )}
        </>
    );
}
export default AdminChallengeViewTab;