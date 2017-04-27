
var Memcached = require('memcached');

var PageGlobals = require('./pageglobals');
var globals     = new PageGlobals();
var global_defaults = globals.getvalues();


module.exports.cache_html = function (html, slug) {

    var prefix = global_defaults.memcached_prefix;
    var port   = global_defaults.memcached_port;
    
    var key = prefix + '-' + slug;


    var memcached = new Memcached('localhost:' + port);
    var lifetime = 86400; //24hrs

    html = html + '<!-- memcached via nodejs client -->';

    // for some reason, this memcached client munges the data going into the memcached server
    // by doing something goofy with the newline chars, maybe escaping them. i don't know.
    // but once pulled from cache by nginx, the backslash character appears throughout an html page in the browser.
    // using this regex to remove newlines before caching the page.
    html = html.replace(/\r?\n|\r/g, ' ');

    memcached.set(key, html, lifetime, function( err, result ){
        if( err ) console.error( err );
//        console.dir('cache result = ' + result );
    });

    // memcached.get(key, function( err, result ){
        // if( err ) console.error( err );
    // });
}
