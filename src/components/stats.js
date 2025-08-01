import '../App.css';
import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

// Define some colors for the pie chart
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#845EC2', '#FF6F91'];

const Stats = ({ TEAM_DATA, PROFILE_DATA }) => {
  const [view, setView] = useState('personal'); // 'personal' or 'team'
  const [profileCompletions, SetProfileCompletions] = useState(null);
  const [teamCompletions, SetTeamCompletions] = useState(null);

  // Define the GatherData function inside the component
  async function GatherData() {
    try {
      const response = await fetch(`/api/data/get-completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "userCompletions": PROFILE_DATA ? PROFILE_DATA.completions : null,
          "teamCompletions": TEAM_DATA ? TEAM_DATA.completions : null
        }),
        credentials: 'include'  // ensures cookies are sent
      });

      const data = await response.json();
      SetProfileCompletions(data.userCompletions);
      SetTeamCompletions(data.teamCompletions);
    } catch (error) {
      console.error("Error sending request:", error);
    }
  }

  // Process team completions to count occurrences of member names
  const getPieChartData = (teamCompletions) => {
    const memberCount = {};

    teamCompletions.forEach(item => {
      const memberName = item.memberName;
      const flagPoints = item.points;
      if (memberName) {
        if (memberCount[memberName]) {
          memberCount[memberName] += flagPoints;
        } else {
          memberCount[memberName] = flagPoints;
        }
      }
    });

    return Object.keys(memberCount).map((memberName) => ({
      name: memberName,
      value: memberCount[memberName]
    }));
  };

  // Render PieChart
  const renderPieChart = (data) => {
    return (
      <PieChart width={400} height={400}>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={100}
          fill="#8884d8"
          label
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    );
  };

  // useEffect should call GatherData when the component is mounted
  useEffect(() => {
    GatherData();
    // eslint-disable-next-line
  }, [TEAM_DATA, PROFILE_DATA]);

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
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
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
            </div>
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
                  {teamCompletions.length > 0 ? (
                    renderPieChart(getPieChartData(teamCompletions))
                  ) : (
                    <p className="text-muted">No completions yet</p>
                  )}
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