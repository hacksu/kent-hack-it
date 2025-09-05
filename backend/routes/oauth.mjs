import { Router } from "express";
import { OAuthGitHub, OAuthDiscord, OAuthLogout } from "../controllers/oauthController.mjs";

const router = Router();

// connects the given path to a function containing end-point logic
// IE: /auth/logout (the router gets and post expand from router mount)
router.get("/github/callback", OAuthGitHub);
router.get("/discord/callback", OAuthDiscord);

router.get("/logout", OAuthLogout);

export default router;