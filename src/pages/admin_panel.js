import { useEffect, useState } from 'react';
import Navbar, { VerifyAdmin } from '../components/navbar.js';

import AdminTeamsTab from '../components/admin_panel/teams.js'
import AdminUsersTab from '../components/admin_panel/users.js'
import AdminView from '../components/admin_panel/admins.js'

import AdminChallengeCreateTab from '../components/admin_panel/create.js'
import AdminChallengeViewTab from '../components/admin_panel/view.js'
import AdminChallengeUploadTab from '../components/admin_panel/upload.js'

import '../App.css';

export function AdminPanel() {
    const [activeTab, setActiveTab] = useState("users");
    const [msgContent, setMsgContent] = useState("");
    const [isAuth, SetAuth] = useState(false);
    const [siteActive, SetSiteActive] = useState(false);

    useEffect(() => {
        async function Verify() {
            const authenticated = await VerifyAdmin();
            SetAuth(authenticated);
            if (authenticated === false) {
                window.location.href = "/login"
            }
        }
        Verify();
        
        async function CheckSite() {
            try {
                const response = await fetch(`/api/admin/get_site_info`, {
                    method: "GET",
                    credentials: 'include'  // ensures cookies are sent
                });

                const data = await response.json();
                if (data) {
                    SetSiteActive(data.activated);
                } else {
                    SetSiteActive(false);
                }
            } catch (err) {
                console.error(err)
            }
        }
        CheckSite();
    }, []); // run once on page-load

    async function ChangeTab(tab_name) {
        setMsgContent("")
        setActiveTab(tab_name);
    }

    async function ModifySiteSettings(newValue) {
        try {
            const response = await fetch(`/api/admin/update_site_info`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ activated: newValue }),
                credentials: "include",
            });

            const data = await response.json();
            if (data) {
                if (data.acknowledge) {
                    SetSiteActive(newValue);
                }
            }
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <>
            {isAuth === true ? (
                <>
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

                            <div>
                                <button
                                    className={`btn ${siteActive ? "btn-success" : "btn-danger"}`}
                                    style={{ fontSize: "1.5rem", padding: "0.5rem 1rem" }}
                                    onClick={() => ModifySiteSettings(!siteActive)}
                                >
                                    {siteActive ? "Site Active" : "Site Inactive"}
                                </button>
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
                                        {activeTab === "upload" && (
                                            <AdminChallengeUploadTab />
                                        )}
                                    </>
                                </div>
                            </div>

                        </header>
                    </div>
                </>
            ) : (
                <>
                    <h1>Page Loading. . .</h1>
                </>
            )}
        </>
    );
}