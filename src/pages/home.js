import '../App.css';
import { Link } from 'react-router-dom'; // needed to interact with the React App BrowserRouter

export function Home() {
  return (
    <div className="App">
      <header className="App-header">
        <nav>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/login">Login</Link></li>
          </ul>
        </nav>
        <p>This is the Home Page</p>
      </header>
    </div>
  );
}