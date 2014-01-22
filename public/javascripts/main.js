
var form, paramsInput

form = document.getElementById( "form" )
paramsInput = document.getElementById( "params" )

paramsInput.addEventListener( 'keyup', function() {
  form.setAttribute( "action", "/api/convert " + paramsInput.value )
}, false)