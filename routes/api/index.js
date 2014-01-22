/**
 * Module dependencies.
 */
var StreamBuffer  = require( '../../lib/StreamBuffer' ),
    http          = require( 'http' )


module.exports.convert = function( req, res ) {
  var convertjob, errorBuffer

  convertjob = req.convertjob  

  convertjob.on( 'stdout', function( firstbuffer, stdout ) {
    res.set( 'Content-Type', 'image/jpg' )
    res.write( firstbuffer )
    stdout.pipe( res )
  })

  convertjob.on( 'stderr', function( firstbuffer, stderr ) {
    errorBuffer = new StreamBuffer( stderr )
    errorBuffer.push( firstbuffer )
    stderr.on('end', function() {
      res.set( 'Content-Type', 'application/json' )
      res.send( 400, { error: errorBuffer.toString() })
    })
  })

  convertjob.on( 'processerror', function( error ) {
    res.set( 'Content-Type', 'application/json' )
    res.send( 500, { error: error })
  })
}

module.exports.queue = function( req, res ) {
  var convertjob, callbackurl

  convertjob = req.convertjob
  callbackurl = req.query.callbackurl
  console.log( callbackurl )
  convertjob.on( 'stdout', function( firstbuffer, stdout ) {
    var post

    post = http.request( callbackurl )

    post.write( firstbuffer )
    stdout.pipe( post )

    res.send( 200 )
  })

  convertjob.on( 'stderr', function( firstbuffer, stderr ) {
    errorBuffer = new StreamBuffer( stderr )
    errorBuffer.push( firstbuffer )
    stderr.on('end', function() {
      res.set( 'Content-Type', 'application/json' )
      res.send( 400, { error: errorBuffer.toString() })
    })
  })

  convertjob.on( 'processerror', function( error ) {
    res.set( 'Content-Type', 'application/json' )
    res.send( 500, { error: error })
  })

  //res.send(callbackurl)
}
