/* Wraps multiple KmlLayers in a single object to easily 
   turn a multi-file layer on or off. */
class Layer{
  constructor(members){
    this.members = members;
  }
  setMap(map){
    this.members.forEach(function(e){
      e.setMap(map);
    });
  }
}
