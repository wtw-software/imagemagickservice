var once = require( 'once' )


module.exports = LoadLimiter

function LoadLimiter( options ) {
  this.options = typeof options == 'object' ? options : {
    maxConcurrentRequests: Infinity
  }
  this.nrOfActiveRequests = 0
}


LoadLimiter.prototype.createMiddleware = function() {
  return function( req, res, next ) {

    if( this.nrOfActiveRequests >= this.options.maxConcurrentRequests ) {
      res.send( 503, {error: "To bussy: try again in a couple of seconds"} )
      return
    }

    this.nrOfActiveRequests++

    var decrementNrOfActiveRequests = once(function() {
      this.nrOfActiveRequests--      
    }.bind(this))

    res.once( 'finish', decrementNrOfActiveRequests )
    res.once( 'error', decrementNrOfActiveRequests )

    next()
  }.bind( this )
}