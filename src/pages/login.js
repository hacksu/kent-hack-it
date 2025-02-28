import '../App.css';
import { Link } from 'react-router-dom'; // needed to interact with the React App BrowserRouter

import { useState } from 'react'; // needed to allow for form interaction

export function Login() {
  const [username, SetUsername] = useState(""); // variable pair to modify a variable based on a funct-name
  const [password, SetPassword] = useState("");

  // internal lambda
  const HandleLogin = (event) => {
      event.preventDefault();
      alert(`The username you entered was: ${username}`);
  }

  return (
    <div className="App">
      <header className="App-header">
        <nav>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/login">Login</Link></li>
          </ul>
        </nav>
        <p>This is the Login Page</p>
        <div className='Login-Form'>
          <form onSubmit={HandleLogin}>
            <label>Username:
              <input type="text" id="username" placeholder="Username" value={username} onChange={(e) => SetUsername(e.target.value)}/>
            </label><br></br>
            <label>Password:
              <input type="password" id="password" value={password} onChange={(e) => SetPassword(e.target.value)}/>
            </label><br></br>
            <input type="submit" />
          </form>
        </div>
      </header>
    </div>
  );
}