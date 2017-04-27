var http    = require('http');

var PageGlobals = require('./pageglobals');
var globals     = new PageGlobals();
var global_defaults = globals.getvalues();

var UserCookies = require('./usercookies');
var user_cookies = new UserCookies();

var cache = require('./cache');

var options = {
  host: global_defaults.host,
  port: global_defaults.api_port,
  path: ''
};


var Post = {

    'show': function (req, res) {

        var uc = user_cookies.getvalues(req);

        // options.path = global_defaults.api_uri + "/posts/" + req.params[0];
        // switched to this on 27jan2017
         options.path = global_defaults.nodejs_api_uri + "/posts/" + req.params[0];

        options.path = options.path + '/?author=' + uc.author_name + '&session_id=' + uc.session_id + '&text=html';

        http.get(options, function(getres) {
            var get_data = '';
            getres.on('data', function (chunk) {
                get_data += chunk;
            });


            getres.on('end', function() {

             if ( getres.statusCode < 500 ) {
                var obj = JSON.parse(get_data);
                var default_values = globals.getvalues();
                default_values.user_cookies = uc;

             if ( getres.statusCode < 300 ) {

                var post_obj = obj.post;

                var data = {
                    html:               post_obj.html,
                    author:             post_obj.author,
                    created_at:         post_obj.created_at,
                    updated_at:         post_obj.updated_at,
                    reading_time:       post_obj.reading_time,
                    word_count:         post_obj.word_count,
                    post_type:          post_obj.post_type,
                    slug:               post_obj.slug,
                    title:              post_obj.title,
                    author_profile:     global_defaults.author_profile,
                    show_title:         post_obj.post_type === 'article' ? 1 : 0, 
                    modified:           post_obj.created_at != obj.updated_at ? 1 : 0,
                    default_values:     default_values
                };


// display json of post to browser
//                res.send(data);
//                res.render('post', data);

                  res.render('post', data, function(err, html) {
                      if ( !uc.logged_in && global_defaults.write_html_to_memcached ) {
                          cache.cache_html(html, post_obj.slug);
                      }
                      res.send(html);
                  });
    
              } else {
                var data = {
                    pagetitle:      'Error',
                    user_message:   obj.user_message,
                    system_message: obj.system_message,
                    default_values: default_values
                };  
                res.render('error', data);
              } // close if else for status code < 300
             } else {
                var data = {
                    pagetitle:      'Error',
                    user_message:   'API Server Problem',
                    system_message: 'Status Code = ' + getres.statusCode,
                    default_values: globals.getvalues()
                };  
                res.render('error', data);
             }  // close if else for status code < 500
            }); // close getres on end
        }).on('error', function(e) {
                var data = {
                    pagetitle:      'Error',
                    user_message:   'API Server Problem',
                    system_message: 'Status Code = ' + getres.statusCode,
                    default_values: globals.getvalues()
                };  
                res.render('error', data);
        });
    }
};

module.exports = Post;

