(() => {
    const map = L.map('theMap').setView([51.505, -0.09], 2);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    const apiUrl = 'https://prog2700.onrender.com/opensky';
    const planeIcon = L.icon({
        iconUrl: 'plane.png',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16]
    });

    let markers = [];

    function convertFlightsToGeoJSON(flights) {
        let features = flights.map(flight => {
            return {
                "type": "Feature",
                "properties": {
                    "callSign": flight[1],
                    "fromCountry": flight[2],
                    "rotationAngle": flight[10] 
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [flight[5], flight[6]]  // Longitude, Latitude
                }
            };
        });
    
        return {
            "type": "FeatureCollection",
            "features": features
        };
    }
    
    function plotFlights(geoJsonFlights) {
        // Clear existing markers
        markers.forEach(marker => map.removeLayer(marker));
        markers = [];
    
        L.geoJSON(geoJsonFlights, {
            pointToLayer: function(feature, latlng) {
                var marker = L.marker(latlng, {
                    icon: planeIcon,
                    rotationAngle: feature.properties.rotationAngle
                });
                markers.push(marker);  // Add the new marker to the markers array
                return marker;
            },
            onEachFeature: function(feature, layer) {
                layer.bindPopup('Flight: ' + feature.properties.callSign + '<br>From: ' + feature.properties.fromCountry);
            }
        }).addTo(map);
    }
    
    
    function fetchFlightData() {
        console.log('Fetching flight data...');

        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                const filteredFlights = data.states.filter(flight => flight[2] === "Canada");
                const geoJsonFlights = convertFlightsToGeoJSON(filteredFlights);
                plotFlights(geoJsonFlights);
            })
            .catch(error => {
                console.error('There has been a problem with your fetch operation:', error);
            });
    }


    fetchFlightData();
    setInterval(fetchFlightData, 10000); 

})();
