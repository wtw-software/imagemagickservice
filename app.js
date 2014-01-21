
/**
 * Module dependencies.
 */

var express       = require( 'express' ),
    routes        = require( './routes' ),
    http          = require( 'http' ),
    fs            = require( 'fs' ),
    path          = require( 'path' ),
    Jobqueue      = require( './lib/Jobqueue' ),
    LoadLimiter   = require( './lib/LoadLimiter' ),
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
app.loadlimiter = new LoadLimiter({ maxConcurrentRequests: 20 })


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


/**
 * Middleware
 */
var interceptUploadStream = require( './middleware/interceptUploadStream' ),
    parseTerminalParams   = require( './middleware/parseTerminalParams' )


/**
 * Routes
 */
app.get( '/', routes.index )

app.all( '/api/*', app.loadlimiter.createMiddleware() )

app.post( /\/api\/convert(.+)/, interceptUploadStream({ timeout: 5000 }), parseTerminalParams, api.convert )



