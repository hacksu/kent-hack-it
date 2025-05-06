import '../App.css';
import { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

// Define some colors for the pie chart
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#845EC2', '#FF6F91'];

const Stats = ({ TEAM_DATA, PROFILE_DATA }) => {
  const [view, setView] = useState('personal'); // 'personal' or 'team'

  const profileCompletions = PROFILE_DATA ? PROFILE_DATA.completions : null;
  const teamCompletions = TEAM_DATA ? TEAM_DATA.completions : null;

  console.log("Profile-Data:", PROFILE_DATA);

  return (
    <div>
      <div className="mb-3">
        <button
          className={`btn btn-sm ${view === 'personal' ? 'btn-primary' : 'btn-outline-primary'} me-2`}
          onClick={() => setView('personal')}
        >
          My Stats
        </button>
        <button
          className={`btn btn-sm ${view === 'team' ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => setView('team')}
        >
          Team Stats
        </button>
      </div>

      {view === 'personal' ? (
        <div>
          <h5>My Completions:</h5>
          {!profileCompletions ? (
            <p className="text-muted">Loading Profile Data. . .</p>
          ) : (
            <>
              <ul className="list-group">
                {profileCompletions.length > 0 ? (
                  profileCompletions.map((completion, index) => (
                    <li key={index} className="list-group-item">
                      {completion.name} — {new Date(completion.time).toLocaleString()}
                    </li>
                  ))
                ) : (
                  <li className="list-group-item text-muted">No completions yet</li>
                )}
              </ul>
            </>
          )}
        </div>
      ) : (
        <div>
          <h5>Team Completions:</h5>
          {TEAM_DATA ? (
            <>
              {!teamCompletions ? (
                <p className="text-muted">Loading Team Data. . .</p>
              ) : (
                <>
                  <ul className="list-group">
                    {teamCompletions.length > 0 ? (
                      teamCompletions.map((claim, index) => (
                        <li key={index} className="list-group-item">
                          {claim.name} — {claim.memberId}
                        </li>
                      ))
                    ) : (
                      <li className="list-group-item text-muted">No completions yet</li>
                    )}
                  </ul>
                </>
              )}
            </>
          ) : (
            <p className="text-muted">You're not on a Team.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Stats;