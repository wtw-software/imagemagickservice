/**
 * Module dependencies.
 */
var fs            = require( 'fs' ),
    ConvertJob    = require( '../../lib/ConvertJob' ),
    StreamBuffer  = require( '../../lib/StreamBuffer' )


module.exports.convert = function( req, res ) {
  var filestream, params, convertjob, errorBuffer
  
  filestream = req.filestream
  params = req.params

  convertjob = new ConvertJob( filestream, params )

  convertjob.on( 'stdout', function( firstbuffer, stdout ) {
    res.set( 'Content-Type', 'image/jpg' )
    res.write( firstbuffer )
    stdout.pipe( res )
  })

  convertjob.on( 'stderr', function( firstbuffer, stderr ) {
    errorBuffer = new StreamBuffer( stderr )
    errorBuffer.push( firstbuffer )
    stderr.on('end', function() {
      res.set( 'Content-Type', 'application/json' )
      res.send( 400, { error: errorBuffer.toString() })
    })
  })

  convertjob.on( 'processerror', function( error ) {
    res.set( 'Content-Type', 'application/json' )
    res.send( 500, { error: error })
  })

  app.jobqueue.push( convertjob )
}
