
/**
 * Module dependencies.
 */

var express       = require( 'express' ),
    routes        = require( './routes' ),
    http          = require( 'http' ),
    fs            = require( 'fs' ),
    path          = require( 'path' ),
    formidable    = require( 'formidable' ),
    Jobqueue      = require( './lib/Jobqueue' ),
    ConvertJob    = require( './lib/ConvertJob' )


var app       = express(),
    jobqueue  = new Jobqueue()


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

app.get('/', routes.index);

function interceptUploadStream( req, res, next ) {
  var form, uploadStream, convert

  form = new formidable.IncomingForm()

  form.onPart = function( part ) {
    if( !part.filename )
      return form.handlePart( part )

    uploadStream = part
    req.uploadStream = uploadStream

    next()
  }

  form.parse( req )
}

function parseTerminalParams( req, res, next ) {
  var terminalParams

  terminalParams = req.params[ 0 ]
                      .trim()
                      .split( /\s+/ )

  terminalParams.push( '-' )
  terminalParams.unshift( '-' )

  req.terminalParams = terminalParams
  
  next()
}

app.post(/convert(.+)/, interceptUploadStream, parseTerminalParams, function( req, res ){
  var uploadStream, terminalParams, convertjob

  uploadStream = req.uploadStream
  terminalParams = req.terminalParams

  convertjob = new ConvertJob( uploadStream, terminalParams )

  convertjob.on( 'started', function() {
    res.set( 'Content-Type', 'image/jpg' )
    convertjob.process.stdout
      .pipe( res )
  })

  jobqueue.push( convertjob )
})

http.createServer( app ).listen(app.get( 'port' ), function(){
  console.log( 'Express server listening on port ' + app.get('port') )
})
