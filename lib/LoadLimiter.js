var once = require( 'once' ),
    toobusy = require( 'toobusy' )


module.exports = LoadLimiter


function LoadLimiter( options ) {
  if( !(this instanceof LoadLimiter) )
    return new LoadLimiter( options )

  this.options = typeof options == 'object' ? options : {
    maxConcurrentRequests: Infinity
  }
  this.activeRequests = 0
}


LoadLimiter.prototype.isSaturated = function() {
  return this.activeRequests >= this.options.maxConcurrentRequests
}


LoadLimiter.prototype.createMiddleware = function() {
  return function( req, res, next ) {

    if( toobusy() ) {
      res.send( 503, {error: "To bussy: try again in a couple of seconds"} )
      return
    }

    this.incrementActiveRequests()

    var decrementNrOfActiveRequests = once( this.decrementActiveRequests ).bind( this )

    res.once( 'finish', decrementNrOfActiveRequests )
    res.once( 'error', decrementNrOfActiveRequests )

    next()
  }.bind( this )
}


LoadLimiter.prototype.incrementActiveRequests = function() {
  this.activeRequests++
}


LoadLimiter.prototype.decrementActiveRequests = function() {
  this.activeRequests--
}