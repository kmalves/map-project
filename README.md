Vacation Map is a one page application displaying a map of six locations from our recent camping trip to Upsate New York. It was built using HTML, CSS, Bootstrap, JS, Knockout, Googple Maps and NYT API. After clicking on each location an image will appear in the info window and the address is displayed in the right top corner. Locations can be filtered by categories.

TO RUN THE CODE:

Save vacation-map folder on your PC or clone the repository:

(to be uploaded to Git after review)

Get your Google Maps API key:
https://developers.google.com/maps/documentation/javascript/get-api-key

Insert it into the main.html file line 52:
src="http://maps.googleapis.com/maps/api/js?libraries=places&key=[YOUR_API_KEY]">

Get your NYT API key:
https://developer.nytimes.com/

Insert the key into line 199 of app.js file

Open main.html in a browser

Locations data is contained in locations array of app.js line 15. Location info can be modified and more locations added. Corresponding imagery is contained in images folder.

!! Numbers 0 through (amount of locations minus 1) are reserved as id names for the location list/navigation in main.html and based on the index of these locations in the list. !!
