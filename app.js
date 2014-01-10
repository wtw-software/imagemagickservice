
/**
 * Module dependencies.
 */

var express       = require( 'express' ),
    routes        = require( './routes' ),
    http          = require( 'http' ),
    fs            = require( 'fs' ),
    path          = require( 'path' ),
    Jobqueue      = require( './lib/Jobqueue' ),
    api           = require( './api' )


var app       = express(),
    jobqueue  = new Jobqueue({ concurrency: 4 })


app.set( 'port', process.env.PORT || 3000 )
app.set( 'views', path.join(__dirname, 'views') )
app.set( 'view engine', 'jade' )
app.set( 'jobqueue', jobqueue )
app.use( express.favicon() )
app.use( express.logger('dev') )
app.use( express.json() )
app.use( express.urlencoded() )
app.use( express.methodOverride() )
app.use( app.router )
app.use( express.static(path.join(__dirname, 'public')) )


if( 'development' == app.get('env') ) {
  app.use( express.errorHandler() )
}

app.get( '/', routes.index )

api( app )

http.createServer( app ).listen(app.get( 'port' ), function(){
  console.log( 'Express server listening on port ' + app.get('port') )
})
