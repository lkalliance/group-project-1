const ourProject = "Moonfish";

// Extend Day.js to include time zone support
dayjs.extend(window.dayjs_plugin_utc);
dayjs.extend(window.dayjs_plugin_timezone);

$(document).ready(function () {
  // DECLARE VARIABLES FOR DOM CONTAINERS
  const jSearchContainer = $("#search");
  const jDisplayContainer = $("#display");
  const jAboutLocContainer = $("#about");
  const jForecastContainer = $("#forecast");
  const jConfirmationModal = $("#confirmation-modal");
  const jConfirmationName = $("#searchName");
  const jSavedContainer = $("#savedSearches");
  const jClearBtn = $("#clearBtn");

  // DECLARE VARIABLES FOR BUTTONS AND INPUTS
  const jSearchInput = $("#searchInput");
  const jSearchBtn = $("#searchBtn");

  // API KEYS
  const geoAPI = "&apiKey=24a91ada014a49b1b1913d65b663fe0f";
  const weatherAPI = "&appid=7897ccda0965301a098fbfd75fe1b4aa";

  // VARIABLES WE'LL NEED IN THIS SCOPE
  let mapURL;

  // VARIABLES FOR TESTING SETTINGS ON MAP SIZE
  let zoom = 10;
  let height = 250;
  let width = 250;

  initialize();

  function initialize() {
    // This function does tasks to set up page

    // Set up some listeners
    jSearchBtn.on("click", function (e) {
      // This listener is on the search button
      e.preventDefault();

      // make sure that there is actual text in the search field
      submitSearch();
    });

    jSearchInput.on("keyup", function (e) {
      // This listener is on the search input
      if (e.keyCode == 13) {
        e.preventDefault();

        // make sure that there is actual text in the search field
        submitSearch();
      }
    });

    jClearBtn.on("click", function (e) {
      // This listener is on the "Clear searches" button
      e.preventDefault();
      clearSearch(jSavedContainer);
    });

    jSavedContainer.on("click", "button", function (e) {
      // This delegated listener is on the saved searches container
      e.preventDefault();

      // collect the data from the button's attributes
      let data = {
        name: e.currentTarget.textContent,
      };
      if (e.currentTarget.getAttribute("data-country")) {
        data.country = e.currentTarget.getAttribute("data-country");
      }
      if (e.currentTarget.getAttribute("data-county")) {
        data.county = e.currentTarget.getAttribute("data-county");
      }
      if (e.currentTarget.getAttribute("data-state")) {
        data.state = e.currentTarget.getAttribute("data-state");
      }

      // draw the main display and start the data-getting process
      drawMainDisplay(jAboutLocContainer, data, e.currentTarget.dataset.map);
      let coordinates = e.currentTarget.dataset.latlon.split(",");
      getWeather(coordinates[0], coordinates[1]);
    });

    jConfirmationModal.on("click", "button", function (e) {
      // This listener is on the confirmation modal

      e.preventDefault();
      if (e.currentTarget.dataset.correct == "yes") {
        // continue the API process
        let latlon = e.currentTarget.dataset.latlon;
        getWeather(latlon.split(",")[0], latlon.split(",")[1]);
        // prepare data to send along to draw the main display
        let data = { name: jConfirmationName.val() },
          sections;
        // scrape the data from the confirmation modal
        let items = jConfirmationModal.find("li");
        Object.entries(items).forEach(([key, value]) => {
          if (!isNaN(parseInt(key))) {
            data[value.id] = value.textContent;
          }
        });

        // draw the main display and save the search
        drawMainDisplay( jAboutLocContainer, data, mapURL );
        saveSearch( jSavedContainer, latlon, jConfirmationName.val(), data, mapURL );
      }
      // hide the confirmation modal
      jConfirmationModal.removeClass("mg-show");
      // clear the search field
      jSearchInput.val("");
    });

    function submitSearch() {
      // make sure that there is actual text in the search field
      if (jSearchInput.val().trim() == "") return;

      // empty out the containers
      clearTheDecks();
      // start the search process: get latitude and longitude
      getLatLon( jSearchInput.val() );
    }

    // Draw areas of the page
    drawSavedSearches( jSavedContainer );
  }


  // API FUNCTIONS

  function getLatLon(where, Saved) {
    // This function gets the latitude and longitude
    // parameter "where" is the user's search term

    let call = "https://api.geoapify.com/v1/geocode/search?text=" + where + "&format=json" + geoAPI;
    let requestOptions = {
      method: "GET",
    };

    fetch(call, requestOptions)
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        // grab the specific data from the returned array
        let location = data.results[0];
        // save the latitude and longitude
        let lat = location.lat;
        let lon = location.lon;
        // update the map URL
        mapURL = "https://maps.geoapify.com/v1/staticmap?style=osm-bright-smooth&width=" + width + "&height=" + height + "&center=lonlat:" + lon + "," + lat +
          "&zoom=" + zoom + geoAPI;
        // now call the other functions
        drawConfirmationModal( jConfirmationModal, jConfirmationName, location, mapURL, location );
      })
      .catch(function (err) {});
  }

  function getWeather(lat, lon) {
    // This function gets the data on weather
    // parameters "lat" and "lon" are latitude and longitude
    // first get the weather
    let weatherCall =
      "https://api.openweathermap.org/data/3.0/onecall?&lat=" + lat + "&lon=" + lon + "&units=imperial&exclude=minutely" + weatherAPI;

    fetch(weatherCall)
      .then(function (response) {
        return response.json();
      })
      .then(function (weatherData) {
        // construct the weather portion of the object
        let dataCollect = {
          weather: weatherData,
          solunar: [],
        };

        // now send this along to collect the solunar data:
        let offset = weatherData.timezone_offset / 3600;
        getSolunar( lat, lon, offset, dataCollect );
      })
      .catch(function (err) {});
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
    // create call strings for each of the seven days we need
    for (let i = 0; i < 7; i++) {
      dDate = dToday.add(i, "day");
      thisCall = "https://api.solunar.org/solunar/" + lat + "," + lon + "," + dDate.format("YYYYMMDD") + "," + offset;
      solunarCalls.push(thisCall);
    }

    // make all seven calls, and process after they've all come back
    Promise.all(solunarCalls.map((call) => fetch(call)))
      .then((responses) =>
        Promise.all(responses.map((response) => response.json()))
      )
      .then((datas) => {
        results.solunar = datas;
        // we've got everything now, draw the forecast
        drawForecast( jForecastContainer, results );
      });
  }


  // UTILITIES

  function clearTheDecks() {
    // This function clears out all dynamic content
    jAboutLocContainer.empty();
    jForecastContainer.empty();
  }
});



/* ---- DRAW PAGE FUNCTIONS ---- */

function drawSavedSearches(jContainer) {
  // This function draws the saved searches on the page
  // parameter "jContainer" is the saved searches container

  jContainer.empty();
  // get localStorage…
  let x = localStorage.getItem("SolunarSearch");
  // If it doesn’t exist then return…
  let y;
  if (!x) return;
  else y = JSON.parse(x);

  // create and append the buttons
  let jBtn;
  for (let i = 0; i < y.length; i++) {
    jBtn = $("<button>");
    jBtn.addClass("button button--small");
    jBtn.text(y[i].name);
    jBtn.attr("data-latlon", y[i].latlon);
    jBtn.attr("data-map", y[i].map);
    if (y[i].country) {
      jBtn.attr("data-country", y[i].country);
    }
    if (y[i].county) {
      jBtn.attr("data-county", y[i].county);
    }
    if (y[i].state) {
      jBtn.attr("data-state", y[i].state);
    }
    jContainer.append(jBtn);
  }
}

function drawConfirmationModal(jContainer, jInput, confirmationInfo, map) {
  // This function draws the confirmation modal
  // parameter "jContainer" is the modal
  // parameter "confirmationInfo" is the data to use
  // parameter "map" is the url for the map tile
  // parameters "locationInfo" is the return from the latlon query

  // create some DOM nodes, add some attributes
  let jTitle = $("#confirmation-modal .mg-container h3");
  jTitle.text("");
  let jBody = $("#confirmation-modal .modal-content");
  let jList = $("<ul>");
  let jCounty = $("<li>");
  jCounty.attr("id", "county");
  let jState = $("<li>");
  jState.attr("id", "state");
  let jCountry = $("<li>");
  jCountry.attr("id", "country");
  let jSuggestion = $("<li>");
  jSuggestion.attr("id","suggestion");
  let jMap = $("<img>");
  let jMapContainer = $("<div>");
  jMapContainer.attr("id", "modalMap");
  jMapContainer.addClass("clearfix");
  jMapContainer.append(jMap);
  
  // clear out the info from last time
  jBody.empty();

  // put in the title and the empty image so layout is right
  jBody.append(jTitle);
  jBody.append(jMapContainer);
  // write the city name in the title and the input field
  jTitle.text(confirmationInfo.city);
  jInput.val(confirmationInfo.city);
  // populate the list with stuff
  jCounty.text(confirmationInfo.county);
  jState.text(confirmationInfo.state);
  jCountry.text(confirmationInfo.country);
  if (confirmationInfo.county) jList.append(jCounty);
  if (confirmationInfo.state) jList.append(jState);
  if (confirmationInfo.country) jList.append(jCountry);
  jSuggestion.text("Not the right result? Try a more detailed search including any combination of city, county, state or zip code.");
  jList.append(jSuggestion);
  // set up the map
  jMap.attr("src", map);
  // append the list
  jBody.append(jList);
  // encode the yes-button with the data to pass on
  jContainer.find("button").attr("data-latlon", confirmationInfo.lat + "," + confirmationInfo.lon);
  jContainer.find("button").attr("data-place", jTitle.text());
  // show the modal
  jContainer.addClass("mg-show");
}

function drawMainDisplay(jContainer, mainDisplayInfo, map) {
  // This function draws the main info panel
  // parameter "jContainer" is the container to fill
  // parameter "mainDisplayInfo" is the data to use
  // parameter "map" is the URL for the map tile

  // empty it
  jContainer.empty();
  // get the various elements created and in place first
  let jTitle = $("<h2>");
  jTitle.text(mainDisplayInfo.name);
  let jMap = $("<img>");
  let jList = $("<ul>");
  let jDiv = $("<div>");
  jDiv.addClass("clearfix");
  jContainer.append(jTitle);
  jDiv.append(jMap);
  jContainer.append(jDiv);
  jContainer.append(jList);
  // source the map
  jMap.attr("src", map);
  // append the info we have to the list
  if (mainDisplayInfo.county) {
    let jLi1 = $("<li>");
    jLi1.text(mainDisplayInfo.county);
    jList.append(jLi1);
  }
  if (mainDisplayInfo.state) {
    let jLi1 = $("<li>");
    jLi1.text(mainDisplayInfo.state);
    jList.append(jLi1);
  }
  if (mainDisplayInfo.country) {
    let jLi1 = $("<li>");
    jLi1.text(mainDisplayInfo.country);
    jList.append(jLi1);
  }
}

function drawForecast(jContainer, forecastInfo) {
  // This function draws the forecast panel
  // parameter "jContainer" is the container to fill
  // parameter "forecastInfo" is the data needed to construct

  // empty the forecast
  jContainer.empty();

  // a list of values to search off of the solunar info
  let checkthese = [
    "sunRise",
    "sunSet",
    "moonRise",
    "moonSet",
    "major1Start",
    "major2Start",
    "minor1Start",
    "minor2Start",
  ];

  // a list of conversions of the values to text labels
  let convertthese = {
    sunRise: "Sunrise: ",
    sunSet: "Sunset: ",
    moonRise: "Moonrise: ",
    moonSet: "Moonset: ",
    major1Start: "Major: ",
    major2Start: "Major: ",
    minor1Start: "Minor: ",
    minor2Start: "Minor: ",
  };

  // a list of which searched values also have ending values
  let endings = {
    major1Start: "major1Stop",
    major2Start: "major2Stop",
    minor1Start: "minor1Stop",
    minor2Start: "minor2Stop",
  };

  // iterate over seven days, build cards, and insert
  let jCard, jTitle;

  for (let i = 0; i < forecastInfo.solunar.length; i++) {
    // calculate the day
    const date = forecastInfo["weather"]["daily"][i]["dt"];
    let dToday = dayjs.unix(date);
    // create the card
    jCard = $("<div>");
    jCard.addClass("forecast-card column col-3 col-xl-4 col-md-6 col-xs-12");
    jTitle = $("<h4>");
    jList = $("<ul>");
    // create the card elements
    let jP1 = $("<li>");
    let jP2 = $("<li>");
    let jP3 = $("<li>");
    let jP4 = $("<h5>");
    //add textcontent to elements created
    jTitle.text(dToday.format("MMM D"));
    if (i == 0) jTitle.text("Today");
    else if (i == 1) jTitle.text("Tomorrow");
    // create the icons
    jImageDiv = $("<div>");
    // create the icon for the weather
    let iconUrl = `https://openweathermap.org/img/wn/${forecastInfo["weather"]["daily"][i]["weather"][0]["icon"]}.png`;
    let image = $("<img>");
    image.attr("src", iconUrl);
    let moonImage = $("<img>");
    // create the icon for the moon phase
    let phase = forecastInfo.weather.daily[i].moon_phase;
    let moonImgSrc;
    if (phase == 0 || phase == 1) moonImgSrc = "./assets/images/new.png";
    else if (phase == 0.5) moonImgSrc = "./assets/images/full.png";
    else if (phase == 0.25) moonImgSrc = "./assets/images/first-quarter.png";
    else if (phase == 0.75) moonImgSrc = "./assets/images/last-quarter.png";
    else if (phase > 0 && phase < 0.25)
      moonImgSrc = "./assets/images/waxing-crescent.png";
    else if (phase > 0.25 && phase < 0.5)
      moonImgSrc = "./assets/images/waxing-gibbous.png";
    else if (phase > 0.5 && phase < 0.75)
      moonImgSrc = "./assets/images/waning-gibbous.png";
    else moonImgSrc = "./assets/images/waning-crescent.png";
    moonImage.attr("src", moonImgSrc);
    moonImage.addClass("moon-icon");
    // append icons to the icon div and the div to the card
    jImageDiv.append(image);
    jImageDiv.append(moonImage);
    jImageDiv.addClass("icons");
    // fill out the top list of weather conditions
    js1 = $("<strong>");
    jsp1 = $("<span>");
    js1.text("Temp: ");
    jsp1.text( Math.round(forecastInfo.weather.daily[i].temp.min) + " to " + Math.round(forecastInfo.weather.daily[i].temp.max) + "° F" );
    jP1.append(js1);
    jP1.append(jsp1);
    js2 = $("<strong>");
    jsp2 = $("<span>");
    js2.text("Wind: ");
    jsp2.text( Math.round(forecastInfo.weather.daily[i].wind_speed) + " MPH" );
    jP2.append(js2);
    jP2.append(jsp2);
    js3 = $("<strong>");
    jsp3 = $("<span>");
    js3.text("Pressure: ");
    jsp3.text( Math.round(forecastInfo.weather.daily[i].pressure / 33.86387) + " inHg" );
    jP3.append(js3);
    jP3.append(jsp3);
    jP4.text("Solunar Periods");

    // gather all the timestamps for the solunar periods
    let times = [];
    for (let ii = 0; ii < checkthese.length; ii++) {
      if (forecastInfo.solunar[i][checkthese[ii]]) {
        // does this exist on this solunar object?
        let obj = {
          name: checkthese[ii],
          time: forecastInfo.solunar[i][checkthese[ii]],
        };
        if (endings[checkthese[ii]]) {
          // is this value part of a range?
          obj.endtime = forecastInfo.solunar[i][endings[checkthese[ii]]];
        }
        times.push(obj);
      }
    }

    times.sort(function (a, b) {
      // sort the array by time
      let aTime = breakupTime(a.time);
      let bTime = breakupTime(b.time);
      if (aTime[0] != bTime[0]) return aTime[0] - bTime[0];
      else return aTime[1] - bTime[1];
    });

    

    //append
    jCard.append(jTitle);
    jCard.append(jImageDiv);
    jList.append(jP1);
    jList.append(jP2);
    jList.append(jP3);
    jCard.append(jList);
    jCard.append(jP4);
    let jP, range, jst, jsp;
    for (let ii = 0; ii < times.length; ii++) {
      jP = $("<p>");
      jst = $("<strong>");
      jsp = $("<span>");
      jst.text(convertthese[times[ii].name]);

      range = convertTime(times[ii].time);
      if (endings[times[ii].name]) {
        range += " to " + convertTime(times[ii].endtime);
      }
      jsp.text(range);
      jP.append(jst);
      jP.append(jsp);
      if (times[ii].name.toLowerCase().includes("moon")) jP.addClass("moon");
      else if (times[ii].name.toLowerCase().includes("sun")) jP.addClass("sun");
      jCard.append(jP);
    }
    jContainer.append(jCard);
  }

  // UTILITY FUNCTIONS

  function breakupTime(str) {
    // This function parses a time string into hours and minutes
    return [parseInt(str.split(":")[0]), parseInt(str.split(":")[1])];
  }
  
  function convertTime(str) {
    // This function accepts a time string and returns it as "h:mm A"
    let pieces = str.split(":");
    pieces[0] = parseInt(pieces[0]).toString();
    let formatedTime = "";
    if (pieces[0] == 0) {
      formatedTime += "12";
    } else if (pieces[0] <= 12) {
      formatedTime += pieces[0];
    } else {
      formatedTime += pieces[0] - 12;
    }
    formatedTime += ":" + pieces[1] + " ";
    formatedTime += pieces[0] > 11 ? "pm" : "am";
    return formatedTime;
  }
}



/* ---- OTHER FUNCTIONS ---- */

// These functions are global

function saveSearch(jContainer, latlon, name, info, map) {
  // This function saves the user's confirmed search
  // parameter "jContainer" is the Saved Searches container
  // parameters "latlon" is the coordinate string
  // parameter "name" is the user's label for the button

  if (!validateSearch(name)) {
    // has this already been saved?
    return;
  }
  // collect the data to save
  let search = {
    name: name,
    latlon: latlon,
    map: map,
  };
  if (info.country) {
    search.country = info.country;
  }
  if (info.county) {
    search.county = info.county;
  }
  if (info.state) {
    search.state = info.state;
  }
  // extract localStorage, add the new data, and put back
  let x = localStorage.getItem("SolunarSearch");
  let y;
  if (!x) y = [];
  else y = JSON.parse(x);
  y.push(search);
  localStorage.setItem("SolunarSearch", JSON.stringify(y));
  // re-draw the saved searches area
  drawSavedSearches(jContainer);
}

function clearSearch(jContainer) {
  // This function clears the saved searches

  localStorage.setItem("SolunarSearch", "");
  drawSavedSearches(jContainer);
}

function validateSearch(name) {
  // This function checks to see if a search has already been saved

  let x = localStorage.getItem("SolunarSearch");
  if (!x) {
    return true;
  }
  let y = JSON.parse(x);
  for (let i = 0; i < y.length; i++) {
    if (name.toLowerCase() == y[i].name.toLowerCase()) {
      return false;
    }
  }
  return true;
}
