var http        = require('http');
var querystring = require('querystring');

var Entities = require('html-entities').XmlEntities;

var cache = require('./cache');

var PageGlobals = require('./pageglobals');
var globals         = new PageGlobals();
var global_defaults = globals.getvalues();

var UserCookies = require('./usercookies');
var user_cookies = new UserCookies();

var options = {
  host: global_defaults.host,
  port: global_defaults.api_port,
  path: '',
};

function show_error(req, res, user_msg, system_msg) {
    var default_values = globals.getvalues();
    var uc = user_cookies.getvalues(req);
    default_values.user_cookies = uc;
    var data = {
        pagetitle: 'Error',
        user_message:   user_msg,
        system_message: system_msg,
        default_values: default_values,
    };  
    res.render('error', data);
}

var NewPost = {

    'newpostform': function (req, res) {
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
 
             if ( getres.statusCode < 300 && obj.is_logged_in ) {
                 var data = {
                     pagetitle: 'Compose New Post',
                     default_values: default_values,
                 };
                 res.render('newpostform', data);
              } else {
                  show_error(req, res, "Unable to peform action.", "You are not logged in.");
              }
            });
        }).on('error', function(e) {
            res.send('Could not complete action.');
        });
    },

    'splitscreen': function (req, res) {
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
 
             if ( getres.statusCode < 300 && obj.is_logged_in ) {
                 var data = {
                     pagetitle: 'Creating Post - Split Screen',
                     site_name: global_defaults.site_name, 
                     action: 'addarticle',
                     api_url: global_defaults.api_uri,
                     post_id: 0,
                     post_digest: 'undef',  
                     default_values: default_values,
                 };
                 res.render('splitscreenform', data);
              } else {
                  show_error(req, res, "Unable to peform action.", "You are not logged in.");
              }
            });
        }).on('error', function(e) {
            res.send('Could not retrieve post.');
        });
    },

    'create': function (req, res) {
        var uc = user_cookies.getvalues(req);

        if ( req.param('markup').trim() ) {

            var submit_type = req.param('sb'); 
            var post_text = req.param('markup').trim();

            var entities = new Entities();
//            var encoded_string = entities.encodeNonUTF(post_text); 
            var encoded_string = entities.encodeNonASCII(post_text); 

            var post_location = '';
            if ( req.param('post_location') ) {
                post_location = req.param('post_location');
            }
           
            var myobj = {
                author:      uc.author_name,
                session_id:  uc.session_id,
                submit_type: submit_type,
                markup:      encoded_string,
            };
            var json_str =  JSON.stringify(myobj);
            
            var headers = {
                'Content-Type':   'application/json',
                'Content-Length': Buffer.byteLength(json_str)
            };

            options.method = 'POST';
            options.path = global_defaults.api_uri + "/posts";
            options.headers = headers;
   
            var postreq = http.request(options, function(postres) {
                postres.setEncoding('utf8');

                var return_data = '';
                postres.on('data', function (chunk) {
                    return_data += chunk;
                });

                postres.on('end', function() {
                    var obj = JSON.parse(return_data);
                    var default_values = globals.getvalues();
                    default_values.user_cookies = uc;

                    if ( postres.statusCode < 300 ) {
                        if ( submit_type == "Post" ) {
                            // cache.cache_html(obj.html, obj.post_id); 

                            if ( post_location == "notes_stream" )  {
                                res.redirect('back');
                            } else {                        
                                res.redirect(global_defaults.home_url + "/" + obj.post_id );
                                // show_error(req, res, "debug", "new post successful, i think");
                            }
                        } else if ( submit_type == "Preview" ) {
                            var data = {
                                previewingpost:  1,
                                html:            obj.html,
                                markup:          post_text,
                                pagetitle:      'Previewing new post ' + obj.title,
                                default_values:  globals.getvalues(),
                                preview_title:   obj.title,
                            };
                            res.render('newpostform', data);
                        }
                    } else {
                        show_error(req, res, obj.user_message, obj.system_message);                
                    }
                });
            }).on('error', function(e) {
                res.send('Could not retrieve source of post.');
            });

            postreq.write(json_str);
            postreq.end();
        } // end if markup exists
    }
};

module.exports = NewPost;

