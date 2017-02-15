var http        = require('http');
var querystring = require('querystring');

var Entities = require('html-entities').XmlEntities;

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

var EditPost = {

    'getpost': function (req, res) {
        var uc = user_cookies.getvalues(req);

        // options.path = global_defaults.api_uri + "/posts/" + req.params[0];
        options.path = global_defaults.nodejs_api_uri + "/posts/" + req.params[0];

        options.path = options.path + '/?author=' + uc.author_name + '&session_id=' + uc.session_id + '&text=markup';

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
                var post_obj = obj.post;

                var entities = new Entities();

                var data = {
                    slug:           post_obj.slug,
                    title:          post_obj.post_type != 'note' ? post_obj.title : "(a note)",
                    rev:            post_obj._rev,
                    pagetitle:      'Updating ' + post_obj.title,
                    // markup:         entities.decode(obj.markup),
                    markup:         post_obj.markup,
                    default_values: default_values
                };
                res.render('editpostform', data);
              } else {
                show_error(req, res, obj.user_message, obj.system_message);
              }
            });
        }).on('error', function(e) {
            getres.send('Could not retrieve post.');
        });
    },

    'update': function (req, res) {
        var uc = user_cookies.getvalues(req);

        if ( req.param('markup').trim() ) {
            var submit_type     = req.param('sb'); 
            var post_id         = req.param('post_id'); // slug
            var rev             = req.param('rev'); 
            var original_markup = req.param('markup').trim();

            var entities = new Entities();
            var markup   = entities.encodeNonASCII(original_markup); 

            var myobj = {
                author:      uc.author_name,
                session_id:  uc.session_id,
                submit_type: submit_type,
                markup:      markup,
                post_id:     post_id,
                rev:         rev
            };
            var json_str =  JSON.stringify(myobj);
            
            var headers = {
                'Content-Type':   'application/json',
                'Content-Length': Buffer.byteLength(json_str)
            };

            options.method = 'PUT';
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
                        // todo CacheHtml::create_and_cache_page($post_id);

                        if ( submit_type == "Update" ) {
                            res.redirect(global_defaults.home_url + "/" + post_id );
                        } else if ( submit_type == "Preview" ) {
                            var preview_title = '';
                            if ( obj.post_type == "article" ) {
                                preview_title = obj.title;
                            }

                            var data = {
                                previewingpost: 1,
                                pagetitle:      'Editing ' + obj.title,
                                slug:           post_id,
                                rev:            rev,
                                title:          obj.title,
                                html:           obj.html,
                                markup:         original_markup,
                                default_values: default_values
                            };
                            res.render('editpostform', data);
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

module.exports = EditPost;
