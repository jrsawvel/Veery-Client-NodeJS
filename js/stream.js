var http        = require('http');
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


function show_stream (template, res, data) {
    res.render(template, data);
}

var Stream = {

    'stream': function (req, res) {
        var uc = user_cookies.getvalues(req);

        var page_num = 1;
        options.path = global_defaults.api_uri + "/posts";
        if ( req.params[0] && !isNaN(req.params[0]) ) {
            page_num = req.params[0] > 0 ? parseInt(req.params[0]) : 1;
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
                    pagetitle:          'Home Page',
                    stream:             obj.posts,
                    default_values:     default_values,
                    not_last_page:      obj.next_link_bool ? 1 : 0,
                    not_page_one:       page_num==1 ? 0 : 1,
                    next_page_url:      "/stream/" + next_page_num,
                    previous_page_url:  "/stream/" + prev_page_num,
                };
                show_stream('homepage', res, data);
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
    },

    'deleted' : function(req, res) {
        var uc = user_cookies.getvalues(req);

        options.path = global_defaults.api_uri + "/posts/";
        options.path = options.path + '&author=' + uc.author_name + '&session_id=' + uc.session_id + '&deleted=yes';

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
                    pagetitle:          'Deleted Posts',
                    deleted:             obj.posts,
                    default_values:     default_values,
                };
                show_stream('deleted', res, data);
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

module.exports = Stream;
