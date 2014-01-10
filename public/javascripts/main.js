
var form, paramsInput

form = document.getElementById( "form" )
paramsInput = document.getElementById( "params" )

paramsInput.addEventListener( 'keyup', function() {
  form.setAttribute( "action", "/convert " + paramsInput.value )
}, false)