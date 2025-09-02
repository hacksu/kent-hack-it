import React from 'react';
import Navbar from '../components/navbar.js';
import '../App.css';

export function Home() {
  return (
    <div className="App">
      <Navbar />
      <header className="App-header d-flex flex-column" style={{ minHeight: '100vh', padding: '1rem 0' }}>
        {/* Hero Section */}
        <div className="text-center mb-auto">
          <h1 className="display-4 fw-bold mb-3">KHI</h1>
          <h4 className="lead">What is KHI?</h4>
        </div>

        {/* Main Content Container - Flexible sizing */}
        <div className="container-fluid px-4 flex-grow-1 d-flex flex-column justify-content-center">
          <div className="row justify-content-center h-100">
            <div className="col-xl-10 col-lg-11 d-flex flex-column">
              
              {/* About Section */}
              <div className="card p-3 p-md-4 shadow-sm mb-3 mb-md-4 flex-shrink-0">
                <div className="card-body">
                  <h3 className="text-center mb-3 mb-md-4" style={{ color: '#007bff' }}>About Kent Hack Enough</h3>

                  <p className="text-center mb-3 mb-md-4" style={{ fontSize: 'clamp(1rem, 2.5vw, 1.2rem)', lineHeight: '1.6' }}>
                    KHI is a <a href="https://hacksu.com/" className="link-primary">HacKSU</a> sponsored 
                    Capture The Flag (CTF) competition, where Computer Science and Cyber Security enthusiasts can 
                    connect with others and compete together to tackle challenges built by the HacKSU club!
                  </p>

                  <div className="row mt-3 mt-md-4">
                    <div className="col-md-6 mb-2 mb-md-3">
                      <p className="mb-0" style={{ fontSize: 'clamp(0.9rem, 2vw, 1.1rem)' }}>
                        Interested in other HacKSU events? Check out our yearly hackathon 
                        <a href="https://khe.io" className="link-primary"> KHE</a>.
                      </p>
                    </div>
                    <div className="col-md-6 mb-2 mb-md-3">
                      <p className="mb-0" style={{ fontSize: 'clamp(0.9rem, 2vw, 1.1rem)' }}>
                        Want to help support HacKSU? Check out our 
                        <a href="https://www.redbubble.com/people/KentStateCS/shop" className="link-primary"> Merch Store</a>!
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* FAQ Section */}
              <div className="card p-3 p-md-4 shadow-sm flex-grow-1 d-flex flex-column">
                <div className="card-body d-flex flex-column">
                  <h3 className="text-center mb-3 mb-md-4">Frequently Asked Questions</h3>
                  
                  <div className="accordion flex-grow-1" id="faqAccordion">
                    <div className="accordion-item mb-2 mb-md-3">
                      <h2 className="accordion-header">
                        <button 
                          className="accordion-button collapsed" 
                          type="button" 
                          data-bs-toggle="collapse" 
                          data-bs-target="#faq1"
                          style={{ fontSize: 'clamp(0.95rem, 2.2vw, 1.1rem)' }}
                        >
                          What is a Capture The Flag (CTF) competition?
                        </button>
                      </h2>
                      <div id="faq1" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                        <div className="accordion-body" style={{ fontSize: 'clamp(0.85rem, 2vw, 1rem)', lineHeight: '1.6' }}>
                          CTF competitions are events where participants solve security-related challenges to find "flags" and earn points. 
                          These challenges test various cybersecurity skills including cryptography, web security, forensics, and reverse engineering.
                        </div>
                      </div>
                    </div>

                    <div className="accordion-item mb-2 mb-md-3">
                      <h2 className="accordion-header">
                        <button 
                          className="accordion-button collapsed" 
                          type="button" 
                          data-bs-toggle="collapse" 
                          data-bs-target="#faq2"
                          style={{ fontSize: 'clamp(0.95rem, 2.2vw, 1.1rem)' }}
                        >
                          Do I need to be an expert to participate?
                        </button>
                      </h2>
                      <div id="faq2" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                        <div className="accordion-body" style={{ fontSize: 'clamp(0.85rem, 2vw, 1rem)', lineHeight: '1.6' }}>
                          Not at all! CTFs are designed for all skill levels, and we encourage everyone to join and learn. 
                          We have challenges ranging from beginner-friendly to advanced levels.
                        </div>
                      </div>
                    </div>

                    <div className="accordion-item mb-2 mb-md-3">
                      <h2 className="accordion-header">
                        <button 
                          className="accordion-button collapsed" 
                          type="button" 
                          data-bs-toggle="collapse" 
                          data-bs-target="#faq3"
                          style={{ fontSize: 'clamp(0.95rem, 2.2vw, 1.1rem)' }}
                        >
                          How can I prepare for the competition?
                        </button>
                      </h2>
                      <div id="faq3" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                        <div className="accordion-body" style={{ fontSize: 'clamp(0.85rem, 2vw, 1rem)', lineHeight: '1.6' }}>
                          We recommend practicing with online CTF platforms like OverTheWire, PicoCTF, or HackTheBox. 
                          Review common security topics and join our Discord for tips and discussions!
                        </div>
                      </div>
                    </div>

                    <div className="accordion-item mb-2 mb-md-3">
                      <h2 className="accordion-header">
                        <button 
                          className="accordion-button collapsed" 
                          type="button" 
                          data-bs-toggle="collapse" 
                          data-bs-target="#faq4"
                          style={{ fontSize: 'clamp(0.95rem, 2.2vw, 1.1rem)' }}
                        >
                          How many people can be on a team?
                        </button>
                      </h2>
                      <div id="faq4" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                        <div className="accordion-body" style={{ fontSize: 'clamp(0.85rem, 2vw, 1rem)', lineHeight: '1.6' }}>
                          Teams can have up to 4 members. We encourage collaboration and teamwork! 
                          You can also participate individually if you prefer.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Spacer for bottom */}
        <div className="mb-auto"></div>

      </header>
    </div>
  );
}