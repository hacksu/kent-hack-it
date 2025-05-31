import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'; // needed to interact with the React App BrowserRouter

function GetBackendHost() {
  const BACKEND_HOST = process.env.REACT_APP_BACKEND_HOST;
  const BACKEND_PORT = process.env.REACT_APP_BACKEND_PORT;
  return `${BACKEND_HOST}:${BACKEND_PORT}`;
}

async function LogoutAdmin() {
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
    window.location.href = "/login";
  }
}

const HandleLogout = async (event) =>  {
  event.preventDefault();

  try {
    await LogoutAdmin();
  } catch (error) {
    console.error("Error sending request:", error);
  }
}

async function VerifyAdminSession() {
  try {
    const response = await fetch(`http://${GetBackendHost()}/admin/verify`, {
      method: "GET",
      credentials: 'include'
    });

    const data = await response.json();
    return (data.authenticated === true);
  } catch (error) {
    console.error("Error sending request:", error);
  }
}

function AdminNavbar() {
  const [authenticated, SetAuthenticated] = useState(false);

  // runs periodically
  useEffect(() => {
    async function Verify() {
      SetAuthenticated(await VerifyAdminSession());
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
                          <Link className="nav-link" to="/admin/panel">Panel</Link>
                      </li>

                      {authenticated && (
                        <>
                          <li className="nav-item">
                            <Link className="nav-link"
                                  to="#"
                                  onClick={HandleLogout}>
                              Logout
                            </Link>
                          </li>
                        </>
                      )}
                  </ul>
              </div>
          </div>
      </nav>
  );
}
export default AdminNavbar;

export { VerifyAdminSession, LogoutAdmin, GetBackendHost };