var dealerLocator = {
	map: undefined,
	mapElement: document.getElementById('map'),
	dealerLocations: document.getElementById('map').getAttribute('data-json-url'),
	markers: [],
	clusterMarkers: true,
	infoWindows: [],
	linkClickToMarkerClick: function linkClickToMarkerClick (link) {
		"use strict";
		
		var dealerLocator = this;
		
		link.addEventListener('click', function (e) {
			e.preventDefault();
			var wantedMarkerId = this.getAttribute("data-dealer-id");

			//Go through all saved markers and click on the right one
			for (var i = 0; i < dealerLocator.markers.length; i++) {
				var marker = dealerLocator.markers[i];
				marker.setMap(dealerLocator.map); //Put the marker to the map again, cannot click a marker that is grouped/clustered

				if (dealerLocator.markers[i].id === wantedMarkerId) {
					// The marker is found, scroll to top, zoom in on map and click the marker
					window.scrollTo(0, 0);
					dealerLocator.map.setZoom(13);
					google.maps.event.trigger(marker, "click");
				}
			}
		});
	},
	createMarkerContent: function (location) {
		"use strict";
		
		var newLinkText = "<strong class='maps-link-title'>" + location.title + "</strong><br>" + location.street + " " + location.postal_code + " " + location.city;
		newLinkText += "<br><strong>Contact Person:</strong> " + location.contact_person + "<br><strong>Country:</strong> " + location.country + "<br><strong>Telephone:</strong> " + location.telephone;

		if (location.url !== "") {
			newLinkText += "<br><a href='" + location.url + "'>Visit site</a>";
		}

		return newLinkText;
	},
	markerClickHandeler: function markerClickHandeler (marker, location) {
		"use strict";
		
		var dealerLocator = this;
		
		google.maps.event.addListener(marker, "click", function() {
			// Define infoWindow
			var infoWindow = new google.maps.InfoWindow({
				content: dealerLocator.createMarkerContent(location)
			});

			// Close all infoWindows
			for (var i = 0; i < dealerLocator.infoWindows.length; i++) {
				dealerLocator.infoWindows[i].close();
			}

			// Save infoWindow to be able to close it
			dealerLocator.infoWindows.push(infoWindow);

			// Open infoWIndow
			infoWindow.open(dealerLocator.map, marker);
		});
	},
	loadJson: function loadJson () {
		"use strict";
		
		var request = new XMLHttpRequest(),
			dealerLocator = this;
		
		request.open('GET', dealerLocator.dealerLocations, true);

		request.onload = function() {
			if (this.status >= 200 && this.status < 400) {
				var data = JSON.parse(this.response);
						
				for (var locationKey in data) {
					var location = data[locationKey],
						position = new google.maps.LatLng(location.latitude, location.longitude);

					// Define a marker per json object
					var marker = new google.maps.Marker({
						id: location.id,
						position: position,
						map: dealerLocator.map,
						title: location.title
					});

					// On marker click, show window
					dealerLocator.markerClickHandeler(marker, location);

					// Save marker
					dealerLocator.markers.push(marker);

					// Plot marker on map
					marker.setMap(dealerLocator.map);
				}
				
				if (dealerLocator.clusterMarkers === true) {
					// Add grouping / clustering of markers with markercluster.js
					var clusterOptions = { 'gridSize': 10 };
					new MarkerClusterer(dealerLocator.map, dealerLocator.markers, clusterOptions);
				}
			}
			else {
				alert('Could not download JSON!');
				return false;
			}
		};
					
		request.onerror = function() {
			alert('Could not download JSON!');
			return false;
		};

		request.send();
	},
	init: function init () {
		"use strict";
		
		var dealerLocator = this;
		
		// Do some work when Google Maps is loaded
		google.maps.event.addDomListener(window, 'load', function () {
			var	linksToMarkers = document.querySelectorAll('.google-maps-link-to-marker');
			
			for (var i = 0; i < linksToMarkers.length; i++) {
				dealerLocator.linkClickToMarkerClick(linksToMarkers[i]);
			}
			
			dealerLocator.loadJson();

			var mapOptions = {
				zoom: 2,
				center: new google.maps.LatLng(41.87194, 12.56738),
				scaleControl: true,
				overviewMapControl: true,
				overviewMapControlOptions:{opened:true},
				mapTypeId: google.maps.MapTypeId.ROADMAP
			};

			dealerLocator.map = new google.maps.Map(dealerLocator.mapElement, mapOptions);
		});
	}
}.init();