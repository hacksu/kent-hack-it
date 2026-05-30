<script lang="ts">
    import { onMount } from "svelte";

    const { data } = $props();

    // Countdown timer
    let timeLeft = $state("Loading...");
    let countdownLabel = $state("Event starts in:");

    let timer: NodeJS.Timeout|undefined = undefined;
    let showTimer = $state(true);

    function updateCountdown() {
        const now = new Date().getTime();
        const start = new Date(data.eventStartDate).getTime();
        const end = new Date(data.eventEndDate).getTime();

        if (now < start) {
            countdownLabel = "Event starts in:";
            const distance = start - now;
            const days    = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours   = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            timeLeft = `${days}d ${hours}h ${minutes}m ${seconds}s`;
        } else if (now >= start && now < end) {
            countdownLabel = "Event ends in:";
            const distance = end - now;
            const days    = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours   = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            timeLeft = `${days}d ${hours}h ${minutes}m ${seconds}s`;
        } else {
            countdownLabel = "Event over";
            timeLeft = "";
            showTimer = false;
            clearInterval(timer);
        }
    }

    onMount(() => {
        updateCountdown();
        timer = setInterval(updateCountdown, 1000);
    });

    // Dynamic event year info
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const eventYear = currentMonth < 9 ? currentYear : currentYear + 1;
    const eventMonthLabel = currentMonth < 9 ? "this" : "next";
</script>

<main>
  <header class="d-flex flex-column" style="min-height: 100vh; padding: 1rem 0;">
    <!-- Hero Section -->
    <div class="text-center mb-auto">
      <h1 class="display-4 fw-bold mb-3">KENT HACK IT</h1>
      <div class="mb-4">
        <a href="/auth/login" class="btn btn-primary btn-lg px-4 py-4" style="font-size: clamp(1.3rem, 4vw, 2rem); font-weight: bold; min-width: 250px;">
          Register Here
        </a>
      </div>
      <div class="text-center mb-3">
        <h4 class="mb-2" style="color: #b7b7b7ff;">{countdownLabel}</h4>
        {#if showTimer}
            <div class="countdown-timer p-2 rounded" style="background-color: #f8f9fa; border: 2px solid #007bff; display: inline-block; font-family: monospace; font-size: clamp(1.2rem, 3vw, 1.8rem); font-weight: bold; color: #007bff;">
                {timeLeft}
            </div>
        {/if}
      </div>
    </div>

    <!-- Main Content Container -->
    <div class="container-fluid px-4 flex-grow-1 d-flex flex-column">
      <div class="row justify-content-center h-100">
        <div class="col-xl-10 col-lg-11 d-flex flex-column">

          <!-- About Section -->
          <div class="card p-3 p-md-4 shadow-sm mb-3 mb-md-4 flex-shrink-0">
            <div class="card-body">
              <h3 class="text-center mb-3 mb-md-4" style="color: #007bff;">About KHI</h3>
              <p class="text-center mb-3 mb-md-4" style="font-size: clamp(1rem, 2.5vw, 1.2rem); line-height: 1.6;">
                KHI is a <a href="https://hacksu.com/" class="link-primary">HacKSU</a> sponsored 
                Capture The Flag (CTF) competition, where Computer Science and Cyber Security enthusiasts can 
                connect with others and compete together to tackle challenges built by the HacKSU club!
                <br><br>
                Whether you're a beginner looking to learn or an experienced hacker aiming to test your skills,
                KHI offers a variety of challenges that cater to all skill levels. Join us for an exciting week 
                of problem-solving, teamwork, and fun!
                <br><br>
                Our {eventYear} Event will take place in {eventMonthLabel} October, more details to come soon!
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
                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq1" style="font-size: clamp(0.95rem, 2.2vw, 1.1rem);">
                      What is a Capture The Flag (CTF) competition?
                    </button>
                  </h2>
                  <div id="faq1" class="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                    <div class="accordion-body" style="font-size: clamp(0.85rem, 2vw, 1rem); line-height: 1.6;">
                      CTF competitions are events where participants solve security-related challenges to find "flags" and earn points. 
                      These challenges test various cybersecurity skills including cryptography, web security, forensics, and reverse engineering.
                    </div>
                  </div>
                </div>

                <!-- FAQ 2 -->
                <div class="accordion-item mb-2 mb-md-3">
                  <h2 class="accordion-header">
                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq2" style="font-size: clamp(0.95rem, 2.2vw, 1.1rem);">
                      Do I need to be an expert to participate?
                    </button>
                  </h2>
                  <div id="faq2" class="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                    <div class="accordion-body" style="font-size: clamp(0.85rem, 2vw, 1rem); line-height: 1.6;">
                      Not at all! CTFs are designed for all skill levels, and we encourage everyone to join and learn. 
                      We have challenges ranging from beginner-friendly to advanced levels.
                    </div>
                  </div>
                </div>

                <!-- FAQ 3 -->
                <div class="accordion-item mb-2 mb-md-3">
                  <h2 class="accordion-header">
                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq3" style="font-size: clamp(0.95rem, 2.2vw, 1.1rem);">
                      How can I prepare for the competition?
                    </button>
                  </h2>
                  <div id="faq3" class="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                    <div class="accordion-body" style="font-size: clamp(0.85rem, 2vw, 1rem); line-height: 1.6;">
                      We recommend practicing with online CTF platforms like OverTheWire, PicoCTF, or HackTheBox. 
                      Review common security topics and join our Discord for tips and discussions!<br><br>
                      <strong>Some Challenges might use Kali Linux for completion!</strong> Check out our 
                      <a href="/kali-setup-guide" class="link-primary">Kali Linux VM Setup Guide</a>.
                    </div>
                  </div>
                </div>

                <!-- FAQ 4 -->
                <div class="accordion-item mb-2 mb-md-3">
                  <h2 class="accordion-header">
                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq4" style="font-size: clamp(0.95rem, 2.2vw, 1.1rem);">
                      How many people can be on a team?
                    </button>
                  </h2>
                  <div id="faq4" class="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                    <div class="accordion-body" style="font-size: clamp(0.85rem, 2vw, 1rem); line-height: 1.6;">
                      Teams can have up to 4 members. We encourage collaboration and teamwork! 
                      You can also participate individually if you prefer.
                    </div>
                  </div>
                </div>

                <!-- FAQ 5 -->
                <div class="accordion-item mb-2 mb-md-3">
                  <h2 class="accordion-header">
                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq5" style="font-size: clamp(0.95rem, 2.2vw, 1.1rem);">
                      How do I create or join a team on your site?
                    </button>
                  </h2>
                  <div id="faq5" class="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                    <div class="accordion-body" style="font-size: clamp(0.85rem, 2vw, 1rem); line-height: 1.6;">
                      After registering and logging in, navigate to the <strong>Profile</strong> section, then click <strong>Go to Team Page</strong>. 
                      There you can create a new team or join an existing team. Team leaders approve requests. Teams limited to 4 members maximum.
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