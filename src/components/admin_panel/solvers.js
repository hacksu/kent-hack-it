import { useEffect, useState } from 'react';
import { SanitizeDescription } from '../purification.js';

function AdminEventStatsTab() {
    const [solvers, setSolvers] = useState([]);

    async function GetSolvers() {
        try {
            const response = await fetch(`/api/admin/get_solvers`, {
                method: "GET",
                credentials: 'include'
            });

            const data = await response.json();
            if (data && data.acknowledge) {
                setSolvers(data.solvers);
                console.log(data.solvers);
            }
        } catch (err) {
            console.error('Failed to fetch solvers:', err);
        }
    }

    useEffect(() => {
        GetSolvers();
    }, []);

    return (
        <div className="users-tab">
            <div className="row">
                {solvers.map(([challenge_name, usernames]) => (
                    <div key={challenge_name} className="col-md-3 mb-3">
                        <div className="card shadow-sm border-0 h-100 rounded-3" style={{ fontSize: "0.9rem" }}>
                            <div className="card-body d-flex flex-column justify-content-between p-3">
                                <div className="d-flex align-items-center mb-2">
                                    <h6 className="card-title mb-0 fw-bold" style={{ fontSize: "1rem" }}>
                                        {SanitizeDescription(challenge_name)}
                                    </h6>
                                </div>

                                <div className="ms-1">
                                    <ul className="mb-0">
                                        {usernames.map((username) => (
                                            <li key={username}>{username}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default AdminEventStatsTab;