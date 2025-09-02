import { useEffect, useState } from 'react';

function AdminView() {
    const [admins, setAdmins] = useState([]);
    async function getAdmins() {
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

    async function removeAdmin(username) {
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
                    msgArea.setHTMLUnsafe("<p style='color: green;'>" + data.message + "</p>");
                }
                getAdmins()
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
        <>
        <div className="container mt-4 d-flex justify-content-center align-items-center">
            <div className="row w-100 justify-content-center">
                <h4>Current Admins</h4>
                <ul className="list-group w-auto">
                {admins.map((admin, index) => (
                    <li
                    key={index}
                    className="list-group-item d-flex justify-content-between align-items-center px-3 py-2"
                    style={{ fontSize: '0.9rem', minWidth: '250px', maxWidth: '400px' }}
                    >
                    <span className="text-muted">{admin.username}</span>
                    <button
                        className="btn btn-sm btn-outline-danger"
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