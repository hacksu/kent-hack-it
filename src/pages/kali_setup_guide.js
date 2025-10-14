import React from 'react';
import Navbar from '../components/navbar.js';
import '../App.css';

export function KaliSetupGuide() {
    return (
        <div className="App">
            <Navbar />
            <header className="App-header d-flex flex-column" style={{ minHeight: '100vh', padding: '1rem 0' }}>

                {/* Main Content Container - Flexible sizing */}
                <div className="container-fluid px-4 flex-grow-1 d-flex flex-column justify-content-center">
                    <div className="row justify-content-center h-100">
                        <div className="col-xl-10 col-lg-11 d-flex flex-column">

                            {/* Header */}
                            <div className="text-center mb-4 mb-md-5 flex-shrink-0">
                                <h1 className="display-4 fw-bold mb-3" style={{ color: '#ffffffff', fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
                                    Kali Linux VM Setup Guide
                                </h1>
                                <p className="lead text" style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', lineHeight: '1.6' }}>
                                    Get ready for CTF competitions with a complete Kali Linux virtual machine setup
                                </p>
                            </div>

                            {/* Prerequisites */}
                            <div className="card p-3 p-md-4 shadow-sm mb-3 mb-md-4 flex-shrink-0">
                                <div className="card-body">
                                    <h3 className="card-title text-primary mb-3 mb-md-4" style={{ fontSize: 'clamp(1.3rem, 3vw, 1.75rem)' }}>Prerequisites</h3>
                                    <div className="alert alert-info">
                                        <h6 style={{ color: '#0d6efd', fontSize: 'clamp(1rem, 2.2vw, 1.15rem)' }}><i className="bi bi-info-circle me-2"></i>System Requirements</h6>
                                        <ul className="mb-0" style={{ fontSize: 'clamp(0.9rem, 2vw, 1rem)', lineHeight: '1.6' }}>
                                            <li><strong>RAM:</strong> At least 4GB (8GB+ recommended)</li>
                                            <li><strong>Storage:</strong> 25GB+ free disk space</li>
                                            <li><strong>CPU:</strong> 64-bit processor with virtualization support</li>
                                            <li><strong>OS:</strong> Windows, macOS, or Linux host system</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Step 1 */}
                            <div className="card p-3 p-md-4 shadow-sm mb-3 mb-md-4 flex-shrink-0">
                                <div className="card-body">
                                    <h3 className="card-title text-primary mb-3 mb-md-4" style={{ fontSize: 'clamp(1.3rem, 3vw, 1.75rem)' }}>
                                        <span className="badge bg-primary me-2">1</span>
                                        Choose and Install Virtualization Software
                                    </h3>

                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="border rounded p-3 mb-3">
                                                <h5 className="text-success">VirtualBox (Free)</h5>
                                                <p className="text-muted mb-2">Best for beginners and casual use</p>
                                                <a href="https://www.virtualbox.org/wiki/Downloads"
                                                    className="btn btn-outline-success btn-sm"
                                                    target="_blank"
                                                    rel="noopener noreferrer">
                                                    Download VirtualBox
                                                </a>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="border rounded p-3 mb-3">
                                                <h5 className="text-primary">VMware (Paid/Free Student)</h5>
                                                <p className="text-muted mb-2">Better performance, more features</p>
                                                <a href="https://www.vmware.com/products/workstation-player.html"
                                                    className="btn btn-outline-primary btn-sm"
                                                    target="_blank"
                                                    rel="noopener noreferrer">
                                                    Download VMware
                                                </a>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="alert alert-warning">
                                        <strong>Note:</strong> Enable virtualization in your BIOS/UEFI if you encounter issues.
                                        Look for "Intel VT-x" or "AMD-V" settings.
                                    </div>
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div className="card p-3 p-md-4 shadow-sm mb-3 mb-md-4 flex-shrink-0">
                                <div className="card-body">
                                    <h3 className="card-title text-primary mb-3 mb-md-4" style={{ fontSize: 'clamp(1.3rem, 3vw, 1.75rem)' }}>
                                        <span className="badge bg-primary me-2">2</span>
                                        Download Kali Linux
                                    </h3>

                                    <p>Download the official Kali Linux ISO from the official website:</p>
                                    <div className="text-center mb-3">
                                        <a href="https://www.kali.org/get-kali/"
                                            className="btn btn-primary btn-lg"
                                            target="_blank"
                                            rel="noopener noreferrer">
                                            <i className="bi bi-download me-2"></i>Download Kali Linux ISO
                                        </a>
                                    </div>

                                    <div className="alert alert-info">
                                        <h6 style={{ color: '#0d6efd' }}><i className="bi bi-lightbulb me-2"></i>Pro Tips:</h6>
                                        <ul className="mb-0">
                                            <li>Choose the <strong>"Installer"</strong> version for virtual machines</li>
                                            <li>Download size is approximately 3-4GB</li>
                                            <li>Verify the SHA256 checksum for security</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Step 3 */}
                            <div className="card p-3 p-md-4 shadow-sm mb-3 mb-md-4 flex-shrink-0">
                                <div className="card-body">
                                    <h3 className="card-title text-primary mb-3 mb-md-4" style={{ fontSize: 'clamp(1.3rem, 3vw, 1.75rem)' }}>
                                        <span className="badge bg-primary me-2">3</span>
                                        Create Virtual Machine
                                    </h3>

                                    <h5 className="text-secondary mb-3">VirtualBox Instructions:</h5>
                                    <ol className="list-group list-group-numbered mb-4">
                                        <li className="list-group-item">Open VirtualBox and click <strong>"New"</strong></li>
                                        <li className="list-group-item">
                                            <strong>Name:</strong> Kali Linux<br />
                                            <strong>Type:</strong> Linux<br />
                                            <strong>Version:</strong> Debian (64-bit)
                                        </li>
                                        <li className="list-group-item"><strong>RAM:</strong> Allocate 4GB (4096 MB) minimum, 8GB if available</li>
                                        <li className="list-group-item"><strong>Hard Disk:</strong> Create a new virtual hard disk (VDI format)</li>
                                        <li className="list-group-item"><strong>Storage:</strong> Dynamically allocated, 25GB minimum</li>
                                    </ol>

                                    <h5 className="text-secondary mb-3">VM Configuration:</h5>
                                    <div className="row">
                                        <div className="col-md-6">
                                            <ul className="list-unstyled">
                                                <li><strong>Processors:</strong> 2+ CPU cores</li>
                                                <li><strong>Video Memory:</strong> 128MB</li>
                                                <li><strong>3D Acceleration:</strong> Enabled</li>
                                            </ul>
                                        </div>
                                        <div className="col-md-6">
                                            <ul className="list-unstyled">
                                                <li><strong>Network:</strong> NAT (default)</li>
                                                <li><strong>Audio:</strong> Enabled</li>
                                                <li><strong>USB:</strong> USB 3.0 Controller</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Step 4 */}
                            <div className="card p-3 p-md-4 shadow-sm mb-3 mb-md-4 flex-shrink-0">
                                <div className="card-body">
                                    <h3 className="card-title text-primary mb-3 mb-md-4" style={{ fontSize: 'clamp(1.3rem, 3vw, 1.75rem)' }}>
                                        <span className="badge bg-primary me-2">4</span>
                                        Install Kali Linux
                                    </h3>

                                    <ol className="list-group list-group-numbered mb-4">
                                        <li className="list-group-item">
                                            Mount the Kali ISO to your VM's virtual CD drive
                                        </li>
                                        <li className="list-group-item">
                                            Start the VM and select <strong>"Graphical Install"</strong>
                                        </li>
                                        <li className="list-group-item">
                                            Choose your language, location, and keyboard layout
                                        </li>
                                        <li className="list-group-item">
                                            Set hostname: <code>kali</code> (or your preference)
                                        </li>
                                        <li className="list-group-item">
                                            Create a strong root password and user account
                                        </li>
                                        <li className="list-group-item">
                                            <strong>Partitioning:</strong> Use entire disk (recommended for beginners)
                                        </li>
                                        <li className="list-group-item">
                                            <strong>Software Selection:</strong> Choose "Desktop Environment" + "Default Tools"
                                        </li>
                                        <li className="list-group-item">
                                            Install GRUB bootloader to the virtual hard disk
                                        </li>
                                    </ol>

                                    <div className="alert alert-success">
                                        <strong>Installation complete!</strong> The VM will reboot into your new Kali Linux system.
                                    </div>
                                </div>
                            </div>

                            {/* Step 5 */}
                            <div className="card p-3 p-md-4 shadow-sm mb-3 mb-md-4 flex-shrink-0">
                                <div className="card-body">
                                    <h3 className="card-title text-primary mb-3 mb-md-4" style={{ fontSize: 'clamp(1.3rem, 3vw, 1.75rem)' }}>
                                        <span className="badge bg-primary me-2">5</span>
                                        Post-Installation Setup
                                    </h3>

                                    <h5 className="text-secondary mb-3">Essential First Steps:</h5>
                                    <div className="row">
                                        <div className="card bg-light mb-3">
                                            <div className="card-body">
                                                <h6 className="card-title">Update System</h6>
                                                <code className="small">
                                                    sudo apt update && sudo apt upgrade -y
                                                </code>
                                            </div>
                                        </div>
                                        
                                        <div className="card bg-light mb-3">
                                            <div className="card-body">
                                                <h6 className="card-title">Install useful Tools</h6>
                                                <code className="small">
                                                    sudo apt update && sudo apt install -y ghidra gobuster python3 python3-venv gcc g++ cmake make
                                                </code>
                                            </div>
                                        </div>
                                    </div>

                                    <h5 className="text-secondary mb-3">Essential CTF Tools:</h5>
                                    <p>Kali comes with most tools pre-installed, but here are some additional ones:</p>
                                    <div className="row">
                                        <div className="col-md-4">
                                            <ul className="list-unstyled">
                                                <li>🔍 <strong>Reconnaissance:</strong></li>
                                                <li>• nmap</li>
                                                <li>• gobuster</li>
                                                <li>• dirbuster</li>
                                            </ul>
                                        </div>
                                        <div className="col-md-4">
                                            <ul className="list-unstyled">
                                                <li>🛠️ <strong>Exploitation:</strong></li>
                                                <li>• metasploit</li>
                                                <li>• sqlmap</li>
                                                <li>• burp suite</li>
                                            </ul>
                                        </div>
                                        <div className="col-md-4">
                                            <ul className="list-unstyled">
                                                <li>🔐 <strong>Crypto/Forensics:</strong></li>
                                                <li>• john the ripper</li>
                                                <li>• hashcat</li>
                                                <li>• binwalk</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Tips and Troubleshooting */}
                            <div className="card p-3 p-md-4 shadow-sm mb-3 mb-md-4 flex-shrink-0">
                                <div className="card-body">
                                    <h3 className="card-title text-primary mb-3 mb-md-4" style={{ fontSize: 'clamp(1.3rem, 3vw, 1.75rem)' }}>
                                        <i className="bi bi-lightbulb me-2"></i>
                                        Tips & Troubleshooting
                                    </h3>

                                    <div className="row">
                                        <div className="col-md-6">
                                            <h5 className="text-success">Performance Tips</h5>
                                            <ul className="small">
                                                <li>Enable hardware acceleration</li>
                                                <li>Allocate sufficient RAM (8GB+)</li>
                                                <li>Use SSD storage if available</li>
                                                <li>Take snapshots before major changes</li>
                                                <li>Close unused applications</li>
                                            </ul>
                                        </div>
                                        <div className="col-md-6">
                                            <h5 className="text-warning">Common Issues</h5>
                                            <ul className="small">
                                                <li><strong>Slow performance:</strong> Increase RAM/CPU</li>
                                                <li><strong>Screen resolution:</strong> Install guest additions</li>
                                                <li><strong>Network issues:</strong> Check NAT settings</li>
                                                <li><strong>USB not working:</strong> Enable USB controller</li>
                                                <li><strong>Audio problems:</strong> Check audio drivers</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Security Note */}
                            <div className="alert alert-danger">
                                <h5 style={{ color: '#0d6efd' }}><i className="bi bi-shield-exclamation me-2"></i>Important Security Note</h5>
                                <p className="mb-0">
                                    <strong>Only use Kali Linux in controlled environments!</strong> This distribution contains
                                    powerful security tools that should only be used for educational purposes, authorized
                                    penetration testing, or in your own lab environment. Never use these tools against
                                    systems you don't own or don't have explicit permission to test.
                                </p>
                            </div>

                            {/* Footer */}
                            <div className="text-center mt-4 mt-md-5 flex-shrink-0">
                                <p className="text" style={{ color: '#ffffff', fontSize: 'clamp(0.9rem, 2vw, 1.1rem)', lineHeight: '1.6' }}>
                                    Ready to compete? <a href="/" className="link-primary" style={{ color: '#00f725ff' }}>Return to KHI Home </a>
                                    or <a href="/profile" className="link-primary" style={{ color: '#00f725ff' }}>Register for the CTF</a>
                                </p>
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