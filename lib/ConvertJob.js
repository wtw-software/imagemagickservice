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

ConvertJob.prototype.execute = function( callback ) {
  this.process = childProcess.spawn( this.cmd, this.params )

  this.stdin  = this.process.stdin
  this.stdout = this.process.stdout
  this.stderr = this.process.stderr

  this.pauseStream
    .pipe( this.stdin )

  this.stdout.once('data', function( firstbuffer ) {
    this.emit( 'stdout', firstbuffer, this.stdout )
  }.bind( this ))

  this.stderr.once('data', function( firstbuffer ) {
    this.emit( 'stderr', firstbuffer, this.stderr )
  }.bind( this ))
  
  this.pauseStream.resume()
}