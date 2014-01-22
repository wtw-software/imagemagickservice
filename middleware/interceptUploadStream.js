/**
 * Module dependencies.
 */
var formidable    = require( 'formidable' ),
    PauseStream   = require( 'pause-stream' )


module.exports = function ( options ) {
  return function( req, res, next ) {
    var form, timeout, uploadStream, pauseStream, pausedStream

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
      pauseStream = new PauseStream
      pausedStream = pauseStream.pause()

      req.filestream = pausedStream
      
      uploadStream.pipe( pausedStream )

      clearTimeout( timeout )
      next()
    }

    form.parse( req )
  }
}