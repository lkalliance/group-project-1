# group-project-1
Moonfish group project


## UPDATE:

OK, guys, here is how the code's workflow goes. Note that the complete "Search-to-result" flow is: get Location Data -> get Weather Report -> get Solunar Data

**Initialize page**
--Add listeners
--Draw the saved searches
**When the user does a search**
--Get location data
--Show confirmation modal. If the user says "No this isn't it," then end there. Otherwise...
--Get weather data
--Get solunar data
--Do three things simultaneously: draw the main info panel, draw the forecast panel, save the search

If the user clicks on a saved search, it's the same thing, only we start at "Get Weather Data," because the saved search will have all the info we need from the first two items.

### Code flow
Each of those items above has its own function. So if you're going to work on "Save Search"...there is a function for saveSearch(). Each of those functions has everything it needs passed into it. If any of them are "draw" functions (drawSavedSearches, drawForecast, etc) I've passed in the container that you're drawing into as a parameter "jContainer". Right now, each of those functions console.logs all the info that's passed in. You can look at what you've got and go from there!

This will only be in place after the existing PR and one more PR is approved. Let's get going on that!




## PREVIOUS:

(1) API's: Clean up the logic, be able to write to a container, output: LEE
7 days:
--Major Time
--Minor Time
--Daily forecast for each of seven days

(2) Search SAFIA
--Logic to determine if this search has already been saved.
--Logic to pass those search results to (1)
--Decisions about what happens with the search field. Placeholder text? What happens to the search field after I click search?

(3) About us modal: SAFIA
--Describe what Solunar is
--Describe us and why we're doing this project

(4) Seach confirmation modal MICHAEL
--API writes some details to this, we ask user if this is the right place?
--Click yes or no.
--What happens if they click yes? If they click no?
--What happens if the user clicks the close box?

(5) Main display area GABRIELLE
--Show map/Full info about location
--Show seven cards for the next seven days, and info

(6) Design Local Storage LEE/SAFIA




Syntax of variables

jOneTwo (jQuery)
dOneTwo (day.js)
normalVariable (nothing special)

Syntax of HTML id's and classes

thisIsMyId
class


