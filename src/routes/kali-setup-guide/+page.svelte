<main>
  <header class="App-header d-flex flex-column" style="min-height: 100vh; padding: 1rem 0;">
  
    <div class="container-fluid px-4 flex-grow-1 d-flex flex-column justify-content-center">
      <div class="row justify-content-center h-100">
        <div class="col-xl-10 col-lg-11 d-flex flex-column">

          <div class="text-center mb-4 mb-md-5 flex-shrink-0">
            <h1 class="display-4 fw-bold mb-3" style="color: #ffffffff; font-size: clamp(2rem, 5vw, 3.5rem);">
              Kali Linux VM Setup Guide
            </h1>
            <p class="lead text" style="font-size: clamp(1rem, 2.5vw, 1.25rem); line-height: 1.6;">
              Get ready for CTF competitions with a complete Kali Linux virtual machine setup
            </p>
          </div>

          <div class="card p-3 p-md-4 shadow-sm mb-3 mb-md-4 flex-shrink-0">
            <div class="card-body">
              <h3 class="card-title text-primary mb-3 mb-md-4" style="font-size: clamp(1.3rem, 3vw, 1.75rem);">Prerequisites</h3>
              <div class="alert alert-info">
                <h6 style="color: #0d6efd; font-size: clamp(1rem, 2.2vw, 1.15rem);">
                  <i class="bi bi-info-circle me-2"></i>System Requirements
                </h6>
                <ul class="mb-0" style="font-size: clamp(0.9rem, 2vw, 1rem); line-height: 1.6;">
                  <li><strong>RAM:</strong> At least 4GB (8GB+ recommended)</li>
                  <li><strong>Storage:</strong> 25GB+ free disk space</li>
                  <li><strong>CPU:</strong> 64-bit processor with virtualization support</li>
                  <li><strong>OS:</strong> Windows, macOS, or Linux host system</li>
                </ul>
              </div>
            </div>
          </div>

          <div class="card p-3 p-md-4 shadow-sm mb-3 mb-md-4 flex-shrink-0">
            <div class="card-body">
              <h3 class="card-title text-primary mb-3 mb-md-4" style="font-size: clamp(1.3rem, 3vw, 1.75rem);">
                <span class="badge bg-primary me-2">1</span>
                Choose and Install Virtualization Software
              </h3>
              <div class="row">
                <div class="col-md-6">
                  <div class="border rounded p-3 mb-3">
                    <h5 class="text-success">VirtualBox (Free)</h5>
                    <p class="text-muted mb-2">Best for beginners and casual use</p>
                    <a href="https://www.virtualbox.org/wiki/Downloads" class="btn btn-outline-success btn-sm" target="_blank" rel="noopener noreferrer">
                      Download VirtualBox
                    </a>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="border rounded p-3 mb-3">
                    <h5 class="text-primary">VMware (Paid/Free Student)</h5>
                    <p class="text-muted mb-2">Better performance, more features</p>
                    <a href="https://www.vmware.com/products/workstation-player.html" class="btn btn-outline-primary btn-sm" target="_blank" rel="noopener noreferrer">
                      Download VMware
                    </a>
                  </div>
                </div>
              </div>
              <div class="alert alert-warning">
                <strong>Note:</strong> Enable virtualization in your BIOS/UEFI if you encounter issues. Look for "Intel VT-x" or "AMD-V" settings.
              </div>
            </div>
          </div>

          <div class="card p-3 p-md-4 shadow-sm mb-3 mb-md-4 flex-shrink-0">
            <div class="card-body">
              <h3 class="card-title text-primary mb-3 mb-md-4" style="font-size: clamp(1.3rem, 3vw, 1.75rem);">
                <span class="badge bg-primary me-2">2</span>
                Download Kali Linux
              </h3>
              <p>Download the official Kali Linux ISO from the official website:</p>
              <div class="text-center mb-3">
                <a href="https://www.kali.org/get-kali/" class="btn btn-primary btn-lg" target="_blank" rel="noopener noreferrer">
                  <i class="bi bi-download me-2"></i>Download Kali Linux ISO
                </a>
              </div>
              <div class="alert alert-info">
                <h6 style="color: #0d6efd;"><i class="bi bi-lightbulb me-2"></i>Pro Tips:</h6>
                <ul class="mb-0">
                  <li>Choose the <strong>"Installer"</strong> version for virtual machines</li>
                  <li>Download size is approximately 3-4GB</li>
                  <li>Verify the SHA256 checksum for security</li>
                </ul>
              </div>
            </div>
          </div>

          <div class="card p-3 p-md-4 shadow-sm mb-3 mb-md-4 flex-shrink-0">
            <div class="card-body">
              <h3 class="card-title text-primary mb-3 mb-md-4" style="font-size: clamp(1.3rem, 3vw, 1.75rem);">
                <span class="badge bg-primary me-2">3</span>
                Create Virtual Machine
              </h3>
              <h5 class="text-secondary mb-3">VirtualBox Instructions:</h5>
              <ol class="list-group list-group-numbered mb-4">
                <li class="list-group-item">Open VirtualBox and click <strong>"New"</strong></li>
                <li class="list-group-item">
                  <strong>Name:</strong> Kali Linux<br>
                  <strong>Type:</strong> Linux<br>
                  <strong>Version:</strong> Debian (64-bit)
                </li>
                <li class="list-group-item"><strong>RAM:</strong> Allocate 4GB minimum, 8GB if available</li>
                <li class="list-group-item"><strong>Hard Disk:</strong> Create a new virtual hard disk (VDI format)</li>
                <li class="list-group-item"><strong>Storage:</strong> Dynamically allocated, 25GB minimum</li>
              </ol>
            </div>
          </div>

          <div class="card p-3 p-md-4 shadow-sm mb-3 mb-md-4 flex-shrink-0">
            <div class="card-body">
              <h3 class="card-title text-primary mb-3 mb-md-4" style="font-size: clamp(1.3rem, 3vw, 1.75rem);">
                <span class="badge bg-primary me-2">4</span>
                Install Kali Linux
              </h3>
              <ol class="list-group list-group-numbered mb-4">
                <li class="list-group-item">Mount the Kali ISO to your VM's virtual CD drive</li>
                <li class="list-group-item">Start the VM and select <strong>"Graphical Install"</strong></li>
                <li class="list-group-item">Choose your language, location, and keyboard layout</li>
                <li class="list-group-item">Set hostname: <code>kali</code></li>
                <li class="list-group-item">Create a strong root password and user account</li>
                <li class="list-group-item"><strong>Partitioning:</strong> Use entire disk (recommended for beginners)</li>
                <li class="list-group-item"><strong>Software Selection:</strong> Choose "Desktop Environment" + "Default Tools"</li>
                <li class="list-group-item">Install GRUB bootloader to the virtual hard disk</li>
              </ol>
              <div class="alert alert-success"><strong>Installation complete!</strong> The VM will reboot into your new Kali Linux system.</div>
            </div>
          </div>

        </div>
      </div>
    </div>

    <div class="mb-auto"></div>

  </header>
</main>