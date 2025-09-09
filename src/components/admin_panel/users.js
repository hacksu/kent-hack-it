import { useEffect, useState } from 'react';
import { SanitizeDescription } from '../purification.js';

function AdminUsersTab() {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    // Filter users based on the search term (case-insensitive)
    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    async function GetUsers() {
        try {
            const response = await fetch(`/api/admin/get_users`, {
                method: "GET",
                credentials: 'include'  // ensures cookies are sent
            });

            const data = await response.json();
            if (data) {
                setUsers(data);
            }
        } catch (err) {
            console.error('Failed to fetch users:', err);
        }
    }
    useEffect(() => {
        GetUsers();
    }, []);

    async function removeUser(user_id) {
        let msgArea = document.getElementById('msg_popup');
        try {
            const response = await fetch(`/api/admin/remove_user`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(
                    {
                        "user_id": user_id,
                    }
                ),
                credentials: 'include'
            });

            const data = await response.json();

            if (data && data.acknowledge) {
                if (msgArea) {
                    msgArea.innerHTML = SanitizeDescription(msgArea, "<p style='color: green; background: white; padding: 4px 10px; border-radius: 9999px; display: inline-block;'>" + data.message + "</p>");
                }
                GetUsers()
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
        <div className="users-tab">
            {/* Search Bar */}
            <div className="mb-4">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Search users by username..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* User Cards */}
            <div className="row">

                {filteredUsers.map(user => (
                    <div className="col-md-3 mb-3" key={user._id}>  {/* 4 cards per row */}
                        <div className="card shadow-sm border-0 h-100 rounded-3" style={{ fontSize: "0.9rem" }}>
                            <div className="card-body d-flex flex-column justify-content-between p-3">
                                {/* Top: Avatar + Username */}
                                <div className="d-flex align-items-center mb-2">
                                    <img
                                        src={user.avatarUrl}
                                        alt={`${user.username}'s avatar`}
                                        className="rounded-circle me-2 shadow-sm"
                                        style={{ width: "45px", height: "45px", objectFit: "cover" }}
                                    />
                                    <h6 className="card-title mb-0 fw-bold" style={{ fontSize: "1rem" }}>
                                        {user.username}
                                    </h6>
                                </div>

                                {/* Details */}
                                <div className="ms-1">
                                    <p className="card-text text-muted mb-1">
                                        <strong>Email:</strong> {user.email}
                                    </p>
                                    <p className="card-text text-muted mb-0">
                                        <strong>Team ID:</strong> {user.team_id || "—"}
                                    </p>
                                </div>

                                {/* Action */}
                                <div className="mt-2">
                                    <button
                                        className="btn btn-sm btn-outline-danger w-100"
                                        onClick={() => removeUser(user._id)}
                                    >
                                        <i className="bi bi-trash me-1"></i> Remove
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
export default AdminUsersTab;