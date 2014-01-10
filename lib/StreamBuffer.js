var inherits = require( 'util' ).inherits

module.exports = StreamBuffer

function StreamBuffer( stream ) {
  Array.apply( this )
  this.stream = stream
  this.stream.on( 'data', this.push.bind(this) )
  this.stream.on( 'end', this.setFinished.bind(this, true) )
}

inherits( StreamBuffer, Array )

StreamBuffer.prototype.setFinished = function( boolean ) {
  this.finished = boolean
}

StreamBuffer.prototype.toString = function() {
  var string, i, buff

  string = ""

  for( i = 0; i < this.length; i++ ) {
    buff = this[ i ]
    string += buff.toString( 'utf8' )
  }

  return string
}