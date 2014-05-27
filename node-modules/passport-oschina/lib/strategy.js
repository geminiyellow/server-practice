/**
 * Module dependencies.
 */
var util = require('util')
var OAuth2Strategy = require('passport-oauth2')
var Profile = require('./profile')
var InternalOAuthError = require('passport-oauth2').InternalOAuthError;

/**
 * `Strategy` constructor.
 *
 * The OSChina authentication strategy authenticates requests by delegating to
 * OSChina using the OAuth 2.0 protocol.
 *
 * Applications must supply a `verify` callback which accepts an `accessToken`,
 * `refreshToken` and service-specific `profile`, and then calls the `done`
 * callback supplying a `user`, which should be set to `false` if the
 * credentials are not valid.  If an exception occured, `err` should be set.
 *
 * Options:
 *   - `clientID`      your OSChina application's Client ID
 *   - `clientSecret`  your OSChina application's Client Secret
 *   - `callbackURL`   URL to which OSChina will redirect the user after granting authorization
 *
 * Examples:
 *
 *     passport.use(new OSChinaStrategy({
 *         clientID: '123-456-789',
 *         clientSecret: 'shhh-its-a-secret'
 *         callbackURL: 'https://www.example.net/auth/oschina/callback'
 *       },
 *       function(accessToken, refreshToken, profile, done) {
 *         User.findOrCreate(..., function (err, user) {
 *           done(err, user);
 *         });
 *       }
 *     ));
 *
 * @param {Object} options
 * @param {Function} verify
 * @api public
 */
function Strategy(options, verify) {
  options = options || {};
  options.authorizationURL = options.authorizationURL || 'http://www.oschina.net/action/oauth2/authorize';
  options.tokenURL = options.tokenURL || 'http://www.oschina.net/action/openapi/token';
  options.scopeSeparator = options.scopeSeparator || ',';

  OAuth2Strategy.call(this, options, verify);
  this.name = 'OSChina';
  this._userProfileURL = options.userProfileURL || 'http://www.oschina.net/action/openapi/user';
  this._oauth2.useAuthorizationHeaderforGET(true);
}

/**
 * Inherit from `OAuth2Strategy`.
 */
util.inherits(Strategy, OAuth2Strategy);

/**
 * Retrieve user profile from OSChina.
 *
 * This function constructs a normalized profile, with the following properties:
 *
 *   - `provider`         always set to `oschina`
 *   - `id`               the user's OSChina ID
 *   - `username`         the user's OSChina username
 *   - `displayName`      the user's full name
 *   - `gender`           the user's gender: `male` or `female`
 *   - `location`         the user's locatione
 *   - `profileUrl`       the URL of the profile for the user on OSChina
 *   - `emails`           the proxied or contact email address granted by the user
 *   - `photos`           the user's photos
 *
 * @param {String} accessToken
 * @param {Function} done
 * @api protected
 */
Strategy.prototype.userProfile = function(accessToken, done) {
  this._oauth2.get(this._userProfileURL, accessToken, function (err, body, res) {
    var json;
    
    if (err) {
      return done(new InternalOAuthError('Failed to fetch user profile', err));
    }
    
    try {
      json = JSON.parse(body);
    } catch (ex) {
      return done(new Error('Failed to parse user profile'));
    }
    
    var profile = Profile.parse(json);
    profile.provider  = 'github';
    profile._raw = body;
    profile._json = json;
    
    done(null, profile);
  });
}


/**
 * Expose `Strategy`.
 */
module.exports = Strategy;