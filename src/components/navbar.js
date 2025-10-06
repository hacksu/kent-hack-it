import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'; // needed to interact with the React App BrowserRouter

export async function VerifyAuth() {
    try {
        // send a get-req to the backend to determine auth-status
        const req = await fetch('/api/authenticated', {
            credentials: "include", // important so cookies are sent!
        });
        const isAuth = await req.json();
        return isAuth.message === "Authorized";
    } catch (err) {
        return false;
    }
}
export async function VerifyAdmin() {
    try {
        // send a get-req to the backend to determine auth-status
        const req = await fetch('/api/admin/authenticated', {
            credentials: "include", // important so cookies are sent!
        });
        const isAuth = await req.json();
        return isAuth.message === "Authorized";
    } catch (err) {
        return false;
    }
}

function Navbar() {
    const [authenticated, SetAuthenticated] = useState(false);
    const [isAdmin, SetIsAdmin] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            const result = await VerifyAuth();
            SetAuthenticated(result);
        };
        checkAuth();


        const checkAdmin = async () => {
            const result = await VerifyAdmin();
            SetIsAdmin(result);
        };
        checkAdmin();
    }, []);

    const HandleLogout = async () => {
        try {
            await fetch("/api/auth/logout", {
                method: "GET",
                credentials: "include", // include cookies
            });

            window.location.href = "/login";
        } catch (err) {
            console.error("Logout failed:", err);
        }
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <div className="container-fluid">
                <Link className="navbar-brand d-flex align-items-center" to="/">
                    <img
                        src="/2026_KHI_Logo_Transparent.png"
                        alt="KHI Logo"
                        height="80"
                    />
                </Link>

                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                    aria-controls="navbarNav"
                    aria-expanded="false"
                    aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto">
                        <li className="nav-item">
                            <Link className="nav-link" to="/">Home</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/compete">Compete</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/leaderboard">Leaderboard</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/tools" target="_blank" rel="noopener noreferrer">Tools</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/discord" target="_blank" rel="noopener noreferrer">Community</Link>
                        </li>

                        {authenticated ? (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/profile">Profile</Link>
                                </li>
                                {isAdmin && (
                                    <>
                                        <li className="nav-item">
                                            <Link className="nav-link" to="/admin/panel">Admin</Link>
                                        </li>
                                    </>
                                )}
                                <li className="nav-item">
                                    <Link
                                        className="nav-link"
                                        to="/login"
                                        onClick={HandleLogout}
                                        style={{ cursor: "pointer" }}>
                                        Logout
                                    </Link>
                                </li>
                            </>
                        ) : (
                            <li className="nav-item">
                                <Link className="nav-link" to="/login">Login</Link>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
}
export default Navbar;