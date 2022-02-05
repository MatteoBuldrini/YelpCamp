// Script used by Mapbox to display the map
mapboxgl.accessToken = mapToken;

const map = new mapboxgl.Map({
    container: 'map', // Container ID
    style: 'mapbox://styles/mapbox/outdoors-v10', // Style URL
    center: campground.geometry.coordinates, // Starting position [lng, lat]
    zoom: 10 // Starting zoom
});

// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl());

//Add a marker to the map at the coordinates of each campground
new mapboxgl.Marker()
    .setLngLat(campground.geometry.coordinates)
    .setPopup( //Add popup when clicking on the marker
        new mapboxgl.Popup({ offset: 25 })
            .setHTML(
                `<h3>${campground.title}</h3><p>${campground.location}</p>`
            )
    )
    .addTo(map)