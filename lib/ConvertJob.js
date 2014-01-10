var childProcess  = require( 'child_process' ),
    inherits      = require( 'util' ).inherits,
    EventEmitter  = require( 'events' ).EventEmitter,
    PauseStream   = require( 'pause-stream' ),
    once          = require( 'once' )


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
  var forkstream

  this.process = childProcess.spawn( this.cmd, this.params )

  this.stdin  = this.process.stdin
  this.stdout = this.process.stdout
  this.stderr = this.process.stderr

  this.pauseStream
    .pipe( this.stdin )

  forkstream = once(function( type, firstbuffer, stream ){
    if( 'stdout' === type ) {
      this.emit( 'stdout', firstbuffer, this.stdout )
    }
    if( 'stderr' === type ) {
      this.emit( 'stderr', firstbuffer, this.stderr ) 
    }
  }.bind( this ))

  this.stdout.once('data', function( firstbuffer ) {
    forkstream( 'stdout', firstbuffer )
  }.bind( this ))

  this.stderr.once('data', function( firstbuffer ) {
    forkstream( 'stderr', firstbuffer )
  }.bind( this ))
  
  this.pauseStream.resume()
}