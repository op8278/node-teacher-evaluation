$(document).ready(function(){
  particlesJS.load('particles-js', '/js/particles.json', function() {
    console.log('callback - particles.js config loaded');
  });

  $('#check-code').click(function(event){
    alert('img');
    //TODO Ajax获取最新图片
  });
});