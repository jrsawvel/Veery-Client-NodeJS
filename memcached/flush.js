
var Memcached = require('memcached');

var memcached = new Memcached('localhost:11211');

memcached.flush(function( err, result ){
  if( err ) console.error( err );
  console.dir( result );
});

