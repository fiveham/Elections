function geolocate() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var geolocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      var circle = new google.maps.Circle({
        center: geolocation,
        radius: position.coords.accuracy
      });
      map.fitBounds(circle.getBounds());
    });
  } /*else {
    alert("Not sure why, but I can't geolocate you.");
  }*/
}
