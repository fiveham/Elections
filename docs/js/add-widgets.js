/* Depends on: global vars 'widgets'; 'triggers'
   widgets: a list of objects each of which has 'id' and 'where'
      id: the value of the id attribute of the element that the widget is
      where: a google.maps.ControlPosition
      This list should not be populated until after the maps API is loaded
   triggers: a list of event names */

/* Add listed widgets to the map and make them visible (set opacity to 1) */
function add_widgets(){
  widgets.forEach(function(widget){
    var element = document.getElementById(widget.id);
    map.controls[widget.where].push(element); /* Add widget to the map */
    triggers.forEach(function(t){
      google.maps.event.addListenerOnce(map, t, function(){
        element.style.opacity = "1"; /* Set opacity to 1 */
      });
    });
  });
}
