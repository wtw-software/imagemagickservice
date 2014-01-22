
module.exports = function ( req, res, next ) {
  var terminalParams
  
  if( !req.query.terminalparams )
    return next()

  terminalParams = req.query.terminalparams
                      .trim()
                      .split( /\s+/ )

  terminalParams.push( '-' )
  terminalParams.unshift( '-' )

  req.params = terminalParams
  
  next()
}