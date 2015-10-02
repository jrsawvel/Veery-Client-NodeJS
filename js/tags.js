var http        = require('http');
var dateFormat = require('dateformat');

var PageGlobals = require('./pageglobals');

var globals         = new PageGlobals();
var global_defaults = globals.getvalues();

var UserCookies = require('./usercookies');
var user_cookies = new UserCookies();

var options = {
  host: global_defaults.host,
  port: global_defaults.api_port,
  path: ''
};


function display_rss (res, posts, rss_description) {
// date format for rss: Fri, 18 Sep 2015 16:24:15 GMT
    var now = new Date();

//    global_defaults.datetime = myDate.format('D, j M Y H:i:s') + " GMT";

    global_defaults.datetime = dateFormat(now, "ddd, dd mmm yyyy HH:MM:ss") + ' GMT';

    posts.forEach(function(entry) {
        var d = dateFormat(entry.updated_at, "ddd, dd mmm yyyy HH:MM:ss");
        entry.updated_at = d + ' GMT'; 
    });
    
    var data = {
        stream:           posts,
        rss_description:  rss_description,
        default_values:   global_defaults
    };
    res.set('Content-Type', 'text/xml');
    res.render('rss', data);
}

function show_stream (template, res, data) {
    res.render(template, data);
}

function show_error(res, user_msg, system_msg) {
    var data = {
        pagetitle: 'Error',
        user_message:   user_msg,
        system_message: system_msg,
        default_values: globals.getvalues(),
    };  
    res.render('error', data);
}


var Tags = {

    'search': function (req, res) {
        var uc = user_cookies.getvalues(req);

        var doing_rss = 0;

        if ( req.params[1] && req.params[1] === 'rss' ) {
            doing_rss = 1;
        } 

        var page_num = 1;
        options.path = global_defaults.api_uri + "/searches/tag";

        var tagname = "";
        if ( req.params[0] ) {
            tagname = req.params[0];
            options.path = options.path + "/" + tagname;
        }

        if ( req.params[1] && !isNaN(req.params[1]) ) {
            page_num = req.params[1] > 0 ? parseInt(req.params[1]) : 1;
        }

        if ( page_num > 1 ) {
            options.path = options.path + "/?page=" + page_num;
        }

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
                var next_page_num = page_num + 1;
                var prev_page_num = page_num - 1;

                if ( doing_rss ) {
                    display_rss(res, obj.posts, 'Recent posts tagged with ' + tagname);
                }  

                obj.posts.forEach(function(entry) {
                    if ( entry.post_type === "article" ) {
                        entry.show_title = 1;
                    } 

                    if ( entry.tags ) {
                        var tag_list = '';
                        entry.tags.forEach(function(tag) {
                            tag_list = tag_list + '<a href="/tag/' + tag + '">#' + tag + '</a> ';
                        });
                        entry.tag_list = tag_list;
                    }                        
                });

                var data = {
                    pagetitle:          'Tag Search Results',
                    search_results:     true,
                    search_type:        'tag',
                    search_uri_string:  tagname,
                    tag_name:           tagname, 
                    stream:             obj.posts,
                    default_values:     default_values,
                    not_last_page:      obj.next_link_bool ? 1 : 0,
                    not_page_one:       page_num==1 ? 0 : 1,
                    next_page_url:      "/tag/" + tagname + "/" + next_page_num,
                    previous_page_url:  "/tag/" + tagname + "/" + prev_page_num,
                };
                show_stream('search', res, data);
              } else {
                var data = {
                    pagetitle: 'Error',
                    user_message:   obj.user_message,
                    system_message: obj.system_message,
                    default_values:     default_values,
                };  
                res.render('error', data);
              }
            });
        }).on('error', function(e) {
            getres.send('Could not retrieve post.');
        });
    }

};

module.exports = Tags;

