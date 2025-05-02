import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';

const HandleLogout = async (event) => {
  event.preventDefault();

  try {
    const response = await fetch("http://localhost:4000/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: 'include'
    });

    const data = await response.json();
    if (data.message === "Logged out!") {
      window.location.href = "/login";
    }
  } catch (error) {
    console.error("Error sending request:", error);
  }
};

function Navbar({ onHeightChange }) {
  const [authenticated, SetAuthenticated] = useState(false);
  const navRef = useRef();

  useEffect(() => {
    async function VerifySession() {
      try {
        const response = await fetch("http://localhost:4000/user/verify", {
          method: "GET",
          credentials: 'include'
        });

        const data = await response.json();
        SetAuthenticated(data.authenticated === true);
      } catch (error) {
        console.error("Error sending request:", error);
      }
    }

    VerifySession();
  }, []);

  // Track navbar height
  useEffect(() => {
    if (navRef.current && onHeightChange) {
      const handleResize = () => {
        onHeightChange(navRef.current.offsetHeight);
      };
      handleResize(); // initial call
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [onHeightChange]);

  return (
    <nav ref={navRef} className="navbar navbar-expand-lg navbar-light bg-light">
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

            {authenticated ? (
              <li className="nav-item">
                <button className="nav-link" onClick={HandleLogout}>
                  Logout
                </button>
              </li>
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