import '../App.css';
import { useState } from 'react'; // needed to allow for form interaction
import { useSearchParams } from "react-router-dom"; // used to look into potential parameters in the URL

import Navbar from '../components/navbar.js'

export function Register() {
  const [username, SetUsername] = useState(""); // variable pair to modify a variable based on a funct-name
  const [password, SetPassword] = useState("");
  const [email, SetEmail] = useState("");

  // internal lambda
  const HandleRegisteration = async (event) => {
      event.preventDefault();

      try {
        const response = await fetch("http://localhost:4000/register", {
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
        console.log("Server Response:", data);
        
        if (data === "User Added Successfully!") {
          // reload the page with a parameter
          window.location.href = "/register?msg=success";
        } else {
          // reload the page with a parameter
          window.location.href = "/register?msg=fail";
        }
      } catch (error) {
        console.error("Error sending request:", error);
        window.location.href = "/register?msg=fail";
      }
  }

  const [searchParams] = useSearchParams();
  const msg = searchParams.get("msg"); // Get "msg" parameter from URL

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
                    {msg === "success" && <p style={{ color: "green" }}>Registration successful!</p>}
                    {msg === "fail" && <p style={{ color: "red" }}>Registration Failed!</p>}
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