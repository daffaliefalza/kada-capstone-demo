import User from '../models/User.js'
import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth2'
import dotenv from 'dotenv'

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      callbackURL: 'http://localhost:8000/api/auth/login/google/callback',
      scope: ['profile', 'email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Try to find existing user
        const existingUser = await User.findOne({
          $or: [
            { email: profile._json.email },
            { socialId: profile._json.sub }
          ]
        });

        if (existingUser) {
          // Update profile image if it's not set
          if (!existingUser.profileImageUrl) {
            existingUser.profileImageUrl = profile._json.picture;
            await existingUser.save();
          }
          return done(null, existingUser);
        }

        // Create new user
        const newUser = await User.create({
          name: profile._json.name,
          email: profile._json.email,
          profileImageUrl: profile._json.picture,
          registerType: 'google',
          socialId: profile._json.sub,
          // No password for Google-authenticated users
        });

        return done(null, newUser);
      } catch (err) {
        return done(err);
      }
    }
  )
);

export default passport;