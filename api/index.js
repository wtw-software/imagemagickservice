/**
 * Module dependencies.
 */

var ConvertJob    = require( '../lib/ConvertJob' ),
    StreamBuffer  = require( '../lib/StreamBuffer' )


/**
 * Middleware
 */
var interceptUploadStream = require( './middleware/interceptUploadStream' ),
    parseTerminalParams   = require( './middleware/parseTerminalParams' )


module.exports =  function( app ) {

  app.post(/convert(.+)/, interceptUploadStream({ timeout: 5000 }), parseTerminalParams, function( req, res ){
    var uploadStream, terminalParams, jobqueue, convertjob, errorBuffer

    uploadStream = req.uploadStream
    terminalParams = req.terminalParams

    jobqueue = app.get( 'jobqueue' )
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

}
