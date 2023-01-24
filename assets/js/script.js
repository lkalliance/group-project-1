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

    // API KEYS
    const geoAPI = "&apiKey=137d269d6c174878a5fba2984b37e8d3";
    const weatherAPI = "&appid=7897ccda0965301a098fbfd75fe1b4aa";

    // VARIABLES WE'LL NEED IN THIS SCOPE
    let mapURL;

    // VARIABLES FOR TESTING SETTINGS ON MAP SIZE
    let zoom = 12;
    let height = 400; 
    let width = 400;


    initialize();


    function initialize() {
        // This function does tasks to set up page

        // Set up some listeners
        jSearchBtn.on("click", function(e) {
            // This listener is on the search button
            e.preventDefault();
            console.log("The search button was clicked!");

            // Make sure that there is actual text in the search field
            if ( jSearchInput.val().trim() == "" ) {
                console.log("The search field was empty!");
                return;
            }

            // Start the search process: get latitude and longitude
            getLatLon( jSearchInput.val() );
        })

        // Draw areas of the page
        drawSavedSearches();
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
                console.log( {location} );
                // save the latitude and longitude
                let lat = location.lat;
                let lon = location.lon;
                // now call the other functions
                getSolunar(lat, lon);
                getWeather(lat, lon);
                createMapURL(lat, lon);
            })
            .catch( function( err ) {
                console.log(err);
            });      
    }

    function getSolunar ( lat, lon ) {
        // This function gets the data on seven days of solunar data
        console.log("Getting solunar data for latitude " + lat + ", longitude " + lon);
    }

    function getWeather ( lat, lon ) {
        // This function gets the data on seven days of weather data
        console.log("Getting weather data for latitude " + lat + ", longitude " + lon);
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










/* btn.addEventListener("click", function(e) {
    e.preventDefault();

    if (txt.value == "") return;

    let requestOptions = {
        method: 'GET'
      };
    let place = "https://api.geoapify.com/v1/geocode/search?text=" + txt.value + "&format=json&apiKey=137d269d6c174878a5fba2984b37e8d3";

    fetch(place, requestOptions)
      .then(function(response) {
        return response.json();
      })
      .then(function(data){
        
        emptyThis(readout);

        let geoheader = document.createElement("h2");
        geoheader.textContent = "From Geoapify:";
        readout.appendChild(geoheader);

        let location = data.results[0];
        console.log({location});
        let lat = location.lat;
        let lon = location.lon;
        
        let data1 = document.createElement("div");
        let data2 = document.createElement("div");
        let data3 = document.createElement("div");
        let data4 = document.createElement("div");

        data1.textContent = "location: " + location.city + ", " + location.country;
        data2.textContent = "Result type: " + location.category;
        data3.textContent = "latitude: " + location.lat;
        data4.textContent = "longitude: " + location.lon;

        readout.appendChild(data1);
        readout.appendChild(data2);
        readout.appendChild(data3);
        readout.appendChild(data4);

        let getMap = "https://maps.geoapify.com/v1/staticmap?style=osm-bright-smooth&width=800&height=600&center=lonlat:" + lon + "," + lat + "&zoom=12&apiKey=137d269d6c174878a5fba2984b37e8d3";

        readout.style.backgroundImage = "url(" + getMap + ")";

        let getSolunar = "https://api.solunar.org/solunar/" + lat + "," + lon + ",20220123,-6";

        // let getWeather = "https://api.openweathermap.org/data/3.0/onecall?" + latlon + APIunits + APIexclude + APIkey;

        let getWeather = "https://api.openweathermap.org/data/3.0/onecall?&lat=" + lat + "&lon=" + lon + "&units=imperial&exclude=minutely&appid=7897ccda0965301a098fbfd75fe1b4aa";


        fetch(getMap)
            .then(function(response) {
                return response
            })

        fetch(getSolunar)
            .then(function(response) {
                return response.json();
            })
            .then(function(data) {

                let solunarheader = document.createElement("h2");
                solunarheader.textContent = "From Solunar:";
                readout.appendChild(solunarheader);
                let data1 = document.createElement("div");
                let data2 = document.createElement("div");
                let data3 = document.createElement("div");
                let data4 = document.createElement("div");
                
                data1.textContent = "Major: " + data.major1Start + " to " + data.major1Stop;
                data2.textContent = "Major: " + data.major2Start + " to " + data.major2Stop;
                data3.textContent = "Minor: " + data.minor1Start + " to " + data.minor1Stop;
                data4.textContent = "Minor: " + data.minor2Start + " to " + data.minor2Stop;
                
                readout.appendChild(data1);
                readout.appendChild(data2);
                readout.appendChild(data3);
                readout.appendChild(data4);
            })

            fetch(getWeather)
              .then(function(response) {
                  return response.json();
              })
              .then(function(data) {
                  console.log(data);

                  let weatherheader = document.createElement("h2");
                    weatherheader.textContent = "From OpenWeatherMap:";
                    readout.appendChild(weatherheader);
                    console.log(lat);
                    console.log(lon);
                    console.log(ourProject);

                    readout.appendChild(document.createTextNode("Currently: " + data.current.temp + "°F, feels like " + data.current.feels_like + "°F. wind is " + data.current.wind_speed + "MPH, " + data.current.clouds + "% cloud cover."));

                    let hourly = "Hourly: ";
                    for (let i = 0; i < data.hourly.length; i++ ) {
                        hourly += data.hourly[i].temp + "°F, ";
                        hourly += data.hourly[i].wind_speed + " MPH, ";
                        hourly += data.hourly[i].clouds + "% cloud cover";
                        if (i < (data.hourly.length - 1)) hourly += " / ";
                    }

                    readout.appendChild(document.createTextNode(hourly));
              })
      })

}) */