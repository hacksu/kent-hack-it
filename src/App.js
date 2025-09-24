import { useEffect } from 'react';
import { Navigate, BrowserRouter as Router, Route, Routes } from 'react-router-dom'; // When the user moves around different pages the browser URL updates correctly
import { Login } from './pages/login.js' // custom js that returns HTML
import { Home } from './pages/home.js'
import { Profile } from './pages/profile.js'
import { Challenges } from './pages/challenges.js'
import { AdminPanel } from './pages/admin_panel.js'
import { Leaderboard } from './pages/leaderboard.js'
import { RatingPage } from './pages/rate_challenge.js'
import { ChallengeDetail } from './pages/challenge_template.js'

// helper function for redirections
function ExternalRedirect({ to }) {
    useEffect(() => {
        window.location.href = to;
    }, [to]);

    return null;
}

// index.html handles the html format of the page layout to a certain point
function App() {
    return (
        // HTML content is loaded based on the route loaded
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/compete" element={<Challenges />} />
                <Route path="/admin/panel" element={<AdminPanel />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/challenge" element={<ChallengeDetail />} />
                <Route path="/rate-challenge" element={<RatingPage />} />
                {/* Redirection route */}
                <Route path="/admin" element={<Navigate to="/admin/panel" replace />} />
                <Route path="/discord" element={<ExternalRedirect to="https://discord.gg/rJDdvnt" newTab />} />
                <Route path="/tools" element={<ExternalRedirect to="https://dcode.fr" newTab />} />
            </Routes>
        </Router>
    );
}
export default App;