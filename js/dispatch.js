var express        = require('express'),
    bodyParser     = require('body-parser'),
    exphbs         = require('express-handlebars'),
    path           = require('path'),
    cookie_parser  = require('cookie-parser'),
    search         = require('./search'),
    errors         = require('./errors'),
    stream         = require('./stream'),
    tags           = require('./tags'),
    login          = require('./login'),
    logout         = require('./logout'),
    settings       = require('./settings'),
    post           = require('./showpost'),
    changestatus   = require('./changestatus'),
    newpost        = require('./newpost'),
    editpost       = require('./editpost'),


app = express();

app.engine('hbs', exphbs({
    extname:'hbs', 
    layoutsDir:     path.join(__dirname, '../views/layouts'),
    defaultLayout:  path.join(__dirname, '../views/layouts/main.hbs'),
    partialsDir:    path.join(__dirname, '../views/partials'),
}));
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'hbs');

app.use(bodyParser.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded

app.use(cookie_parser());

app.get('/searchform', search.form);
app.get('/login', login.form);
app.post('/dologin', login.login);
app.get(/^\/nopwdlogin\/(.*)/, login.nopwdlogin);
app.get('/', stream.stream);
app.get(/^\/stream(?:\/(.*))?$/, stream.stream); // for rss feed
app.get('/deleted', stream.deleted);
app.get('/logout', logout.logout);
app.get(/^\/delete\/([0-9a-zA-Z_\-]+)?$/,  changestatus.delete);
app.get(/^\/undelete\/([0-9a-zA-Z_\-]+)?$/,  changestatus.undelete);
app.get('/settings', settings.read);
app.post('/updatesettings', settings.update);
app.get(/^\/tag\/([0-9a-zA-Z_\-+]+)$/, tags.search);
app.get(/^\/tag\/([0-9a-zA-Z_\-+]+)\/([0-9]*)$/, tags.search);
app.get(/^\/tag\/([0-9a-zA-Z_\-+]+)\/(.*)$/, tags.search); // for rss feed
app.get(/^\/search\/([^\/]+)$/, search.string);
app.get(/^\/search\/(.+)\/(.*)$/, search.string);
app.post('/search', search.string);
app.post('/createpost', newpost.create);
app.get('/compose', newpost.newpostform);
app.get('/splitscreen', newpost.splitscreen);
app.get(/^\/edit\/([0-9a-zA-Z_\-]+)?$/, editpost.getpost);
app.post('/updatepost', editpost.update);
app.get(/^\/([0-9a-zA-Z_\-]+)?$/,       post.show);

app.use(errors.error404);

app.listen(3001);
