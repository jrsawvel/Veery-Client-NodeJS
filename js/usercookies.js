// constructor
var UserCookies = function() {
};

UserCookies.prototype.getvalues = function(req) {

    var user_cookies = {
        session_id:   req.cookies.nodejsveerysession_id,
        author_name:  req.cookies.nodejsveeryauthor_name,
        logged_in: 0    
    };

    if ( user_cookies.session_id && user_cookies.session_id.length > 0 ) {
        user_cookies.logged_in = 1;
    }

    return user_cookies;
};

module.exports = UserCookies;

