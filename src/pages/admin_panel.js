import React, { useEffect } from 'react';
import AdminNavbar, { VerifyAdminSession } from '../components/admin_navbar.js';
import '../App.css';

export function AdminPanel() {
  useEffect(() => {
    async function Verify() {
      const authenticated = await VerifyAdminSession();
      if (authenticated === false) {
        window.location.href = "/admin"
      }
    }
    Verify();
  }, []); // run once on page-load

  return (
    <div className="App">
      <AdminNavbar />
      <header className="App-header">
        <h1>Admin Panel</h1>

        <div class="container mt-4">
          <div class="card p-4 shadow-sm">
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.  
              Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.  
              Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
            </p>
          </div>
        </div>

      </header>
    </div>
  );
}