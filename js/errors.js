var PageGlobals = require('./pageglobals');
var globals         = new PageGlobals();

var UserCookies = require('./usercookies');
var user_cookies = new UserCookies();

var Errors = {

    error404: function (req, res, next) {
        var default_values = globals.getvalues();
        default_values.user_cookies = user_cookies.getvalues(req);
        var data = {
            user_message:   'Invalid function request ' + req.originalUrl,
            system_message: 'Action is unsupported', 
            pagetitle: 'Error',
            default_values: default_values
        };
        res.render('error', data);
    }
};

module.exports = Errors;
