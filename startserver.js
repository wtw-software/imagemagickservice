var http = require( 'http' ),
    app  = require( './app' )


var port = process.argv[2] || app.get( 'port' ) || 3000

http.createServer( app ).listen( port, function(){
  console.log( 'Express server listening on port ' + port )
})