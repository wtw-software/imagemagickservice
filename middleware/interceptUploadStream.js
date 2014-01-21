/**
 * Module dependencies.
 */
var formidable = require( 'formidable' )


module.exports = function ( options ) {
  return function( req, res, next ) {
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