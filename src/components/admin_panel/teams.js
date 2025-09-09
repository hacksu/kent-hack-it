import { useEffect, useState } from 'react';
import { SanitizeDescription } from '../purification.js';

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

            if (!data) {
                if (msgArea) {
                    msgArea.innerHTML = SanitizeDescription(msgArea, "<p style='color: red; background: white; padding: 4px 10px; border-radius: 9999px; display: inline-block;'> Error Occured! </p>");
                }
            }

            if (data.acknowledge) {
                if (msgArea) {
                    msgArea.innerHTML = SanitizeDescription(msgArea, "<p style='color: green; background: white; padding: 4px 10px; border-radius: 9999px; display: inline-block;'>" + data.message + "</p>");
                }
                GetTeams();
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
                        <div className="card shadow-sm border-0 h-100 rounded-3">
                            <div className="card-body d-flex flex-column">
                                {/* Team Name */}
                                <h4 className="card-title text-primary fw-bold mb-3">
                                    {team.name}
                                </h4>

                                {/* Members */}
                                <h6 className="text-muted fw-semibold mb-2">Members</h6>
                                <ul className="list-group list-group-flush mb-3">
                                    {team.members.map((member, index) => (
                                        <li
                                            key={index}
                                            className="list-group-item px-0 py-2 border-0 d-flex align-items-center"
                                        >
                                            <i className="bi bi-person-circle me-2 text-secondary"></i>
                                            <span>{member}</span>
                                        </li>
                                    ))}
                                </ul>

                                {/* Remove Button */}
                                <div className="mt-auto text-end">
                                    <button
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={() => removeTeam(team._id)}
                                    >
                                        <i className="bi bi-trash me-1"></i> Remove Team
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
}
export default AdminTeamsTab;