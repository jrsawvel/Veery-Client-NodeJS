var http    = require('http');
var PageGlobals = require('./pageglobals');

var globals     = new PageGlobals();
var global_defaults = globals.getvalues();

var UserCookies = require('./usercookies');
var user_cookies = new UserCookies();

var options = {
  host: global_defaults.host,
  port: global_defaults.api_port,
  path: ''
};


var Logout = {

    'logout': function (req, res) {
        var uc = user_cookies.getvalues(req);
        options.path = global_defaults.api_uri + "/users/logout";
        options.path = options.path + '/?author=' + uc.author_name + '&session_id=' + uc.session_id;

        http.get(options, function(getres) {
            // console.log('debug status code = ' + getres.statusCode);
            var get_data = '';
            getres.on('data', function (chunk) {
                get_data += chunk;
            });

            getres.on('end', function() {
                var obj = JSON.parse(get_data);
                var default_values = globals.getvalues();
                default_values.user_cookies = uc;

             if ( getres.statusCode < 300 ) {
                 res.clearCookie(global_defaults.cookie_prefix + 'author_name');
                 res.clearCookie(global_defaults.cookie_prefix + 'session_id');
                 res.redirect(global_defaults.home_url);
              } else {
                var data = {
                    pagetitle: 'Error',
                    user_message:   obj.user_message,
                    system_message: obj.system_message,
                    default_values: default_values
                };  
                res.render('error', data);
              }
            });
        }).on('error', function(e) {
            getres.send('Could not retrieve source of post.');
        });
    }
};

module.exports = Logout;
