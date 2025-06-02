import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'; // needed to interact with the React App BrowserRouter

function GetBackendHost() {
  const BACKEND_HOST = process.env.REACT_APP_BACKEND_HOST;
  const BACKEND_PORT = process.env.REACT_APP_BACKEND_PORT;
  return `${BACKEND_HOST}:${BACKEND_PORT}`;
}

async function LogoutUser() {
  const response = await fetch(`http://${GetBackendHost()}/logout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: 'include'  // ensures cookies are sent
  });

  const data = await response.json();
  if (data.message === "Logged out!") {
    // Cookie Cleared!
    window.location.href = "/";
  }
}

const HandleLogout = async (event) =>  {
  event.preventDefault();

  try {
    await LogoutUser();
  } catch (error) {
    console.error("Error sending request:", error);
  }
}

// Allow other pages to access this function (DRY)
async function VerifySession() {
  // ask the backend if this session is valid
  try {
    const response = await fetch(`http://${GetBackendHost()}/user/verify`, {
      method: "GET",
      credentials: 'include'  // ensures cookies are sent
    });

    const data = await response.json();
    return (data.authenticated === true);
  } catch (error) {
    console.error("Error sending request:", error);
  }
}

function Navbar() {
  const [authenticated, SetAuthenticated] = useState(false);

  // runs periodically
  useEffect(() => {
    async function Verify() {
      SetAuthenticated(await VerifySession());
    }
    Verify();
  }, []); // [] means execute this once on page-load

  return (
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
          <div className="container-fluid">
              <Link className="navbar-brand" to="/">KHI</Link>
              <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
                  aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
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

                      {authenticated ? (
                        <>
                          <li className="nav-item">
                              <Link className="nav-link" to="/profile">
                                Profile
                              </Link>
                          </li>
                          <li className="nav-item">
                            <Link className="nav-link"
                                  to="#"
                                  onClick={HandleLogout}>
                              Logout
                            </Link>
                          </li>
                        </>
                      ) : (
                          <>
                              <li className="nav-item">
                                  <Link className="nav-link" to="/login">Login</Link>
                              </li>
                              <li className="nav-item">
                                  <Link className="nav-link" to="/register">Register</Link>
                              </li>
                          </>
                      )}
                  </ul>
              </div>
          </div>
      </nav>
  );
}
export default Navbar;

export { VerifySession, LogoutUser, GetBackendHost };