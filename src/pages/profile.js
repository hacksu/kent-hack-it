import '../App.css';
import { useState, useEffect } from 'react';
import { useSearchParams } from "react-router-dom";
import Team from './team.js'
import Navbar, { VerifyAuth } from '../components/navbar.js'

export function Profile() {
  const [pageId, SetPageId] = useState(0);
  const [username, SetUsername] = useState("");
  const [profileImage, SetProfileImage] = useState("");

  const ShowTeamPage = () => {
    window.location.href = "/profile?mode=1";
  };

  useEffect(() => {
    async function Verify() {
      const authenticated = await VerifyAuth();
      if (authenticated === false) {
        window.location.href = "/login";
      }
    }
    Verify();
    
    async function GetInfo() {
      try {
        const response = await fetch(`/api/user/info`, {
          method: "GET",
          credentials: 'include'  // ensures cookies are sent
        });
    
        const data = await response.json();
        if (data) {
          console.log(data);
          SetUsername(data.username);
          SetProfileImage(data.avatarUrl);
        }
      } catch (error) {
        console.error("Error sending request:", error);
      }
    }
    GetInfo();
  }, []); // run once on page-load

  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode");

  useEffect(() => {
    if (mode === "1") {
      SetPageId(1);
    } else {
      SetPageId(0);
    }
  }, [mode]); // Runs when `mode` changes (on initial load or URL update)

  return (
    <>
      {pageId === 1 ? (
        <Team />
      ) : (
        <div className="App">
          <Navbar />
          <header className="App-header">
            <div className="container mt-5">
              <div className="row justify-content-center">
                <div id='msg_popup'>
                </div>
                <div className="col-md-6">
                  <div className="card shadow">
                    <div className="card-body">
                      <h3 className="card-title text-center mb-4">Profile</h3>

                      <div className="text-center">
                        <img 
                          src={profileImage} 
                          alt="Profile"
                          className="rounded-circle img-fluid mb-3"
                          style={{ maxWidth: "150px", height: "auto" }}
                        />
                        <h3 className="text-dark">
                          Username: <span className="text-primary">{username}</span>
                        </h3>
                      </div>
                      <hr/>
  
                      <div className="d-flex justify-content-center gap-4 mt-3">
                        <button
                          className="btn btn-secondary"
                          onClick={ShowTeamPage}
                        >
                          Go to Team Page
                        </button>
                      </div>
  
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </header>
        </div>
      )}
    </>
  );  
}