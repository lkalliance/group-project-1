// // Get the modal
// var modal = document.getElementById("#myModal");

// // Get the button that opens the modal
// var btn = document.getElementById("showBtn");

// // Get the <span> element that closes the modal
// var span = document.getElementsByClassName("close")[0];

// // When the user clicks the button, open the modal 
// btn.onclick = function() {
//   modal.style.display = "block";
// }

// // When the user clicks on <span> (x), close the modal
// span.onclick = function() {
//   modal.style.display = "none";
// }

// // When the user clicks anywhere outside of the modal, close it
// window.onclick = function(event) {
//   if (event.target == modal) {
//     modal.style.display = "none";
//   }
// }

// Close modal when button with id "yes-button" is clicked

// Variables to attempt to imput results in modal
let searchResults = $('#searchResults');
let searchHeading = $('<h1>');
let yesBtn = $('#yesBtn');
let noBtn = $('#noBtn');

searchHeading.text('Hello World');

searchHeading.attr('class', 'fancy');

searchHeading.addClass('p-5');

searchResults.append(searchHeading);

// $(selector).click(function (e) {
//     e.preventDefault(modal.style.display = "none");
    
// });

// Test number two

$.each(yesBtn, function () {
    selected.push($(this).val());
  });
  console.log();
