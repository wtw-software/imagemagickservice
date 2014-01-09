var childProcess  = require( 'child_process' ),
    inherits      = require( 'util' ).inherits,
    EventEmitter  = require( 'events' ).EventEmitter,
    PauseStream   = require( 'pause-stream' )


module.exports = ConvertJob

function ConvertJob( readablestream, params ) {
  EventEmitter.apply( this, arguments )

  this.cmd = 'convert'
  this.readablestream = readablestream
  this.params = params
  this.pauseStream = new PauseStream()

  this.readablestream
    .pipe( this.pauseStream.pause() )
}

inherits( ConvertJob, EventEmitter )

ConvertJob.prototype.execute = function() {
  this.process = childProcess.spawn( this.cmd, this.params )

  this.pauseStream
    .pipe( this.process.stdin )
  this.emit( 'started', this.process )
  
  this.pauseStream.resume()
}