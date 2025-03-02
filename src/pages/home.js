import '../App.css';
import Navbar from '../components/navbar.js'

export function Home() {
  return (
    <div className="App">
      <header className="App-header">
        <Navbar/> {/* Custom React Component to maintain DRY code */}
        <p>This is the Home Page</p>
      </header>
    </div>
  );
}