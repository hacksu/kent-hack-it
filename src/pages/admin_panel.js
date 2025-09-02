import { useEffect, useState } from 'react';
import Navbar, { VerifyAdmin } from '../components/navbar.js';

import AdminTeamsTab from '../components/admin_panel/teams.js'
import AdminUsersTab from '../components/admin_panel/users.js'
import AdminView from '../components/admin_panel/admins.js'

import AdminChallengeCreateTab from '../components/admin_panel/create.js'
import AdminChallengeViewTab from '../components/admin_panel/view.js'
import AdminChallengeEditTab from '../components/admin_panel/edit.js';
import AdminChallengeUploadTab from '../components/admin_panel/upload.js'

import '../App.css';

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState("users");
  const [msgContent, setMsgContent] = useState("");

  useEffect(() => {
    async function Verify() {
      const authenticated = await VerifyAdmin();
      if (authenticated === false) {
        window.location.href = "/login"
      }
    }
    Verify();
  }, []); // run once on page-load

  async function ChangeTab(tab_name) {
    setMsgContent("")
    setActiveTab(tab_name);
  }

  return (
    <div className="App">
      <Navbar />
      <header
        className="App-header"
        style={{
          display: 'block',
          height: 'auto',
          paddingTop: '0',
        }}>
        <h1 style={{ padding: '15px' }}>Admin Panel</h1>

        {/* msgContent is not user controlled */}
        <div
          id='msg_popup'
          style={{ padding: '5px' }}
          dangerouslySetInnerHTML={{ __html: msgContent }}>
        </div>

        <div className="container">
          <ul className="nav nav-tabs">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "users" ? "active" : ""}`}
                style={{ fontSize: "1.5rem", padding: "0.25rem 0.5rem" }}
                onClick={() => ChangeTab("users")}
              >
                Users
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "teams" ? "active" : ""}`}
                style={{ fontSize: "1.5rem", padding: "0.25rem 0.5rem" }}
                onClick={() => ChangeTab("teams")}
              >
                Teams
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "admins" ? "active" : ""}`}
                style={{ fontSize: "1.5rem", padding: "0.25rem 0.5rem" }}
                onClick={() => ChangeTab("admins")}
              >
                Admins
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "view" ? "active" : ""}`}
                style={{ fontSize: "1.5rem", padding: "0.25rem 0.5rem" }}
                onClick={() => ChangeTab("view")}
              >
                View Challenges
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "create" ? "active" : ""}`}
                style={{ fontSize: "1.5rem", padding: "0.25rem 0.5rem" }}
                onClick={() => setActiveTab("create")}
              >
                Create Challenge
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "upload" ? "active" : ""}`}
                style={{ fontSize: "1.5rem", padding: "0.25rem 0.5rem" }}
                onClick={() => ChangeTab("upload")}
              >
                Upload
              </button>
            </li>
          </ul>

          <div className="tab-content mt-4">
            <>
              {activeTab === "users" && (
                <AdminUsersTab />
              )}
            </>

            <>
              {activeTab === "teams" && (
                <AdminTeamsTab />
              )}
            </>

            <>
              {activeTab === "admins" && (
                <AdminView />
              )}
            </>

            <>
              {activeTab === "create" && (
                <AdminChallengeCreateTab />
              )}
            </>

            <>
              {activeTab === "view" && (
                <AdminChallengeViewTab />
              )}
            </>

            <>
              {activeTab === "edit" && (
                  <AdminChallengeEditTab />
              )}
            </>

            <>
              {activeTab === "upload" && (
                <AdminChallengeUploadTab />
              )}
            </>
          </div>
        </div>

      </header>
    </div>
  );
}