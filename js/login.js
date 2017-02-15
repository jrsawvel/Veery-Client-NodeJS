var http        = require('http');
var querystring = require('querystring');

var PageGlobals = require('./pageglobals');

var globals         = new PageGlobals();
var global_defaults = globals.getvalues();

var options = {
  host: global_defaults.host,
  port: global_defaults.api_port,
  path: '',
  headers: '',
  method: ''
};

function show_error(res, user_msg, system_msg) {
    var data = {
        pagetitle: 'Error',
        user_message:   user_msg,
        system_message: system_msg,
        default_values: globals.getvalues(),
    };  
    res.render('error', data);
}


var Login = {

    'form': function (req, res) {
        var data = {
            pagetitle: 'Login Form',
            default_values: globals.getvalues()
        };
        res.render('loginform', data);
    },

    'login': function (req, res) {
        if ( req.param('email').trim() ) {

            var myobj = {
                email:  req.param('email').trim(),
                url:    global_defaults.home_url + '/nopwdlogin'
            };
            var json_str =  JSON.stringify(myobj);
            
            var headers = {
                'Content-Type':   'application/json',
                'Content-Length': Buffer.byteLength(json_str)
            };

            options.method = 'POST';
            // options.path = global_defaults.api_uri + "/users/login";
            options.path = global_defaults.nodejs_api_uri + "/users/login";
            options.headers = headers;

            var h_req = http.request(options, function(h_res) {
                h_res.setEncoding('utf-8');

                var response_string = '';

                h_res.on('data', function (h_data) {
                    response_string += h_data;
                });

                h_res.on('end', function() {
                    var obj = JSON.parse(response_string);
                    if ( h_res.statusCode < 300 ) {
                        var data = {
                            pagetitle: 'New Login Link',
                            default_values: globals.getvalues()
                        };
                        res.render('newloginlink', data);
                    } else {
                        show_error(res, obj.user_message, obj.system_message);
                    }
                });
            });

            h_req.on('error', function(e) {
                show_error(res, "Unknown problem.", "Could not retrieve data.");
            });

            h_req.write(json_str);
            h_req.end();
        } else {
            show_error(res, 'Invalid data.', 'Username and/or email are missing.');
        }
    },

    'nopwdlogin': function (req, res) {

        var rev = req.params[0];

        options.headers = '';
        options.method = 'GET';
        // options.path = global_defaults.api_uri + '/users/login/?rev=' + rev;
        options.path = global_defaults.nodejs_api_uri + '/users/login/?rev=' + rev;

        http.get(options, function(h_res) {
            var response_string = '';
            h_res.on('data', function (h_data) {
                response_string += h_data;
            });

            h_res.on('end', function() {
                var obj = JSON.parse(response_string);

                if ( h_res.statusCode < 300 ) {
//                    res.cookie(global_defaults.cookie_prefix + 'author_name',  obj.author_name, {domain: global_defaults.host, path: '/'});
//                    res.cookie(global_defaults.cookie_prefix + 'session_id',   obj.session_id,  {domain: global_defaults.host, path: '/'});
                    res.cookie(global_defaults.cookie_prefix + 'author_name',  obj.author_name);
                    res.cookie(global_defaults.cookie_prefix + 'session_id',   obj.session_id);
                    res.redirect(global_defaults.home_url);
                } else {
                    show_error(res, obj.user_message, obj.system_message);
                }
            });
        }).on('error', function(e) {
            h_res.send('Could not retrieve post.');
        });

    }
};

module.exports = Login;
