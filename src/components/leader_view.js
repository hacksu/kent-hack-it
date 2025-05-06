import '../App.css';

const LeaderView = ({ TEAM_DATA, UpdateTeamName, newTeamName,
                      SetNewTeamName, BackendHost, SetTeamUpdateMsg }) => {
  
  const RemoveMember = async (member_name) => {
    try {
      const response = await fetch(`http://${BackendHost}/team/remove-member`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "member_username": member_name
        }),
        credentials: 'include'  // ensures cookies are sent
      });

      // { message }
      const data = await response.json();
      if (data) {
        SetTeamUpdateMsg(data.message);
      } else {
        SetTeamUpdateMsg("Error Removing Member!");
      }
    } catch (error) {
      console.error("Error sending request:", error);
    }
  };
  const AddMember = async (req_id, checksum) => {
    try {
      const response = await fetch(`http://${BackendHost}/team/add-member`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "request_id": req_id,
          "checksum": checksum,
        }),
        credentials: 'include'  // ensures cookies are sent
      });

      // { message }
      const data = await response.json();
      if (data) {
        SetTeamUpdateMsg(data.message);
      } else {
        SetTeamUpdateMsg("Error Adding Member!");
      }
    } catch (error) {
      console.error("Error sending request:", error);
    }
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