/* Wraps multiple KmlLayers in a single object to easily 
   turn a multi-KmlLayer layer on or off, but does not create
   the KmlLayer objects (an action which loads the KML layer
   data) until the first time the layer is turned on.*/
class LazyLayer{
  
  constructor(urls, zIndex){
    this.urls = urls;
    this.zIndex = zIndex || 0
    this.members = null;
  }
  
  setMap(map){
    if(map && !this.members){
      this.members = [];
      for(var i=0; i<this.urls.length; i++){
        this.members.push(new google.maps.KmlLayer({
          url: this.urls[i],
          map: null,
          preserveViewport: true,
          zIndex: this.zIndex
        }));
      }
    }
    this.members.forEach(function(e){
      e.setMap(map);
    });
  }
  
  getMap(){
    return this.members[0].getMap();
  }
}
