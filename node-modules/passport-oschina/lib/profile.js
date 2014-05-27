/**
 * Parse profile.
 *
 * @param {Object|String} json
 * @return {Object}
 * @api private
 */
exports.parse = function(json) {
  if ('string' == typeof json) {
    json = JSON.parse(json);
  }
  
  var profile = {};
  profile.id = String(json.id);
  profile.username = json.email;
  profile.displayName = json.name;
  profile.gender = json.gender;
  profile.location = json.location;
  profile.profileUrl = json.url;
  profile.emails = [{ value: json.email }];
  profile.photos = [{ value: json.avatar }];
  
  return profile;
};