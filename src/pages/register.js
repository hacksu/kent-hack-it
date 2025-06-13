import '../App.css';
import { useState } from 'react'; // needed to allow for form interaction

import Navbar, { GetBackendHost } from '../components/navbar.js'

export function Register() {
  const [username, SetUsername] = useState(""); // variable pair to modify a variable based on a funct-name
  const [password, SetPassword] = useState("");
  const [email, SetEmail] = useState("");

  // internal lambda
  const HandleRegisteration = async (event) => {
      event.preventDefault();
      let msgArea = document.getElementById('msg_popup');

      try {
        const response = await fetch(`http://${GetBackendHost()}/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            {
              "username": username,
              "password": password,
              "email": email
            }
          ),
        });

        // get the response output from the above fetch call
        const data = await response.text();
        
        if (data === "User Added Successfully!") {
          if (msgArea) {
            // auto redirect to login
            msgArea.innerHTML = "<p style='color: green;'>Registration Successful!</p>";
            setTimeout(() => {
              window.location.href = "/login";
            }, 200);  // 100 ms delay
          }
        } else {
          if (msgArea) {
            msgArea.innerHTML = "<p style='color: red;'>Registration Failed!</p>";
          }
        }
      } catch (error) {
        console.error("Error sending request:", error);
        if (msgArea) {
          msgArea.innerHTML = "<p style='color: red;'>Registration Failed!</p>";
        }
      }
  }

  return (
      <div className="App">
        <Navbar />
        <header className="App-header">
          <div className="container mt-5">
            <div className="row justify-content-center">
              <div className="col-md-6">
                <div className="card shadow">
                  <div className="card-body">
                    <h3 className="card-title text-center mb-4">Register</h3>
                    <div id='msg_popup'>
                    </div>
                    <form onSubmit={HandleRegisteration}>
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
                          type="text"
                          className="form-control"
                          id="email"
                          placeholder="Enter email"
                          value={email}
                          onChange={(e) => SetEmail(e.target.value)}
                        />
                      </div>

                      <div className="d-grid">
                        <button type="submit" className="btn btn-primary">
                          Register
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>
      </div>
  );
}