import React, { useState } from 'react';
import Navbar from '../components/navbar.js';
import '../App.css';

export function Home() {
  const [navbarHeight, setNavbarHeight] = useState(0);

  return (
    <div className="App">
      <Navbar onHeightChange={setNavbarHeight} />
      <header
        className="App-header"
        style={{ minHeight: `calc(100vh - ${navbarHeight}px)` }}
      >
        <p>This is the Home Page</p>
      </header>
    </div>
  );
}