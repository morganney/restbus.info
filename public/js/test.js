window.addEventListener('DOMContentLoaded', function() {
  var xhr = new XMLHttpRequest();

  xhr.open('GET', 'http://localhost:3535/agencies');
  xhr.onload = function() {
    if(xhr.status === 200) {
      console.log(xhr.responseText);
    } else {
      console.log(xhr.statusText);
    }
  }
  xhr.onerror = function(e) {
    console.log('network error');
    console.dir(xhr);
  }
  xhr.send(null);
});