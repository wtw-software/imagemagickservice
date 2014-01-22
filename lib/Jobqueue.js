var inherits      = require( 'util' ).inherits,
    EventEmitter  = require( 'events' ).EventEmitter,
    async         = require( 'async' )


module.exports = Jobqueue

function Jobqueue( options ) {
  EventEmitter.apply( this, arguments )
  this.concurrency = options.concurrency || 4
  this.queue = this.setupQueue()
}


inherits( Jobqueue, EventEmitter )


Jobqueue.prototype.setupQueue = function() {
  var queue

  queue = async.queue( this.queueHandler.bind(this), this.concurrency )
  
  queue.saturated = this.emit.bind( this, 'saturated' )
  queue.empty = this.emit.bind( this, 'empty' )
  queue.drain = this.emit.bind( this, 'drain' )

  return queue
}


Jobqueue.prototype.push = function( job ) {
  this.queue.push( job )
}


Jobqueue.prototype.queueHandler = function( job, callback ) {
  try {
    job.execute( callback )  
  }
  catch( exception ) {
    callback( exception )
  }
}