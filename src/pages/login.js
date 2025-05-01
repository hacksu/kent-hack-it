import '../App.css';
import { useState } from 'react'; // needed to allow for form interaction
import { useSearchParams } from "react-router-dom";

import Navbar from '../components/navbar.js'

export function Login() {
  const [username, SetUsername] = useState(""); // variable pair to modify a variable based on a funct-name
  const [password, SetPassword] = useState("");

  // internal lambda
  const HandleLogin = async (event) => {
      event.preventDefault();
      
      try {
        const response = await fetch("http://localhost:4000/login", {
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
        
        if (data.message === "Login Successful!") {
          // reload the page with a parameter (gets a JWT cookie!)
          window.location.href = "/";
        } else {
          // reload the page with a parameter
          window.location.href = "/login?msg=fail";
        }
      } catch (error) {
        console.error("Error sending request:", error);
        window.location.href = "/login?msg=fail";
      }
  }

  const [searchParams] = useSearchParams();
  const msg = searchParams.get("msg"); // Get "msg" parameter from URL

  return (
    <div className="App">
      <Navbar /> {/* Custom React Component to maintain DRY code */}
      <header className="App-header">
  
        <div className="container mt-5">
          <div className="row justify-content-center">
            <div className="col-md-6">
              <div className="card shadow">
                <div className="card-body">
                  <h3 className="card-title text-center mb-4">Login</h3>
                  
                  {msg === "success" && <p style={{ color: "green" }}>Login successful!</p>}
                  {msg === "fail" && <p style={{ color: "red" }}>Login Failed!</p>}
                  
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