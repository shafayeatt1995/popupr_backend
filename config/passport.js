const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth2").Strategy;
const { API_URL, GOOGLE_CLIENT_ID, GOOGLE_SECRET } = process.env;

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((obj, done) => {
  done(null, obj);
});

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_SECRET,
      callbackURL: `${API_URL}/auth/social-login/google/callback`,
      passReqToCallback: true,
    },
    function (request, accessToken, refreshToken, profile, done) {
      request.passportUser = profile;
      return done(null, profile);
    }
  )
);
