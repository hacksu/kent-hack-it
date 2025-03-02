import '../App.css';
import { useState } from 'react'; // needed to allow for form interaction
import { useSearchParams } from "react-router-dom"; // used to look into potential parameters in the URL

import Navbar from '../components/navbar.js'

export function Register() {
  const [username, SetUsername] = useState(""); // variable pair to modify a variable based on a funct-name
  const [password, SetPassword] = useState("");
  const [email, SetEmail] = useState("");
  const [teamName, SetTeamName] = useState("");

  // internal lambda
  const HandleRegisteration = async (event) => {
      event.preventDefault();

      alert(`username: ${username}\npassword: ${password}`);

      try {
        const response = await fetch("http://localhost:4000/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            {
              "username": username,
              "password": password,
              "email": email,
              "teamName": teamName
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
      <header className="App-header">
        <Navbar/> {/* Custom React Component to maintain DRY code */}
        <p>This is the Register Page</p>
        {msg === "success" && <p style={{ color: "green" }}>Registration successful!</p>}
        {msg === "fail" && <p style={{ color: "red" }}>Registration Failed!</p>}
        <div className='Register-Form'>
          <form onSubmit={HandleRegisteration}>
            <label>Username:
              <input type="text" id="username" placeholder="Username" value={username} onChange={(e) => SetUsername(e.target.value)}/>
            </label><br></br>

            <label>Password:
              <input type="password" id="password" value={password} onChange={(e) => SetPassword(e.target.value)}/>
            </label><br></br>

            <label>Email:
              <input type="text" id="email" value={email} onChange={(e) => SetEmail(e.target.value)}/>
            </label><br></br>

            <label>Team Name:
              <input type="text" id="teamName" value={teamName} onChange={(e) => SetTeamName(e.target.value)}/>
            </label><br></br>

            <input type="submit" />
          </form>
        </div>
      </header>
    </div>
  );
}