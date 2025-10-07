import { useEffect, useState } from 'react';
import { SanitizeDescription } from '../purification.js';

function AdminEventStatsTab() {
    const [solvers, setSolvers] = useState([]);

    async function GetSolvers() {
        try {
            const response = await fetch(`/api/admin/ctf/get_solvers`, {
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
        <div className="users-tab container-fluid py-3">
            <div className="row g-3">
            {Object.entries(solvers).map(([challenge_name, usernames]) => (
                <div key={challenge_name} className="col-12 col-sm-6 col-md-4 col-lg-3">
                <div className="card shadow-sm border-0 h-100 rounded-3">
                    <div className="card-body d-flex flex-column p-3">
                    
                    {/* Challenge Title */}
                    <h6 className="card-title mb-3 fw-bold text-center text-primary">
                        {SanitizeDescription(null, challenge_name)}
                    </h6>

                    {/* Usernames List */}
                    <ul className="list-group list-group-flush flex-grow-1">
                        {usernames.length > 0 ? (
                        usernames.map(username => (
                            <li
                            key={username}
                            className="list-group-item py-1 px-2 border-0 text-muted"
                            style={{ fontSize: "0.9rem" }}
                            >
                            <i className="bi bi-person-fill me-2 text-secondary"></i>
                            {username}
                            </li>
                        ))
                        ) : (
                        <li className="list-group-item py-1 px-2 border-0 text-muted fst-italic">
                            No solvers yet
                        </li>
                        )}
                    </ul>

                    </div>
                </div>
                </div>
            ))}
            </div>
        </div>
    );
}

export default AdminEventStatsTab;