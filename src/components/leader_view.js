import '../App.css';

const LeaderView = ({ TEAM_DATA, UpdateTeamName, newTeamName, SetNewTeamName }) => {
  
  const RemoveMember = async () => {
  };
  const AddMember = async (sender_id, checksum) => {
    alert(sender_id);
  };

  return (
    <>
    {/*
        A Team-Leader can Update Team Details:
          - Add/Remove Members
          - Change Team Name
    */}

    <div className="container mt-4">
      <div className="card shadow">
        <div className="card-body">
          <h3 className="card-title text-center mb-3">Team: {TEAM_DATA.name}</h3>

          <div className="mb-4">
            <label className="form-label">Change Team Name:</label>
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                value={newTeamName}
                onChange={(e) => SetNewTeamName(e.target.value)}
              />
              <button
                className="btn btn-primary"
                onClick={UpdateTeamName}
              >
                Update
              </button>
            </div>
          </div>
          <hr />

          <p><strong>Team Leader:</strong> {TEAM_DATA.team_leader}</p>

          <div className="mb-3">
            <h5>Members:</h5>
            <ul className="list-group">
              {TEAM_DATA.members && TEAM_DATA.members.length > 0 ? (
                TEAM_DATA.members.map((member, index) => (
                  <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                    {member}
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => RemoveMember(member)}
                      disabled={member === TEAM_DATA.team_leader}
                    >
                      Remove
                    </button>
                  </li>
                ))
              ) : (
                <li className="list-group-item text-muted">No members</li>
              )}
            </ul>
          </div>
          <hr />

          <div>
            <h5>Completions:</h5>
            <ul className="list-group">
              {TEAM_DATA.completions && TEAM_DATA.completions.length > 0 ? (
                TEAM_DATA.completions.map((challenge, index) => (
                  <li key={index} className="list-group-item">
                    {challenge}
                  </li>
                ))
              ) : (
                <li className="list-group-item text-muted">No completions yet</li>
              )}
            </ul>
          </div>
          <hr />

          {/*
                join_requests => { _id, sender_name, checksum }
          */}
          {TEAM_DATA.join_requests && TEAM_DATA.join_requests.length > 0 ? (
            <div className="mt-4">
              <h5>Join Requests:</h5>
              {TEAM_DATA.join_requests.map((request, index) => (
                <div key={index} className="mb-2">
                  <button
                    className="btn btn-warning"
                    onClick={() => {
                      if (window.confirm(`Are you sure?`)) {
                        AddMember(request._id, request.checksum);
                      }
                    }}
                  >
                    Accept Request: {request.sender_name}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4">
              <p>No Requests at this time.</p>
            </div>
          )}
          <hr />

        </div>
      </div>
    </div>
    </>
  );  
};
export default LeaderView;