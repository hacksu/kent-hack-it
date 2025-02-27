import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; // When the user moves around different pages the browser URL updates correctly
import { Login } from './pages/login' // custom js that returns HTML
import { Home } from './pages/home'

function App() {
  return (
    // HTML content is loaded based on the route loaded
    <Router>
      <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}
export default App;