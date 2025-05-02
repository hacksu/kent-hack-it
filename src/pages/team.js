import '../App.css';
import { useState } from 'react';
import Navbar from '../components/navbar.js'

const Team = ({ onShowProfile }) => {
  const [teamName, SetTeamName] = useState("None");

  return (
    <div className="App">
      <Navbar />
      <header className="App-header">
        <div className="container mt-5">
          <div className="row justify-content-center">
            <div className="col-md-6">
              <div className="card shadow">
                <div className="card-body">
                  <h3 className="card-title text-center mb-4">Team</h3>
                  <form>
                    <div className="mb-3">
                      <input
                        type="text"
                        className="form-control"
                        id="username"
                        placeholder="Enter username"
                        value={teamName}
                        onChange={(e) => SetTeamName(e.target.value)}
                      />
                    </div>
  
                    <div className="d-grid">
                      <button type="submit" className="btn btn-primary">
                        Create Team
                      </button>
                    </div>
                  </form>

                  <div className="d-flex justify-content-center gap-4 mt-3">
                    <button
                      className="btn btn-secondary"
                      onClick={onShowProfile}
                    >
                      Go to Profile Page
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
    </div>
  );  
};
export default Team;