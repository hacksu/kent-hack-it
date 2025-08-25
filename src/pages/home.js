import React from 'react';
import Navbar from '../components/navbar.js';
import '../App.css';

export function Home() {
  return (
    <div className="App">
      <Navbar />
      <header className="App-header">
        <h1>KHI</h1>
        <h4>What is KHI?</h4>

        <div class="container mt-4">
          <div class="card p-4 shadow-sm">
            <p>
              KHI is a <a href="https://hacksu.com/" class="link-primary">HacKSU</a> sponsored Capture The Flag (CTF) competition,
              where Computer Science and Cyber Security enthusiasts can connect
              with others and compete together to tackle challenges built by
              the HacKSU club!
            </p>

            <p>
              Interested in other HacKSU events? Check out our yearly hackathon <a href="https://khe.io" class="link-primary">KHE</a>.
            </p>

            <p>
              Want to help support HacKSU continue hosting these fun events?
              Check out our <a href="https://www.redbubble.com/people/KentStateCS/shop" class="link-primary">Merch Store</a>!
            </p>
          </div>
        </div>

      </header>
    </div>
  );
}