// Globals
var map;
var bounds;
var marker;
var infoWindow;
var nytUrl;
var $nytHeaderElem;
var $nytElem;
var $welcome;
var zoom;
var latLng;
var center;

// Locations array
var locations = [
    {
        name: 'Medina KOA Campsite',
        latitude: 43.2805,
        longitude: -78.4557,
        imgSrc: '//images/campsite.JPG',
        address: '2711 County Line Road, Medina, NY',
        category: 'recreational',
    },
    {
        name: "Fisher's Farm Market",
        latitude: 43.2671,
        longitude: -78.3898,
        imgSrc: 'images/farm.jpg',
        address: '11352 Ridge Road, Medina, NY',
        category: 'recreational',
    },
    {
        name: "Niagara Falls State Park",
        latitude: 43.0870,
        longitude: -79.0679,
        imgSrc: 'images/niagara.jpg',
        address: '332 Prospect Street, Niagara Falls, NY',
        category: 'sightseeing',

    },
    {
        name: 'Lockport Caves and Underground Boat Ride',
        latitude: 43.1719,
        longitude: -78.6926,
        imgSrc: 'images/lockport.jpg',
        address: '5 Gooding St, Lockport, NY',
        category: 'educational'
    },
    {
        name: 'Hamlin Beach Lake Ontario',
        latitude: 43.3597,
        longitude: -77.9488,
        imgSrc: 'images/ontario.jpg ',
        address: '1 Hamlin Beach State Park, Hamlin, NY',
        category: 'sightseeing'
    },
    {
        name: "Devil's Hole State Park",
        latitude: 43.1344,
        longitude: -79.0463,
        imgSrc: 'images/hole.jpg',
        address: 'Robert Moses Parkway, Niagara Falls, NY',
        category: 'sightseeing'
    }
];

// Location Model
var Location = function(data){
    this.name = ko.observable(data.name);
    this.simpleName = data.name;
    this.address = ko.observable(data.address);
    this.imgSrc = ko.observable(data.imgSrc);
    this.latitude = data.latitude;
    this.longitude = data.longitude;
    this.category = data.category;
    this.visibility = ko.observable(true);
    this.marker = new google.maps.Marker({
        map: map,
        position: { lat: this.latitude, lng: this.longitude},
        animation: google.maps.Animation.DROP,
        title: data.name
        });
    this.infoWindow = new google.maps.InfoWindow({
        content: '<img border="0" align="center" width="250 " src="' + data.imgSrc + '">'
        });
};

var ViewModel = function() {
    // Map area
    zoom = 10;
    latLng = {lat: 43.22028, lng: -78.38694};
    map = new google.maps.Map(document.getElementById('map'), {
         center: latLng,
         zoom: zoom
       });
    bounds = new google.maps.LatLngBounds();
    // Make the map responsive 
    function calculateCenter() {
        center = map.getCenter();
    }
    google.maps.event.addDomListener(map, 'idle', function() {
        calculateCenter();
    });
    google.maps.event.addDomListener(window, 'resize', function() {
        map.setCenter(center);
    });
    
    var self = this;

    this.categories = ko.observableArray([{name:'sightseeing'},
                                          {name:'educational'},
                                          {name:'recreational'},
                                          {name: 'all'}]);
    this.selectedChoice = ko.observable();

    this.locationList = ko.observableArray([]);

    locations.forEach(function(location){
        self.locationList.push(new Location(location));
    });
    // Hide/show locations based on category slected
    this.setCategory = function(){
        $welcome = $('#welcome');
        $welcome.empty();
        $info = $('#info');
        $info.empty();
        $nytHeaderElem = $('#nytimes-header');
        $nytElem = $('#nytimes-articles');
        $nytElem.empty();
        $nytHeaderElem.text('Select locations from the list above to view related NYT articles');
        self.locationList().forEach(function(location){
            location.infoWindow.close();    
            if(self.selectedChoice() == 'all') {
                location.visibility(true);
                location.marker.setMap(map);
            } else if (self.selectedChoice() !== location.category && self.selectedChoice() !== 'all'){
                location.visibility(false);
                location.marker.setMap(null);
            } else {
                location.visibility(true);
                location.marker.setMap(map);
            }
            // Extend the bounds for visible markers
            bounds.extend(location.marker.position);
            // Automatically center the map fitting all visible markers on the screen
            map.fitBounds(bounds);
        });
        // Make the map responsive after one of the categories has been selected
        function calculateCenter() {
            center = map.getCenter();
        }
        google.maps.event.addDomListener(map, 'idle', function() {
            calculateCenter();
        });
        google.maps.event.addDomListener(window, 'resize', function() {
            map.setCenter(center);
        });
    };
    
    this.locationList().forEach(function(item){
        // Extend the bounds for each marker
        bounds.extend(item.marker.position);
        // Automatically center the map fitting all markers on the screen
        map.fitBounds(bounds);
        // Zoom the map after the marker is clicked, after 3 sec return to original
        item.marker.addListener('click', function() {
                map.setZoom(12);
                map.setCenter(item.marker.getPosition());
                window.setTimeout(function() {
                    map.setZoom(zoom);
                    map.setCenter(latLng);
                    map.fitBounds(bounds);
                }, 3000);
        });
    });

    this.currentLocation = ko.observable('');

    this.setLocation = function(location){
        $welcome = $('#welcome');
        $welcome.empty();
        self.locationList().forEach(function(item){
            // Close any previously opened windows
            item.infoWindow.close();
            // Change the color of previously active link back to default
            document.getElementById(self.locationList().indexOf(item)).classList.remove('nav_active');
        });
        // Change color of an active link
        document.getElementById(self.locationList().indexOf(location)).className = "nav_active";
        this.infoWindow.open(map, this.marker);
        self.currentLocation(location);
        $nytHeaderElem = $('#nytimes-header');
        $nytElem = $('#nytimes-articles');
        // Clear the DOM for the new info
        $nytElem.empty();
        // NYT API
        nytUrl = "https://api.nytimes.com/svc/search/v2/articlesearch.json";
        nytUrl += '?' + $.param({
            'api-key': "debab6e1a8b4450f89435297387295e7",
            'q': this.name, // Search based on the name for the current location
            'sort': "newest"
        });
   
        $.getJSON(nytUrl, function(nytData) {
            var articles = nytData.response.docs;
            // Check if response contains articles about requested location
            if (articles.length === 0){
                $nytHeaderElem.text('No NYT articles found');
            } else { 
                for (var i = 0; i < 5; i++) {
                    var article = articles[i];
                    // Append the articles to the cleared DOM
                    $nytElem.append('<li class="article">' + '<a href="' + article.web_url + '">' + article.headline.main +
                             '</a>' + '<p>' + article.snippet + '</p>' + '</li>');
                    $nytHeaderElem.text('Related NYT articles:');
                }
            }
        }).fail(function(e) {
            $nytHeaderElem.text('NYT articles could not be loaded');
        });
        };    
};

function initMap() {
    ko.applyBindings(new ViewModel());
}

function mapError() {
    alert("Error loading GoogleMaps");
}
