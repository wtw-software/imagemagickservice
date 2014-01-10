
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
    ConvertJob    = require( './lib/ConvertJob' ),
    StreamBuffer  = require( './lib/StreamBuffer' )


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

function interceptUploadStream( options ) {
  return function( req, res, next ){
    var form, timeout, uploadStream, convert

    form = new formidable.IncomingForm()

    timeout = setTimeout(function() {
      res.status( 408 )
      res.set( 'Content-Type', 'application/json' )
      res.send({ error: "Timeout: did not receive any data", timeoutms: options.timeout })
    }, options.timeout)

    form.onPart = function( part ) {
      if( !part.filename )
        return form.handlePart( part )

      uploadStream = part
      req.uploadStream = uploadStream

      clearTimeout( timeout )
      next()
    }

    form.parse( req )
  }
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


app.get( '/', routes.index )

app.post(/convert(.+)/, interceptUploadStream({ timeout: 5000 }), parseTerminalParams, function( req, res ){
  var uploadStream, terminalParams, convertjob, errorBuffer

  uploadStream = req.uploadStream
  terminalParams = req.terminalParams

  convertjob = new ConvertJob( uploadStream, terminalParams )

  convertjob.on( 'stdout', function( firstbuffer, stdout ) {
    res.set( 'Content-Type', 'image/jpg' )
    res.write( firstbuffer )
    stdout.pipe( res )
  })

  convertjob.on( 'stderr', function( firstbuffer, stderr ) {
    errorBuffer = new StreamBuffer( stderr )
    errorBuffer.push( firstbuffer )
    stderr.on('end', function() {
      res.status( 400 )
      res.set( 'Content-Type', 'application/json' )
      res.send({ error: errorBuffer.toString() })
    })
  })

  convertjob.on( 'processerror', function( error ) {
    res.status( 500 )
    res.set( 'Content-Type', 'application/json' )
    res.send({ error: error })
  })

  jobqueue.push( convertjob )
})

http.createServer( app ).listen(app.get( 'port' ), function(){
  console.log( 'Express server listening on port ' + app.get('port') )
})
