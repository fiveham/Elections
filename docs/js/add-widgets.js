/* Depends on: global vars 'widgets', 'triggers', 'map' 
   widgets: a list of objects each of which has 'id' and 'where'
      id: the value of the id attribute of the element that is the widget
      where: an integer 1 to 13 corresponding to google.maps.ControlPosition
         Note about ControlPosition:
         + 01    02    03 +
         05              07
         04      13      08
         06              09
         + 10    11    12 +
   triggers: a list of event names 
   map: the google.maps.Map map object */

/* Add listed widgets to the map and add add one-time event-listeners to the map 
   any of which when triggered will make the widgets visible by setting each 
   widget's opacity to 1.*/
function add_widgets(){
  widgets.forEach(function(widget){
    var element = document.getElementById(widget.id);
    map.controls[widget.where].push(element); /* Add widget to the map */
    triggers.forEach(function(t){
      google.maps.event.addListenerOnce(map, t, function(){
        element.style.opacity = "1";
      });
    });
  });
}
