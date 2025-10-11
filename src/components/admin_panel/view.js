import { useEffect, useState } from 'react';
import AdminChallengeEditTab from './edit.js';
import { SanitizeDescription } from '../../components/purification.js';

function AdminChallengeViewTab() {
    const [activeTab, setActiveTab] = useState("");
    const [challenges, setChallenges] = useState([]);
    const [editId, setEditId] = useState("");

    async function FetchChallenges() {
        try {
            const response = await fetch(`/api/ctf/challenges`);
            const data = await response.json();
            if (data) setChallenges(data);
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

    // Function to go back to view from edit
    const goBackToView = () => {
        setActiveTab("");
        FetchChallenges(); // Refresh the challenges list
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
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="mb-0">Current Challenges</h5>
                            <span className="badge bg-primary fs-6">
                                {challenges.length} Challenge{challenges.length !== 1 ? 's' : ''}
                            </span>
                        </div>
                        <ul className="row">
                            {challenges.map((challenge, idx) => (
                                <div
                                    className="col-12 col-sm-6 col-md-3 col-lg-3 mb-3"
                                    key={idx}
                                    style={{ maxWidth: '400px' }}
                                >
                                    <div className="card h-100 shadow-sm p-2">
                                        <div className="container">
                                            <div className="d-flex justify-content-between pt-2">
                                                <button
                                                    className={`btn ${challenge.is_active ? "btn-outline-danger" : "btn-outline-success"}`}
                                                    onClick={() => ChangeStatus(challenge._id)}
                                                >
                                                    {challenge.is_active ? "Disable" : "Enable"}
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
                        </ul>
                    </div>
                </>
            )}
        </>
    );
}
export default AdminChallengeViewTab;