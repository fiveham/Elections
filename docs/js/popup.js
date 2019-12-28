/* This function is designed to work alongside some CSS so that each tab in the 
popup element has a data-tab attribute and that each tab is invisible except when the 
popup element itself has a matching data-tab attribute. */

/* Switch this popup on and the others off or switch this one off if it is already on. */
/* If you only need to shut the popup element off, parameter tab is not needed */
function pop_tab(popup_id, tab){
  var element = document.getElementById(popup_id);
  var new_visibility = element.style.visibility === 'hidden' ? 'visible' : 'hidden';
  if(tab){
    element.setAttribute('data-tab', tab);
  }
  element.style.visibility = new_visibility;
}
