/**
 * Module dependencies.
 */
var fs            = require( 'fs' ),
    ConvertJob    = require( '../lib/ConvertJob' )


module.exports = function createConvertJob( req, res, next ) {
  var filestream, params, convertjob
  
  filestream = req.filestream
  params = req.params

  convertjob = new ConvertJob( filestream, params )
  req.convertjob = convertjob
  
  next()

  app.jobqueue.push( convertjob )
}