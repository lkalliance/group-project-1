const ourProject = "Moonfish";

$( document ).ready( function () {

    // DECLARE VARIABLES FOR DOM CONTAINERS
    const jSearchContainer = $("#search");
    const jDisplayContainer = $("#display");
    const jAboutLocContainer = $("#about");
    const jForecastContainer = $("#forecast");

    // DECLARE VARIABLES FOR BUTTONS AND INPUTS
    const jSearchInput = $("#searchInput");
    const jSearchBtn = $("#searchBtn");


    initialize();


    function initialize() {
        // This function does tasks to set up page

        // Set up some listeners
        jSearchBtn.on("click", function(e) {
            e.preventDefault();
            console.log("The search button was clicked!");
        })

        // Draw areas of the page
        drawSavedSearches();
    }
    
})




/* ---- DRAW PAGE FUNCTIONS ---- */

function drawSavedSearches ( jContainer ) {
    // This function draws the saved searches on the page
    // parameter "jContainer" is the saved searches container

    console.log("Drawing the saved searches");
}

function drawConfirmationModal ( jContainer, info ) {
    // This function draws the confirmation modal
    // parameter "jContainer" is the container to fill
    // parameter "info" is the data to use

    console.log("Drawing the confirmation modal");
}

function drawMainDisplay ( jContainer, info ) {
    // This function draws the main info panel
    // parameter "jContainer" is the container to fill
    // parameter "info" is the data to use

    console.log("Drawing the main info panel");
}

function drawForecast ( jContainer, info ) {
    // This function draws the forecast panel
    // parameter "jContainer" is the container to fill
    // parameter "info" is the data to use
}

