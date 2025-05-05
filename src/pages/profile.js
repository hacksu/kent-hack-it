import '../App.css';
import { useState, useEffect } from 'react';
import Team from './team.js'
import Navbar, { VerifySession, GetBackendHost } from '../components/navbar.js'

export function Profile() {
  const [currentUsername, SetCurrentUsername] = useState("");
  const [currentEmail, SetCurrentEmail] = useState("");

  const [username, SetUsername] = useState("");
  const [email, SetEmail] = useState("");
  const [password, SetPassword] = useState("");
  const [newPassword, SetNewPassword] = useState("");
  const [pageIndex, SetPageIndex] = useState(0);
  
  const [profileUpdateMsg, SetProfileUpdateMsg] = useState("");

  const ShowTeamPage = () => {
    SetPageIndex(1);
  };

  // triggered by a form there for event is included
  const UpdateProfileDetails = async (event) => {
    event.preventDefault();

    // ensure the user enter 
    const form = event.target.closest('form');
    if (form.checkValidity() === false) {
      form.classList.add('was-validated');
      return;
    }

    try {
      const response = await fetch(`http://${GetBackendHost()}/user/update`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "username": username,
          "email": email,
          "password": password, // used to authorize changes
          "newPassword": newPassword,
        }),
        credentials: 'include'  // ensures cookies are sent
      });

      // null | { message }
      const data = await response.json();
      if (data) {
        SetProfileUpdateMsg(data.message);
      } else {
        SetProfileUpdateMsg("Failed to Update Profile!")
      }
    } catch (error) {
      console.error("Error sending request:", error);
    }
  }

  useEffect(() => {
    async function Verify() {
      const authenticated = await VerifySession();
      if (authenticated === false) {
        window.location.href = "/login"
      }
    }
    Verify();
    
    async function GetInfo() {
      try {
        const response = await fetch(`http://${GetBackendHost()}/user/info`, {
          method: "GET",
          credentials: 'include'  // ensures cookies are sent
        });
    
        const data = await response.json();
        if (data) {
          SetCurrentUsername(data.username);
          SetCurrentEmail(data.email);
        }
      } catch (error) {
        console.error("Error sending request:", error);
      }
    }
    GetInfo();
  }, []); // run once on page-load

  return (
    <>
      {pageIndex === 1 ? (
        <Team onShowProfile={() => SetPageIndex(0)}/>
      ) : (
        <div className="App">
          <Navbar />
          <header className="App-header">
            <div className="container mt-5">
              <div className="row justify-content-center">
                <div className="col-md-6">
                  <div className="card shadow">
                    <div className="card-body">
                      <h3 className="card-title text-center mb-4">Profile</h3>
  
                      <div>
                        <h3>
                          Username: <span>{currentUsername}</span>
                        </h3>
                        <h3>
                          Email: <span>{currentEmail}</span>
                        </h3>
                      </div>
                      <hr/>

                      <form className="needs-validation" noValidate onSubmit={UpdateProfileDetails}>
                        <div className="mb-3">
                          <input
                            type="text"
                            className="form-control"
                            id="username"
                            placeholder="Enter new username"
                            value={username}
                            onChange={(e) => SetUsername(e.target.value)}
                          />
                        </div>
                        <div className="mb-3">
                          <input
                            type="text"
                            className="form-control"
                            id="email"
                            placeholder="Enter new email"
                            value={email}
                            onChange={(e) => SetEmail(e.target.value)}
                          />
                        </div>
                        <div className="mb-3">
                          <input
                            type="password"
                            className="form-control"
                            id="newPassword"
                            placeholder="Enter new password"
                            value={newPassword}
                            onChange={(e) => SetNewPassword(e.target.value)}
                          />
                        </div>
                        <div className="mb-3">
                          <input
                            type="password"
                            className="form-control"
                            id="password"
                            placeholder="Enter current password"
                            value={password}
                            required={true}
                            onChange={(e) => SetPassword(e.target.value)}
                          />
                          
                          <div className="invalid-feedback">
                            Password is required.
                          </div>
                        </div>
  
                        <div className="d-grid">
                          <button
                              type="submit"
                              className="btn btn-primary">
                            Update Profile
                          </button>
                        </div>
                      </form>
  
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