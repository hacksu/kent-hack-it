import React, { useState } from 'react';
import AdminNavbar, { GetBackendHost } from '../components/admin_navbar.js'
import '../App.css';

export function Admin() {
  const [username, SetUsername] = useState("");
  const [password, SetPassword] = useState("");

  const HandleLogin = async (event) => {
    event.preventDefault();
    
    try {
      const response = await fetch(`http://${GetBackendHost()}/admin/login`, {
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
        credentials: 'include'
      });

      const data = await response.json();
      console.log("Server Response:", data.message);
      let msgArea = document.getElementById('msg_popup');
      
      if (data.message === "Login Successful!") {
        if (msgArea) {
          msgArea.innerHTML = "<p style='color: green;'>Login Successful!</p>";
          
          setTimeout(() => {
            window.location.href = "/admin/panel";
          }, 200);
        }
      } else {
        if (msgArea) {
          msgArea.innerHTML = "<p style='color: red;'>Login Failed!</p>";
        }
      }
    } catch (error) {
      console.error("Error sending request:", error);
      let msgArea = document.getElementById('msg_popup');
      if (msgArea) {
        msgArea.innerHTML = "<p style='color: red;'>Login Failed!</p>";
      }
    }
}

  return (
    <div className="App">
      <AdminNavbar />
      <header className="App-header">
        <div className="container mt-5">
          <div className="row justify-content-center">
            <div className="col-md-6">
              <div className="card shadow">
                <div className="card-body">
                  <h3 className="card-title text-center mb-4">Admin Login</h3>
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