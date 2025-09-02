import { useEffect, useState } from 'react';

function AdminTeamsTab() {
    const [teams, setTeams] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    // Filter users based on the search term (case-insensitive)
    const filteredTeams = teams.filter(team =>
        team.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    async function GetTeams() {
        try {
            const response = await fetch(`/api/admin/get_teams`, {
                method: "GET",
                credentials: 'include'  // ensures cookies are sent
            });

            const data = await response.json();
            if (data) {
                setTeams(data);
            }
        } catch (err) {
            console.error('Failed to fetch users:', err);
        }
    }
    useEffect(() => {
        GetTeams();
    }, []);

    async function removeTeam(id) {
        let msgArea = document.getElementById('msg_popup');
        try {
            const response = await fetch(`/api/admin/remove_team`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(
                    {
                        "team_id": id,
                    }
                ),
                credentials: 'include'
            });

            const data = await response.json();

            if (data && data.acknowledge) {
                if (msgArea) {
                    msgArea.setHTMLUnsafe("<p style='color: green;'>" + data.message + "</p>");
                }
                GetTeams();
            } else {
                if (msgArea) {
                    msgArea.setHTMLUnsafe("<p style='color: red;'>" + data.message + "</p>");
                }
            }
        } catch (error) {
            console.error("Error sending request:", error);
            if (msgArea) {
                msgArea.setHTMLUnsafe("<p style='color: red;'> Error Occured! </p>");
            }
        }
    };

    return (
        <div className="teams-tab">
            {/* Search Bar */}
            <div className="mb-4">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Search Team by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Team Cards */}
            <div className="row">
                {filteredTeams.map(team => (
                    <div className="col-md-4 mb-4" key={team._id}>
                        <div className="card shadow-sm border-0 h-100">
                            <div className="card-body d-flex flex-column justify-content-between">
                                <div>
                                    <h5
                                        style={{ fontSize: "1.75rem", padding: "0.25rem 0.5rem" }}
                                        className="card-title mb-2"
                                    >
                                        {team.name}
                                    </h5>
                                    <h5
                                        style={{ fontSize: "1.75rem", padding: "0.25rem 0.5rem" }}
                                        className="card-title mb-2"
                                    >
                                        Members:
                                    </h5>

                                    <ul
                                        style={{ fontSize: "1.5rem", padding: "0.25rem 0.5rem" }} className="ps-4 mb-0">
                                        {team.members.map((member, index) => (
                                            <li key={index}>{member}</li>
                                        ))}
                                    </ul>
                                </div>
                                <button
                                    className="btn btn-outline-danger mt-3 align-self-start"
                                    onClick={() => removeTeam(team._id)}
                                >
                                    <i className="bi bi-trash me-2"></i> Remove Team
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
export default AdminTeamsTab;