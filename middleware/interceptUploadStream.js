/**
 * Module dependencies.
 */
var formidable    = require( 'formidable' ),
    PauseStream   = require( 'pause-stream' ),
    StringDecoder = require( 'string_decoder' ).StringDecoder


module.exports = function ( options ) {
  return function( req, res, next ) {
    var form, timeout

    form = new formidable.IncomingForm()

    timeout = setTimeout(function() {
      res.status( 408 )
      res.set( 'Content-Type', 'application/json' )
      res.send({ error: "Timeout: did not receive any data", timeoutms: options.timeout })
    }, options.timeout)

    function handleFile( part ) {
      var uploadStream, pauseStream, pausedStream

      uploadStream = part
      pauseStream = new PauseStream
      pausedStream = pauseStream.pause()

      req.filestream = pausedStream

      uploadStream.pipe( pausedStream )
    }

    form.onPart = function( part ) {
      if( part.filename ) {
        clearTimeout( timeout )
        handleFile( part )
        next()
      }
    }

    form.parse( req )
  }
}