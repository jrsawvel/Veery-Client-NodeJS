// require('../modules/date.format');

var dateFormat = require('dateformat');


// constructor
var PageGlobals = function() {
};

function _get_date_time () {
//    var myDate = new Date();
//    return myDate.format('D, M j, Y - g:i a') + " UTC";

    var now = new Date();
    return dateFormat(now, "ddd, mmm dd, yyyy - h:MM TT") + ' UTC';
}

PageGlobals.prototype.getvalues = function() {

    var page_values = {
        datetime:          _get_date_time(),
        app:               'Veery-Client-NodeJS',
        site_name:         'NodeVeery',
        home_url:          'http://veeryclientnodejs.soupmode.com',
        host:              'veeryapiperl.soupmode.com',
        api_port:          80,
        api_uri:           'http://veeryapiperl.soupmode.com/api',
        site_description:  'Node.js Veery Client',
        cookie_prefix:     'nodejsveery',
        css_dir_url:       'http://veeryclientnodejs.soupmode.com/css',
        author_name:       'JohnR',
        author_profile:    'profile',
        memcached_port:    11211,
        write_html_to_memcached: 1,
        domain_name:       'veeryclientnodejs.soupmode.com',
        memcached_prefix:  'veery-client',
    };

    return page_values;
};

module.exports = PageGlobals;

