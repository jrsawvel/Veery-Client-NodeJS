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


function _change_post_status (req, res, post_action, post_id) {
    var uc = user_cookies.getvalues(req);

    options.path = global_defaults.api_uri + "/posts/" + post_id + "/?action=" + post_action;
    options.path = options.path + '&author=' + uc.author_name + '&session_id=' + uc.session_id;


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
        getres.send('Unable to complete post. Invalid response code returned from API.');
    });
}

function _show_error(req, res) {
    var default_values = globals.getvalues();
    default_values.user_cookies = user_cookies.getvalues(req);
    var data = {
        pagetitle: 'Error',
        user_message:   "Unable to complete action.",
        system_message: "Missing post id.",
        default_values: default_values,
    };  
    res.render('error', data);
}

var Status = {
    'delete': function (req, res) {
        if ( !req.params[0] ) {
            _show_error(req, res);
        } else {
            _change_post_status(req, res, 'delete', req.params[0]);
        }
    },

    'undelete': function (req, res) {
        if ( !req.params[0] ) {
            _show_error(req, res);
        } else {
            _change_post_status(req, res, 'undelete', req.params[0]);
        }
    },


};

module.exports = Status;
