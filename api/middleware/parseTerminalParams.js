
module.exports = function ( req, res, next ) {
  var terminalParams

  terminalParams = req.params[ 0 ]
                      .trim()
                      .split( /\s+/ )

  terminalParams.push( '-' )
  terminalParams.unshift( '-' )

  req.terminalParams = terminalParams
  
  next()
}