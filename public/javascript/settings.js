
//notification ish
// using $x as the jQuery object for version 1.7.2
$(document).ready(function () {

  let panel = $('#accountPanel'),
    button = $('#accountButton');

  $(button).click(function (e) {
    e.preventDefault();

    $(panel).toggleClass('on');

    // change ARIA elements based on state
    if ($(panel).hasClass('on')) {
      $(button).attr('aria-expanded', 'true');
      $(panel).attr('aria-hidden', 'false');
    } else {
      $(button).attr('aria-expanded', 'false');
      $(panel).attr('aria-hidden', 'true');
    }
  });

  $('.context a').click(function () {
    $('.select').removeClass('selected');
    $(this).closest('li').find('span').toggleClass('selected');
  });

  $(document).mouseup(function (e) {
    // close panel when you click anywhere outside the panel

    // check for IE9
    if (navigator.appVersion.indexOf("MSIE 9.") != -1) {

      document.onclick = function (e) {
        if (e.target.id !== panel) {
          panel.style.display = 'none';
        }
      };

    } else {

      if (!$(button).is(e.target) && !panel.is(e.target) && panel.has(e.target).length === 0) {
        panel.removeClass('on');
      }

    }
  });

})


/*
(function ready(fn) {
  if (document.attachEvent ? document.readyState === 'complete' : document.readyState !== 'loading') {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
 
    let panel = document.getElementById('accountPanel'),
        button = document.getElementById('accountButton');
 
    // hide the panel when clicking outside the panel
    document.onclick = checkPanelOn;
 
    function checkPanelOn(e) {
      e.preventDefault();
 
      let target = (e && e.target) || (event && event.srcElement);
 
      if (!checkParent(target, panel)) {
        // click isn't on the panel
 
        if (checkParent(target, button)) {
 
          // click on the button
          if (panel.classList.contains('on')) {
            panel.classList.remove('on');
          } else {
            panel.classList.add('on');
          }
        } else {
          // click both outside button and outside panel, hide panel
          panel.classList.remove('on');
        }
      }
    }
 
    function checkParent(t, el) {
      while (t.parentNode) {
        if (t == el) {
          return true;
        }
        t = t.parentNode;
      }
      return false;
    }
 
  }
}());
*/









//profile




document.getElementById('getval').addEventListener('change', readURL, true);
function readURL(){
  var file = document.getElementById("getval").files[0];
  var reader = new FileReader();
  reader.onloadend = function(){
      document.getElementById('profile-upload').style.backgroundImage = "url(" + reader.result + ")";        
  }
  if(file){
      reader.readAsDataURL(file);
  }else{
  }
}


