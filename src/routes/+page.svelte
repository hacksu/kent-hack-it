<script lang="ts">
    // replace so it is dynamic
    let countdownLabel = "Event starts in:";
    let timeLeft = "00:12:34";
</script>

<main>
  <header class="App-header d-flex flex-column" style="min-height: 100vh; padding: 1rem 0;">
    <div class="text-center mb-auto">
      <h1 class="display-4 fw-bold mb-3">KENT HACK IT</h1>

      <div class="mb-4">
        <a 
          href="/profile" 
          class="btn btn-primary btn-lg px-4 py-4" 
          style="font-size: clamp(1.3rem, 4vw, 2rem); font-weight: bold; min-width: 250px;"
        >
          Register Here
        </a>
      </div>

      <div class="text-center mb-3">
        <h4 class="mb-2" style="color: #b7b7b7ff;">{countdownLabel}</h4>
        <div 
          class="countdown-timer p-2 rounded" 
          style="
            background-color: #f8f9fa; 
            border: 2px solid #007bff; 
            display: inline-block; 
            font-family: monospace; 
            font-size: clamp(1.2rem, 3vw, 1.8rem); 
            font-weight: bold; 
            color: #007bff;
          "
        >
          {timeLeft || 'Loading...'}
        </div>
      </div>
    </div>

    <div class="container-fluid px-4 flex-grow-1 d-flex flex-column justify-content-center">
      <div class="row justify-content-center h-100">
        <div class="col-xl-10 col-lg-11 d-flex flex-column">

          <div class="card p-3 p-md-4 shadow-sm mb-3 mb-md-4 flex-shrink-0">
            <div class="card-body">
              <h3 class="text-center mb-3 mb-md-4" style="color: #007bff;">About KHI</h3>

              <p class="text-center mb-3 mb-md-4" style="font-size: clamp(1rem, 2.5vw, 1.2rem); line-height: 1.6;">
                KHI is a <a href="https://hacksu.com/" class="link-primary">HacKSU</a> sponsored Capture The Flag (CTF) competition, 
                where Computer Science and Cyber Security enthusiasts can connect and compete together.
                Whether you're a beginner or experienced, KHI offers challenges for all skill levels!
              </p>

              <div class="row mt-3 mt-md-4">
                <div class="col-md-6 mb-2 mb-md-3">
                  <p class="mb-0" style="font-size: clamp(0.9rem, 2vw, 1.1rem);">
                    Interested in other HacKSU events? Check out our yearly hackathon 
                    <a href="https://khe.io" class="link-primary"> KHE</a>.
                  </p>
                </div>

                <div class="col-md-6 mb-2 mb-md-3">
                  <p class="mb-0" style="font-size: clamp(0.9rem, 2vw, 1.1rem);">
                    Want to help support HacKSU? Check out our 
                    <a href="https://www.redbubble.com/people/KentStateCS/shop" class="link-primary"> Merch Store</a>!
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- FAQ Section -->
          <div class="card p-3 p-md-4 shadow-sm flex-grow-1 d-flex flex-column">
            <div class="card-body d-flex flex-column">
              <h3 class="text-center mb-3 mb-md-4">Frequently Asked Questions</h3>

              <div class="accordion flex-grow-1" id="faqAccordion">

                <!-- FAQ 1 -->
                <div class="accordion-item mb-2 mb-md-3">
                  <h2 class="accordion-header">
                    <button 
                      class="accordion-button collapsed" 
                      type="button" 
                      data-bs-toggle="collapse" 
                      data-bs-target="#faq1"
                      style="font-size: clamp(0.95rem, 2.2vw, 1.1rem);"
                    >
                      What is a Capture The Flag (CTF) competition?
                    </button>
                  </h2>
                  <div id="faq1" class="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                    <div class="accordion-body" style="font-size: clamp(0.85rem, 2vw, 1rem); line-height: 1.6;">
                      CTF competitions are events where participants solve security challenges to find "flags" and earn points.
                    </div>
                  </div>
                </div>

                <!-- FAQ 2 -->
                <div class="accordion-item mb-2 mb-md-3">
                  <h2 class="accordion-header">
                    <button 
                      class="accordion-button collapsed" 
                      type="button" 
                      data-bs-toggle="collapse" 
                      data-bs-target="#faq2"
                      style="font-size: clamp(0.95rem, 2.2vw, 1.1rem);"
                    >
                      Do I need to be an expert to participate?
                    </button>
                  </h2>
                  <div id="faq2" class="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                    <div class="accordion-body" style="font-size: clamp(0.85rem, 2vw, 1rem); line-height: 1.6;">
                      Not at all! CTFs are designed for all skill levels.
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </div>

    <div class="mb-auto"></div>
  </header>
</main>