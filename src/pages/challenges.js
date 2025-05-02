import React, { useState } from 'react';
import '../App.css';
import Navbar from '../components/navbar.js';

export function Challenges() {
  const [navbarHeight, setNavbarHeight] = useState(0);

  return (
    <div className="App">
      <Navbar onHeightChange={setNavbarHeight} />
      <header
        className="App-header"
        style={{ minHeight: `calc(100vh - ${navbarHeight}px)` }}
      >
        <p>This is the Challenges Page</p>
      </header>
    </div>
  );
}