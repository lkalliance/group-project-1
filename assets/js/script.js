const ourProject = "Moonfish";

// Extend Day.js to include time zone support
dayjs.extend(window.dayjs_plugin_utc);
dayjs.extend(window.dayjs_plugin_timezone);

$( document ).ready( function () {

    // DECLARE VARIABLES FOR DOM CONTAINERS
    const jSearchContainer = $("#search");
    const jDisplayContainer = $("#display");
    const jAboutLocContainer = $("#about");
    const jForecastContainer = $("#forecast");
    const jConfirmationModal = $("#confirmation-modal");

    // DECLARE VARIABLES FOR BUTTONS AND INPUTS
    const jSearchInput = $("#searchInput");
    const jSearchBtn = $("#searchBtn");

    // API KEYS
    const geoAPI = "&apiKey=137d269d6c174878a5fba2984b37e8d3";
    const weatherAPI = "&appid=7897ccda0965301a098fbfd75fe1b4aa";

    // VARIABLES WE'LL NEED IN THIS SCOPE
    let mapURL;

    // VARIABLES FOR TESTING SETTINGS ON MAP SIZE
    let zoom = 10;
    let height = 200; 
    let width = 200;


    initialize();


    function initialize() {
        // This function does tasks to set up page

        // Set up some listeners
        jSearchBtn.on("click", function(e) {
            // This listener is on the search button
            e.preventDefault();
            console.log("The search button was clicked!");

            // make sure that there is actual text in the search field
            if ( jSearchInput.val().trim() == "" ) {
                console.log("The search field was empty!");
                return;
            }

            // empty out the containers
            clearTheDecks();
            // start the search process: get latitude and longitude
            getLatLon( jSearchInput.val() );
        })

        jConfirmationModal.on("click", "button", function(e) {
            // This listener is on the confirmation modal

            e.preventDefault();
            if ( e.currentTarget.dataset.correct == "yes" ) {
                // continue the API process
                let latlon = e.currentTarget.dataset.latlon;
                getWeather( latlon.split(",")[0], latlon.split(",")[1] );
                // prepare data to send along to draw the main display
                let data = { name: jConfirmationModal.find("h3")[0].textContent }, sections;
                let items = jConfirmationModal.find("li");
                Object.entries(items).forEach(([key, value]) => {
                    if (!isNaN(parseInt(key))) {
                        sections = value.textContent.split(": ");
                        data[sections[0]] = sections[1];
                    }
                })
                drawMainDisplay( jAboutLocContainer, data, mapURL );
            }
            // hide the confirmation modal
            jConfirmationModal.removeClass("mg-show");
        });

        // Draw areas of the page
        drawSavedSearches();

        getLatLon("Prior Lake");
    }

    // API FUNCTIONS

    function getLatLon ( where ) {
        // This function gets the latitude and longitude
        // parameter "where" is the user's search term

        let call = "https://api.geoapify.com/v1/geocode/search?text=" + where + "&format=json" + geoAPI;
        let requestOptions = {
            method: "GET"
        };

        fetch( call, requestOptions )
            .then( function( response ) {
                return response.json();
            })
            .then( function( data ) {
                // grab the specific data from the returned array
                let location = data.results[0];
                // save the latitude and longitude
                let lat = location.lat;
                let lon = location.lon;
                // update the map URL
                mapURL = "https://maps.geoapify.com/v1/staticmap?style=osm-bright-smooth&width=" + width + "&height=" + height + "&center=lonlat:" + lon + "," + lat + "&zoom=" + zoom + geoAPI;
                // now call the other functions
                // getWeather( lat, lon );
                drawConfirmationModal( jConfirmationModal, location, mapURL, location );
            })
            .catch( function( err ) {
                console.log(err);
            });      
    }

    function getWeather ( lat, lon ) {
        // This function gets the data on weather
        // parameters "lat" and "lon" are latitude and longitude

        // first get the weather
        let weatherCall = "https://api.openweathermap.org/data/3.0/onecall?&lat=" + lat + "&lon=" + lon + "&units=imperial&exclude=minutely" + weatherAPI;

        fetch( weatherCall )
            .then(function( response ) {
                return response.json();
            })
            .then( function( weatherData ) {

                // construct the weather portion of the object
                let dataCollect = {
                    weather: weatherData,
                    solunar: []
                };
                
                // now send this along to collect the solunar data:
                let offset = weatherData.timezone_offset / 3600;
                getSolunar ( lat, lon, offset, dataCollect );
            })
            .catch( function( err ) {
                console.log( err );
            });
    }

    function getSolunar( lat, lon, offset, results ) {
        // This function makes recursive calls to get solunar data
        // parameters "lat" and "lon" are geographic coordinates
        // parameter "offset" is the offset in hours from GMT
        // parameter "dDate" is the date we're searching on
        // paraemter "results" is the object to pass along to the renderer

        let solunarCalls = [];
        let thisCall, dDate;
        let dToday = dayjs();
        for ( let i = 0; i < 7; i++ ) {
            dDate = dToday.add(i, "day");
            thisCall = "https://api.solunar.org/solunar/" + lat + "," + lon + "," + dDate.format("YYYYMMDD") + "," + offset;
            solunarCalls.push(thisCall);
        }

        Promise.all( solunarCalls.map( call => fetch( call )))
            .then( responses => Promise.all( responses.map( response => response.json())))
            .then((datas => results.solunar=datas))
        
        drawForecast( jForecastContainer, results );
    }

    // UTILITIES

    function clearTheDecks() {
        // This function clears out all dynamic content
        jAboutLocContainer.empty();
        jForecastContainer.empty();
    }
})




/* ---- DRAW PAGE FUNCTIONS ---- */

function drawSavedSearches ( jContainer ) {
    // This function draws the saved searches on the page
    // parameter "jContainer" is the saved searches container

    console.log("Drawing the saved searches");
}

function drawConfirmationModal ( jContainer, confirmationInfo, map ) {
    // This function draws the confirmation modal
    // parameter "jContainer" is the modal
    // parameter "confirmationInfo" is the data to use
    // parameter "map" is the url for the map tile
    // parameters "locationInfo" is the return from the latlon query

    console.log("Drawing the confirmation modal");
    console.log({ confirmationInfo });

    // collect and create some DOM nodes
    let jTitle = $("#confirmation-modal .mg-container h3");
    let jBody = $("#confirmation-modal .modal-content");
    let jList = $("<ul>");
    let jCounty = $("<li>");
    let jState = $("<li>");
    let jCountry = $("<li>");
    let jMap = $("<img>");
    // clear out the info from last time
    jBody.empty();
    // write the city name
    jTitle.text(confirmationInfo.city);
    // populate the list with stuff
    jCounty.text("county: " + confirmationInfo.county);
    jState.text("state: " + confirmationInfo.state);
    jCountry.text("country: " + confirmationInfo.country);
    if ( confirmationInfo.country_code == "us" ) {
        // if the country is US, add the county and state
        jList.append(jCounty);
        jList.append(jState);
    }
    else jList.append(jCountry);
    // set up the map
    jMap.attr("src", map);
    // append the map and the list
    jBody.append(jMap);
    jBody.append(jList);
    // encode the yes-button with the data to pass on
    jContainer.find("button").attr("data-latlon", (confirmationInfo.lat + "," + confirmationInfo.lon));
    jContainer.find("button").attr("data-place", jTitle.text());
    // show the modal
    jContainer.addClass("mg-show");
}

function drawMainDisplay ( jContainer, mainDisplayInfo, map ) {
    // This function draws the main info panel
    // parameter "jContainer" is the container to fill
    // parameter "mainDisplayInfo" is the data to use
    // parameter "map" is the URL for the map tile

    console.log("Drawing the main info panel");
    console.log({ mainDisplayInfo });
}

function drawForecast ( jContainer, forecastInfo ) {
    // This function draws the forecast panel
    // parameter "jContainer" is the container to fill
    // parameter "forecastInfo" is the data needed to construct

    console.log("Drawing the forecast");
    console.log({ forecastInfo });
    // make SURE that the array is sorted correctly
    // data.solunar.sort( function(a, b) {
    //     let aDate = dayjs(a.date);
    //     let bDate = dayjs(b.date);
    //     return a - b;
    // })

    // iterate over seven days, build cards, and insert
    let jCard, jTitle;
    let dToday = dayjs();
    for ( let i = 0; i < forecastInfo.solunar.length; i++ ) {
        // calculate the day
        
        // create the card
        jCard = $("<div>");
        jCard.addClass("forecast-card");
        jTitle = $("<h3>");
        if ( i == 0 ) jTitle.text("Today");
        else if ( i == 1 ) jTitle.text("Tomorrow");
        else jTitle.text(forecastInfo.solunar[i]);
        jCard.append( jTitle );
        jContainer.append( jCard );
    }
}
