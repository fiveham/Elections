/* Wraps multiple KmlLayers in a single object to easily 
   turn a multi-file layer on or off. */
class Layer{
  constructor(members, func){
    if(func){
      this.members = [];
      for(var i=0; i<members.length; i++){
        this.members.push(func(members[i]));
      }
    } else{
      this.members = members;
    }
  }
  setMap(map){
    this.members.forEach(function(e){
      e.setMap(map);
    });
  }
  getMap(){
    return this.members[0].getMap();
  }
}
