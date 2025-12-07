import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-google-oauth20";
import { AuthService } from "../auth.service";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly authService: AuthService) {
    const clientID = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientID || !clientSecret) {
      throw new Error('GOOGLE_CLIENT_ID o GOOGLE_CLIENT_SECRET no están definidos en las variables de entorno.');
    }

    super({
      clientID,
      clientSecret,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/auth/google/callback',
      passReqToCallback: true,
      scope: [
        'openid',
        'profile',
        'email',
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
      ],
      userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo'
    });
  }

  async validate(request: any, accessToken: string, refreshToken: string, profile, done: Function) {
    try {
      const email = profile.emails?.[0]?.value || profile._json.email;
      const name = profile.displayName || `${profile.name.givenName} ${profile.name.familyName}`;
      const fotico = profile.photos?.[0]?.value || profile._json.picture;
      const result = await this.authService.validateOAuthLogin(email, name, fotico);
      done(null, { jwt: result.access_token });
    } catch (err) {
      done(err, false);
    }
  }
}
