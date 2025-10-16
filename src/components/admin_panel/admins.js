import { useEffect, useState } from 'react';
import { SanitizeDescription } from '../purification.js';

function AdminView() {
    const [admins, setAdmins] = useState([]);
    async function GetAdmins() {
        try {
            const response = await fetch(`/api/admin/fetch_admins`, {
                method: "GET",
                credentials: 'include'
            });

            const data = await response.json();

            if (data) {
                setAdmins(data)
            }
        } catch (error) {
            console.error("Error sending request:", error);
        }
    };
    useEffect(() => {
        GetAdmins();
    }, []);

    async function removeAdmin(username) {
        if (window.confirm(`Are you sure you want to delete this admin?`)) {
            let msgArea = document.getElementById('msg_popup');
    
            try {
                const response = await fetch(`/api/admin/remove_admin`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(
                        {
                            "username": username,
                        }
                    ),
                    credentials: 'include'
                });
    
                const data = await response.json();
    
                if (data && data.acknowledge) {
                    if (msgArea) {
                        msgArea.innerHTML = SanitizeDescription(msgArea, "<p style='color: green; background: white; padding: 4px 10px; border-radius: 9999px; display: inline-block;'>" + data.message + "</p>");
                    }
                    GetAdmins()
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
    };

    return (
        <>
            <div className="container mt-4 d-flex justify-content-center align-items-center">
                <div className="row w-100 justify-content-center">
                    <h4>Current Admins</h4>
                    <ul className="list-group w-auto">

                        {admins.map((admin, index) => (
                            <li
                                key={index}
                                className="list-group-item d-flex align-items-center px-3 py-2"
                                style={{ fontSize: "1rem", minWidth: "250px", maxWidth: "400px" }}
                            >
                                {/* Avatar + Username */}
                                <div className="d-flex align-items-center flex-grow-1">
                                    <img
                                        src={admin.avatarUrl}
                                        alt={`${admin.username}'s avatar`}
                                        className="rounded-circle me-3"
                                        style={{ width: "40px", height: "40px", objectFit: "cover" }}
                                    />
                                    <span className="fw-semibold text-dark">{admin.username}</span>
                                </div>

                                {/* Delete Button */}
                                <button
                                    className="btn btn-sm btn-outline-danger ms-3"
                                    onClick={() => removeAdmin(admin.username)}
                                >
                                    <i className="bi bi-trash"></i> Delete
                                </button>
                            </li>
                        ))}

                    </ul>
                </div>
            </div>
        </>
    );
}
export default AdminView;