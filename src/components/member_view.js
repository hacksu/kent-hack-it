import '../App.css';

const MemberView = ({ TEAM_DATA }) => {
  return (
    <>
    {/*
        A team-member can ONLY view team details
    */}
    <div className="container mt-4">
      <div className="card shadow">
        <div className="card-body">
          <h3 className="card-title text-center mb-3">{TEAM_DATA.name}</h3>

          <p><strong>Team Leader:</strong> {TEAM_DATA.team_leader}</p>

          <div className="mb-3">
            <h5>Members:</h5>
            <ul className="list-group">
              {TEAM_DATA.members && TEAM_DATA.members.length > 0 ? (
                TEAM_DATA.members.map((member, index) => (
                  <li key={index} className="list-group-item">
                    {member}
                  </li>
                ))
              ) : (
                <li className="list-group-item text-muted">No members</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
    </>
  );  
};
export default MemberView;