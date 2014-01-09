var async = require( 'async' )


module.exports = Jobqueue

function Jobqueue() {
  this.concurency = 4
  this.queue = async.queue( this.queueHandler.bind(this), this.concurency )
}

Jobqueue.prototype.push = function( job ) {
  this.queue.push( job )
}

Jobqueue.prototype.queueHandler = function( job, callback ) { 
  job.execute()
  callback()
}