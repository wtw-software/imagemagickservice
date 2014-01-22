
/**
 * Module dependencies.
 */
var express       = require( 'express' ),
    http          = require( 'http' ),
    fs            = require( 'fs' ),
    path          = require( 'path' ),
    temp          = require( 'temp' ),
    once          = require( 'once' ),
    Jobqueue      = require( './lib/Jobqueue' ),
    LoadLimiter   = require( './lib/LoadLimiter' ),
    client        = require( './routes/client' ),
    api           = require( './routes/api' )



/**
 * App, global namespace
 */
app = express()
module.exports = app


/**
 * Singeltons
 */
app.jobqueue    = new Jobqueue({ concurrency: 8 }),
app.loadlimiter = new LoadLimiter({ maxConcurrentRequests: 999 })


/**
 * Config
 */
app.set( 'port', process.env.PORT || 3000 )
app.set( 'views', path.join(__dirname, 'views') )
app.set( 'view engine', 'jade' )
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

temp.dir = path.join( __dirname, 'tmp' )
temp.track()

var graceFullServerExit = once(function( SIGNAL ) {
  temp.cleanup()
  process.exit()
})

process
  .on( 'exit',    graceFullServerExit )
  .on( 'SIGINT',  graceFullServerExit )
  .on( 'SIGTERM', graceFullServerExit )
        


/**
 * Middleware
 */
var interceptUploadStream = require( './middleware/interceptUploadStream' ),
    parseTerminalParams   = require( './middleware/parseTerminalParams' )


/**
 * Routes
 */
app.get( '/', client.index )

app.all( '/api/*', app.loadlimiter.createMiddleware() )

app.post( '/api/convert*', interceptUploadStream({ timeout: 5000 }) )
app.post( '/api/convert:terminalparams', parseTerminalParams, api.convert )



