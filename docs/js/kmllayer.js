/* Return a new google.maps.KmlLayer based on the KML or KMZ file at the url */
function kmllayer(url, zIndex){
  var result = new google.maps.KmlLayer({
    url: url,
    map: null,
    preserveViewport: true,
    zIndex: zIndex || 0
  });
  return result;
}
