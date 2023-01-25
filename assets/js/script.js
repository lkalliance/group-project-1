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

    // DECLARE VARIABLES FOR BUTTONS AND INPUTS
    const jSearchInput = $("#searchInput");
    const jSearchBtn = $("#searchBtn");

    // API KEYS
    const geoAPI = "&apiKey=137d269d6c174878a5fba2984b37e8d3";
    const weatherAPI = "&appid=7897ccda0965301a098fbfd75fe1b4aa";

    // VARIABLES WE'LL NEED IN THIS SCOPE
    let mapURL;

    // VARIABLES FOR TESTING SETTINGS ON MAP SIZE
    let zoom = 12;
    let height = 300; 
    let width = 300;


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

        // Draw areas of the page
        drawSavedSearches();

        // Save myself some time with an auto search
        // getLatLon("Prior Lake");
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
                // now call the other functions
                getWeather( lat, lon );
                createMapURL( lat, lon );
                drawMainDisplay( jAboutLocContainer, data.results[0] );
                // drawConfirmationModal( jAboutLocContainer, location );  // switch to actual modal container
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
                let dToday = dayjs();
                getSolunar ( lat, lon, offset, dToday, dataCollect );

            })
            .catch( function( err ) {
                console.log( err );
            });
    }

    function getSolunar( lat, lon, offset, dDate, results ) {
        // This function makes recursive calls to get solunar data
        // parameters "lat" and "lon" are geographic coordinates
        // parameter "offset" is the offset in hours from GMT
        // parameter "dDate" is the date we're searching on
        // paraemter "results" is the object to pass along to the renderer

        solunarCall = "https://api.solunar.org/solunar/" + lat + "," + lon + "," + dDate.format("YYYYMMDD") + "," + offset;

        fetch( solunarCall )
            .then(function( response ) {
                return response.json();
            })
            .then(function ( solData ) {
                // package the results
                let thisDay = {
                    date: dDate.format("MMM D"),
                    data: solData
                };
                // package up additional references
                let passAlong = {
                    lat: lat,
                    lon: lon,
                    offset: offset
                }
                // send it to the function compiling the array
                constructSolunar( thisDay, results, passAlong );
            })
            .catch(function(err) {
                console.log(err);
            });
        
    }

    function constructSolunar ( next, results, reference ) {
        // This function assembles the solunar results
        // parameter "next" is the most recent day collected
        // parameter "results" is the object to pass along

        results.solunar.push(next);
        // Do we have enough? If yes, send it all to be rendered
        if (results.solunar.length == 7) drawForecast(jForecastContainer, results);
        // If no, increment the day and go get the next one
        else {
            let dToday = dayjs();
            let nextDay = dToday.add(results.solunar.length, "day");
            getSolunar(reference.let, reference.lon, reference.offset, nextDay, results);
        }       
    }

    function createMapURL ( lat, lon ) {
        // This function creates the URL to use to get the static map
        console.log("Creating the map URL for latitude " + lat + ", longitude " + lon);

        mapURL = "https://maps.geoapify.com/v1/staticmap?style=osm-bright-smooth&width=" + width + "&height=" + height + "&center=lonlat:" + lon + "," + lat + "&zoom=" + zoom + geoAPI;

        // drop it on the page for now, so we can see it
        let jMapTile = $( "<img>" );
        jMapTile.attr( "src", mapURL );
        jAboutLocContainer.append( jMapTile );
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
    console.log(info);
}

function drawForecast ( jContainer, data ) {
    // This function draws the forecast panel
    // parameter "jContainer" is the container to fill
    // parameter "weather" is the weather data to use
    // parameter "solunar" is the solunar data to use

    console.log("Drawing the forecast");
    // make SURE that the array is sorted correctly
    data.solunar.sort( function(a, b) {
        let aDate = dayjs(a.date);
        let bDate = dayjs(b.date);
        return a - b;
    })

    // iterate over seven days, build cards, and insert
    let jCard, jTitle;
    for ( let i = 0; i < data.solunar.length; i++ ) {
        console.log("Creating a card");
        // create the card
        jCard = $("<div>");
        jCard.addClass("forecast-card");
        jTitle = $("<h3>");
        if ( i == 0 ) jTitle.text("Today");
        else if ( i == 1 ) jTitle.text("Tomorrow");
        else jTitle.text(data.solunar[i].date);
        jCard.append( jTitle );
        jContainer.append( jCard );
    }
}
