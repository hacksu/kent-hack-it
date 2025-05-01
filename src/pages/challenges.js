import '../App.css';
import Navbar from '../components/navbar.js'

export function Challenges() {
  return (
    <div className="App">
      <Navbar/> {/* Custom React Component to maintain DRY code */}
      <header className="App-header">
        <p>This is the Challenges Page</p>
      </header>
    </div>
  );
}