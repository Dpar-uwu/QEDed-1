
// var schoolOption = '';

// $(document).ready(function(){
//     getSchool();
// })

// function getSchool(){
//     var data = {
//         resource_id: 'ede26d32-01af-4228-b1ed-f05c45a1d8ee', // the resource id
//         q: 'primary', // query for 'primary'
//         limit: 200
//     };
//     $.ajax({
//         url: 'https://data.gov.sg/api/action/datastore_search',
//         data: data,
//         dataType: 'JSON',
//         success: function(data, textStatus, xhr) {
//             for(var i =0; i<data.result.records.length; i++){
//                 schoolOption += `<option value='${data.result.records[i].school_name}'>${data.result.records[i].school_name}</option>`;
//             }   
//         },
//         error: function(xhr, textStatus, errorThrown){
//             console.log(errorThrown);
//         }
//     });
// }

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



//Profile 


//declearing html elements

const imgDiv = document.querySelector('.profile-pic-div');
const img = document.querySelector('#photo');
const file = document.querySelector('#file');
const uploadBtn = document.querySelector('#uploadBtn');

//if user hover on img div 

imgDiv.addEventListener('mouseenter', function () {
  uploadBtn.style.display = "block";
});

//if we hover out from img div

imgDiv.addEventListener('mouseleave', function () {
  uploadBtn.style.display = "none";
});

//lets work for image showing functionality when we choose an image to upload

//when we choose a foto to upload

file.addEventListener('change', function () {
  //this refers to file
  const choosedFile = this.files[0];

  if (choosedFile) {

    const reader = new FileReader(); //FileReader is a predefined function of JS

    reader.addEventListener('load', function () {
      img.setAttribute('src', reader.result);
    });

    reader.readAsDataURL(choosedFile);


  }
});



