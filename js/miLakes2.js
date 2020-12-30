// Load Animation
let spinnerWrapper = document.querySelector('.spinner-wrapper');

window.addEventListener('load', function () {
    // spinnerWrapper.style.display = 'none';
    spinnerWrapper.parentElement.removeChild(spinnerWrapper);
}); 

// Info
// Get the modal
var modal = document.getElementById('myModal');

// Get the button that opens the modal
var btn = document.getElementById("create");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// Open Modal on Load
window.addEventListener('load', function(){
    modal.style.display = "block";
});

// When the user clicks the button, open the modal 
btn.onclick = function() {
    modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
    modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}