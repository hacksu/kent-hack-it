import '../App.css';
import { useState } from 'react'; // needed to allow for form interaction

import Navbar, { GetBackendHost } from '../components/navbar.js'

export function Login() {
  const [username, SetUsername] = useState(""); // variable pair to modify a variable based on a funct-name
  const [password, SetPassword] = useState("");

  // internal lambda
  const HandleLogin = async (event) => {
      event.preventDefault();
      
      try {
        const response = await fetch(`http://${GetBackendHost()}/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            {
              "username": username,
              "password": password
            }
          ),
          credentials: 'include'  // ensures cookies are sent
        });

        // get the response output from the above fetch call
        const data = await response.json();
        console.log("Server Response:", data.message);
        let msgArea = document.getElementById('msg_popup');
        
        if (data.message === "Login Successful!") {
          if (msgArea) {
            msgArea.innerHTML = "<p style='color: green;'>Login Successful!</p>";
            
            // auto redirect to challenge page after Set-Cookie executes
            setTimeout(() => {
              window.location.href = "/compete";
            }, 200);  // 100 ms delay gives the browser time to store the cookie
          }
        } else {
          if (msgArea) {
            msgArea.innerHTML = "<p style='color: red;'>Login Failed!</p>";
          }
        }
      } catch (error) {
        console.error("Error sending request:", error);
        window.location.href = "/login?msg=fail";
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
                  <h3 className="card-title text-center mb-4">Login</h3>
                  <div id='msg_popup'>
                  </div>
                  <form onSubmit={HandleLogin}>
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
  
                    <div className="d-grid">
                      <button type="submit" className="btn btn-primary">
                        Login
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