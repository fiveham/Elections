/* Depends on: global var 'popups': a list of objects each of which has an 'id' */

/* Switch this popup on and the others off or switch this one off if it is already on. */
function toggle_popup(element_id){
  var element = document.getElementById(element_id);
  var state = element.style.visibility === 'hidden' ? 'visible' : 'hidden';
  for(var i=0; i<popups.length; i++){
    document.getElementById(popups[i].id).style.visibility = 'hidden';
  }
  element.style.visibility = state;
}
