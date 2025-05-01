import '../App.css';
import Navbar from '../components/navbar.js'

export function Home() {
  return (
    <div className="App">
      <Navbar/> {/* Custom React Component to maintain DRY code */}
      <header className="App-header">
        <p>This is the Home Page</p>
      </header>
    </div>
  );
}