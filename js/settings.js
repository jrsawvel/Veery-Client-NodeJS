var http    = require('http');
var PageGlobals = require('./pageglobals');

var globals     = new PageGlobals();
var global_defaults = globals.getvalues();

var UserCookies = require('./usercookies');
var user_cookies = new UserCookies();

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

function show_success(res, line_one, line_two) {
    var data = {
        pagetitle: 'Success',
        line_one:  line_one, 
        line_two:  line_two,
        default_values: globals.getvalues(),
    };  
    res.render('success', data);
}

var Settings = {

    'read': function (req, res) {
        var uc = user_cookies.getvalues(req);
        options.path = global_defaults.api_uri + "/users/" + uc.author_name;
        options.path = options.path + '/?author=' + uc.author_name + '&session_id=' + uc.session_id;
        options.headers = '';
        options.method = 'GET';

        http.get(options, function(getres) {
            var get_data = '';
            getres.on('data', function (chunk) {
                get_data += chunk;
            });

            getres.on('end', function() {
              var obj = JSON.parse(get_data);
              var default_values = globals.getvalues();
              default_values.user_cookies = uc;
             if ( getres.statusCode < 300 ) {
                var data = {
                    pagetitle:      'Updated User Settings',
                    name:           obj.name,
                    old_email:      obj.email,
                    id:             obj._id,
                    rev:            obj._rev,
                    default_values: default_values,
                };
                res.render('settings', data);
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
            getres.send('Could not retrieve data.');
        });
    },


    'update': function (req, res) {

        var uc = user_cookies.getvalues(req);

        var old_email = req.param('old_email').trim();
        var new_email = req.param('new_email').trim();
        var rev       = req.param('rev').trim();
        var id        = req.param('id').trim();

        if ( !old_email ) {
            show_error(res, "Invalid input.", "Old email address was missing.");
        }

        if ( !new_email ) {
            show_error(res, "Invalid input.", "New email address was missing.");
        }

            var myobj = {
                old_email:   old_email,
                new_email:   new_email,
                rev:         rev,
                id:          id,
                author:      uc.author_name,
                session_id:  uc.session_id   
            };
            var json_str =  JSON.stringify(myobj);
            
            var headers = {
                'Content-Type':   'application/json',
                'Content-Length': Buffer.byteLength(json_str)
            };

            options.method = 'PUT';
            options.path = global_defaults.api_uri + "/users";
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
                        show_success(res, "Updating user settings.", "Changes were saved.");
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
    }
};

module.exports = Settings;
