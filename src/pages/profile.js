import '../App.css';
import { useState, useEffect } from 'react';
import Team from './team.js'
import Navbar, { VerifySession } from '../components/navbar.js'

export function Profile() {
  const [username, SetUsername] = useState("");
  const [email, SetEmail] = useState("");
  const [password, SetPassword] = useState("");
  const [newPassword, SetNewPassword] = useState("");
  const [pageIndex, SetPageIndex] = useState(0);

  const ShowTeamPage = () => {
    SetPageIndex(1);
  };

  useEffect(() => {
    async function Verify() {
      const authenticated = await VerifySession();
      if (authenticated === false) {
        window.location.href = "/login"
      }
    }
    Verify();
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
  
                      <form>
                        <div className="mb-3">
                          <input
                            type="text"
                            className="form-control"
                            id="username"
                            placeholder="Enter username"
                            value={username}
                            onChange={(e) => SetUsername(e.target.value)}
                          />
                        </div>
                        <div className="mb-3">
                          <input
                            type="text"
                            className="form-control"
                            id="email"
                            placeholder="Enter email"
                            value={email}
                            onChange={(e) => SetEmail(e.target.value)}
                          />
                        </div>
                        <div className="mb-3">
                          <input
                            type="password"
                            className="form-control"
                            id="password"
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => SetPassword(e.target.value)}
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
  
                        <div className="d-grid">
                          <button type="submit" className="btn btn-primary">
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