import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; // When the user moves around different pages the browser URL updates correctly
import { Login } from './pages/login.js' // custom js that returns HTML
import { Home } from './pages/home.js'
import { Profile } from './pages/profile.js'
import { Register } from './pages/register.js'
import { Challenges } from './pages/challenges.js'
import { RatingPage } from './pages/rate_challenge.js'
import { ChallengeDetail } from './pages/challenge_template.js'

// index.html handles the html format of the page layout to a certain point
function App() {
  return (
    // HTML content is loaded based on the route loaded
    <Router>
      <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/register" element={<Register />} />
          <Route path="/compete" element={<Challenges />} />
          <Route path="/challenge" element={<ChallengeDetail />} />
          <Route path="/rate-challenge" element={<RatingPage />} />
      </Routes>
    </Router>
  );
}
export default App;