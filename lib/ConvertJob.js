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

  if( !callback ) {
    throw new Error( 'ConvertJob.prototype.execute called without callback' )
  }

  this.process = childProcess.spawn( this.cmd, this.params )
  this.stdin  = this.process.stdin
  this.stdout = this.process.stdout
  this.stderr = this.process.stderr

  forkstream = once(function( type, firstbuffer ){
    if( 'stdout' === type ) {
      this.emit( 'stdout', firstbuffer, this.stdout )
      callback( null, firstbuffer, this.stdout )
    }
    if( 'stderr' === type ) {
      this.emit( 'stderr', firstbuffer, this.stderr ) 
      callback( firstbuffer, this.stderr )
    }
    if( 'processerror' == type ) {
      this.emit( 'processerror', firstbuffer ) 
      callback( firstbuffer ) 
    }
  }.bind( this ))


  this.process.on(  'error',  forkstream.bind(this, 'processerror') )
  this.stdin.on(    'error',  forkstream.bind(this, 'processerror'))
  this.stdout.once( 'data',   forkstream.bind(this, 'stdout') )
  this.stderr.once( 'data',   forkstream.bind(this, 'stderr') )


  this.pauseStream
    .pipe( this.stdin )

  this.pauseStream.resume()
}