var childProcess  = require( 'child_process' ),
    inherits      = require( 'util' ).inherits,
    EventEmitter  = require( 'events' ).EventEmitter


module.exports = Job

function Job( params ) {
  EventEmitter.apply( this, arguments )
  this.params = params
}

inherits( Job, EventEmitter )