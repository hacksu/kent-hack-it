import { passport } from '../server.mjs';

// --- Helper functions to send postMessage responses ---
function sendOAuthSuccess(res, user) {
  console.log(`HOMEPATH -> ${process.env.HOMEPAGE_URL}`)

  res.send(`
    <script>
      window.opener.postMessage({
        type: "OAUTH_SUCCESS",
        user: {
          id: "${user._id}",
          username: "${user.username}",
          email: "${user.email || ""}",
          avatarUrl: "${user.avatarUrl || ""}",
          provider: "${user.provider}"
        }
      }, "${process.env.HOMEPAGE_URL}");
      window.close();
    </script>
  `);
}

function sendOAuthError(res, message) {
  res.send(`
    <script>
      window.opener.postMessage({
        type: "OAUTH_ERROR",
        message: "${message}"
      }, "${process.env.HOMEPAGE_URL}");
      window.close();
    </script>
  `);
}

// --- Routes ---
// GitHub login
export const OAuthGitHub = (req, res, next) => {
  passport.authenticate("github", async (err, user) => {
    if (err) {
      console.error("OAuth Error:", err);
      return sendOAuthError(res, "Internal server error");
    }
    if (!user) {
      console.error("OAuth Authentication Error");
      return sendOAuthError(res, "GitHub authentication failed");
    }

    try {
      await req.logIn(user, (err) => {
        if (err) {
          console.error("Login Error:", err);
          return sendOAuthError(res, "Login error");
        }
        console.log("Login Successful");
        sendOAuthSuccess(res, user);
      });
    } catch (err) {
      console.error("Unexpected login error:", err);
      sendOAuthError(res, "Unexpected login error");
    }
  })(req, res, next);
};

export const OAuthDiscord = (req, res, next) => {
  passport.authenticate("discord", async (err, user) => {
    if (err) {
      console.error("OAuth Error:", err);
      return sendOAuthError(res, "Internal server error");
    }
    if (!user) {
      console.error("OAuth Authentication Error");
      return sendOAuthError(res, "Discord authentication failed");
    }

    try {
      await req.logIn(user, (err) => {
        if (err) {
          console.error("Login Error:", err);
          return sendOAuthError(res, "Login error");
        }
        console.log("Login Successful");
        sendOAuthSuccess(res, user);
      });
    } catch (err) {
      console.error("Unexpected login error:", err);
      sendOAuthError(res, "Unexpected login error");
    }
  })(req, res, next);
};

// --- Logout route ---
export const OAuthLogout = (req, res) => {
  req.logout(err => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ message: "Logout failed" });
    }

    req.session.destroy((err) => {
      if (err) {
        console.error("Session destroy error:", err);
        return res.status(500).json({ message: "Session destruction failed" });
      }

      res.clearCookie("connect.sid");
      console.log("Logged out successfully!");
      res.json({ message: "Logged out successfully" });
    });
  });
};