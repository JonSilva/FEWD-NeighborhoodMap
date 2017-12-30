var mapDiv = document.getElementById("mapDiv");
var RESET_LOCATION = {
    lat: 38.705051,
    lng: -90.470510
};
var markersArray = [];
var fourSquareConfig = {
    client_id: 'TRKHFAI4YLOV2KNSJXGIPIXUHBBPQ1SKKSKRBNCIIJWUOAXD',
    client_secret: 'QYKDZNR5GEGICWMB50WUX1OZEOOVEBUODQVNOVBSZHW2HJZR',
    apiUrl: 'https://api.foursquare.com/',
    version: '20171201'
};
var infoWindowTemplate = "<div id=venueid>Name = venuename<br>Address = venueaddress<br></div>";

var locs = [{
        name: "Creve Coeur County Park",
        coords: {
            lat: 38.7262223,
            lng: -90.4876522
        },
        note: "The Best Park",
        venue: "4af7af1cf964a520270a22e3",
        marker: 0
    },
    {
        name: "Faust County Park",
        coords: {
            lat: 38.6656603,
            lng: -90.5453863
        },
        note: "Home of the Butterfly House",
        venue: "4b899acef964a520854532e3",
        marker: 1
    },
    {
        name: "Queeny Park",
        coords: {
            lat: 38.6126263,
            lng: -90.4925411
        },
        note: "Hiking and Biking!",
        venue: "4aec5ac9f964a52049c621e3",
        marker: 2
    },
    {
        name: "Vago Park",
        coords: {
            lat: 38.7187266,
            lng: -90.4203034
        },
        note: "Great for a walk about",
        venue: "4bb68d52f562ef3bbd5e3097",
        marker: 3
    },
    {
        name: "Frontier Park",
        coords: {
            lat: 38.7747162,
            lng: -90.4844754
        },
        note: "Oktoberfest, Irish Fest - great food and beer",
        venue: "4ad9fc5ff964a520c91c21e3",
        marker: 4
    }
];

function initialize() {
    var mapOptions = {
        zoom: 11,
        center: RESET_LOCATION,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(mapDiv, mapOptions);
    ko.applyBindings(new viewModel());
}

var viewModel = function() {
    var self = this;
    self.locs = ko.observableArray([]);
    self.query = ko.observable('');
    self.googlemap = map;

    self.activateMarker = function(loc) {
        $('#listModal').modal('toggle');
        google.maps.event.trigger(markersArray[loc.marker], 'click');
    };

    // load initial list of locs
    for (var loc in locs) {
        self.locs.push(locs[loc]);
        addMarker(loc);
    }

    function addMarker(loc) {
        var marker = new google.maps.Marker({
            position: locs[loc].coords,
            map: map,
            label: {
                text: locs[loc].name,
                color: "black"
            },
            animation: google.maps.Animation.DROP
        });

        markersArray.push(marker);
        google.maps.event.addListener(marker, 'click', function() {
            var currentMarker = this;
            if (marker.info) {
                marker.info.close();
            }
            marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function() {
                marker.setAnimation(null);
            }, 750);

            $.ajax({
                type: 'GET',
                url: fourSquareConfig.apiUrl + 'v2/venues/' + locs[loc].venue + '?client_id=' + fourSquareConfig.client_id + '&client_secret=' + fourSquareConfig.client_secret + '&v=' + fourSquareConfig.version,
                dataType: 'json',
                success: function(data) {
                    var infoWindow = new google.maps.InfoWindow({});
                    var myVenue = data.response.venue;
                    tempOutput = infoWindowTemplate;
                    infoWindow.setContent(tempOutput.replace("venueid", myVenue.id).replace("venuename", myVenue.name).replace("venueaddress", myVenue.location.formattedAddress));
                    infoWindow.open(map, currentMarker);
                },
                error: function(errMsg) {
                    var infoWindow = new google.maps.InfoWindow({});
                    infoWindow.setContent("A critical error has occured");
                    infoWindow.open(map, currentMarker);
                }
            });

        });
    }

    function removeMarker() {
        if (markersArray) {
            for (i = 0; i < markersArray.length; i++) {
                markersArray[i].setMap(null);
            }
            markersArray.length = 0;
        }
    }

    self.search = function(value) {
        removeMarker();
        self.locs.removeAll();
        for (var loc in locs) {
            if (locs[loc].name.toLowerCase().indexOf(value.toLowerCase()) >= 0) {
                self.locs.push(locs[loc]);
                addMarker(loc);
            }
        }
    };

    self.query.subscribe(self.search);
};

function gmapsError() {
    document.getElementById("mapDiv").innerHTML = "Cannot connect to Google Maps, please try again later";
    alert("Cannot connect to Google Maps, please try again later");
}