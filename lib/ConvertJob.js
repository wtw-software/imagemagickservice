var inherits      = require( 'util' ).inherits,
    EventEmitter  = require( 'events' ).EventEmitter,
    childProcess  = require( 'child_process' ),
    fs            = require( 'fs' ),
    Stream        = require( 'stream' ).Stream
    once          = require( 'once' )


module.exports = ConvertJob

function ConvertJob( file, params ) {
  EventEmitter.apply( this, arguments )

  this.cmd = 'convert'
  this.filepath = null
  this.readablestream = null
  this.params = params
  this.file = file
  this.readablestream = null
}


inherits( ConvertJob, EventEmitter )


ConvertJob.prototype.getReadableStream = function() {
  if( !this.readablestream ) {
    this.readablestream = this.file instanceof Stream ? this.file : fs.createReadStream( this.file )
  }

  return this.readablestream
}


ConvertJob.prototype.execute = function( callback ) {
  var readablestream, forkstream, end

  if( !callback ) {
    throw new Error( 'ConvertJob.prototype.execute called without callback' )
  }

  this.process = childProcess.spawn( this.cmd, this.params )

  forkstream = once(function( type, firstbuffer ) {
    if( 'stdout' === type ) {
      this.emit( 'stdout', firstbuffer, this.process.stdout )
      callback( null, firstbuffer, this.process.stdout )
    }
    if( 'stderr' === type ) {
      this.emit( 'stderr', firstbuffer, this.process.stderr ) 
      callback( firstbuffer, this.process.stderr )
    }
    if( 'processerror' == type ) {
      this.emit( 'processerror', firstbuffer ) 
      callback( firstbuffer ) 
    }
  }.bind( this ))

  end = once( this.emit.bind(this, 'end') )

  this.process.once(        'error',  forkstream.bind(this, 'processerror') )
  this.process.once(        'exit',   end )
  this.process.stdin.once(  'error',  forkstream.bind(this, 'processerror'))
  this.process.stdout.once( 'data',   forkstream.bind(this, 'stdout') )
  this.process.stderr.once( 'data',   forkstream.bind(this, 'stderr') )
  
  readablestream = this.getReadableStream()

  readablestream
    .pipe( this.process.stdin )

  readablestream.resume()
}