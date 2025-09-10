import '../App.css';

import Navbar from '../components/navbar.js'

export function Login() {

    const HandleLogin = async (providerName) => {
        const width = 500;
        const height = 600;
        const left = (window.innerWidth - width) / 2;
        const top = (window.innerHeight - height) / 2;

        const oauthUrl = `/api/auth/${providerName}`;

        const oauthWindow = window.open(
            oauthUrl,
            "OAuth Login",
            `width=${width},height=${height},top=${top},left=${left}`
        );

        const handleMessage = (event) => {
            if (event.origin !== "https://ctf.hacksu.com") {
                console.log(`event.origin is different: ${event.origin}`);
                return; // check backend origin
            }

            if (event.data?.type === "OAUTH_SUCCESS") {
                window.location.href = "/compete";
            } else if (event.data?.type === "OAUTH_ERROR") {
                document.getElementById("msg_popup").innerText = event.data.message;
            }

            window.removeEventListener("message", handleMessage);
        };

        window.addEventListener("message", handleMessage);
    };

    // neater way to store a lot of in-line CSS to an element
    const buttonStyle = (bgColor, color = "white") => ({
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "10px",
        width: "100%",
        border: "none",
        borderRadius: "8px",
        backgroundColor: bgColor,
        color: color,
        fontSize: "16px",
        cursor: "pointer",
    });

    return (
        <div className="App">
            <Navbar />
            <header className="App-header">
                <div className="container mt-5">
                    <div className="row justify-content-center">
                        <div className="col-md-6">
                            <div className="card shadow">
                                <div className="card-body">
                                    <h3 className="card-title text-center mb-4">Login</h3>
                                    <div id='msg_popup'>
                                    </div>

                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: "12px",
                                            maxWidth: "250px",
                                            margin: "0 auto",        // centers the div horizontally
                                            alignItems: "center",    // centers content inside div
                                        }}
                                    >
                                        {/* Discord */}
                                        <button onClick={() => HandleLogin("discord")} style={buttonStyle("#5865F2")}>
                                            <img
                                                src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/discord.svg"
                                                alt="Discord"
                                                width="20"
                                                height="20"
                                                style={{ filter: "invert(1)" }}
                                            />
                                            Login with Discord
                                        </button>

                                        {/* GitHub */}
                                        <button onClick={() => HandleLogin("github")} style={buttonStyle("#24292e")}>
                                            <img
                                                src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/github.svg"
                                                alt="GitHub"
                                                width="20"
                                                height="20"
                                                style={{ filter: "invert(1)" }}
                                            />
                                            Login with GitHub
                                        </button>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
        </div>
    );
}