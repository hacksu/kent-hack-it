import { useEffect, useState } from 'react';

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
                    msgArea.setHTMLUnsafe("<p style='color: green;'>" + data.message + "</p>");
                }
                GetUsers()
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
                    <div className="col-md-4 mb-4" key={user._id}>
                        <div className="card shadow-sm border-0 h-100">
                            <div className="card-body d-flex flex-column justify-content-between">
                                <div>
                                    <h5
                                        style={{ fontSize: "1.75rem", padding: "0.25rem 0.5rem" }}
                                        className="card-title mb-2"
                                    >
                                        {user.username}
                                    </h5>
                                    <p
                                        style={{ fontSize: "1.25rem", padding: "0.25rem 0.5rem" }}
                                        className="card-text text-muted mb-1"
                                    >
                                        <strong>Email:</strong> {user.email}
                                    </p>
                                    <p
                                        style={{ fontSize: "1.25rem", padding: "0.25rem 0.5rem" }}
                                        className="card-text text-muted"
                                    >
                                        <strong>Team ID:</strong> {user.team_id}
                                    </p>
                                </div>
                                <button
                                    className="btn btn-outline-danger mt-3 align-self-start"
                                    onClick={() => removeUser(user._id)}
                                >
                                    <i className="bi bi-trash me-2"></i> Remove User
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
export default AdminUsersTab;