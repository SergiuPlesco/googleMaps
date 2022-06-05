const input = document.getElementById("autocomplete");
const predictionsList = document.querySelector(".predictions-list");
const predictionItem = document.querySelectorAll(".prediction-item");
let predictionsArray = [];
let coords = {};

function initialize() {
	const map = new google.maps.Map(document.getElementById("map"));
	const autocomplete = new google.maps.places.AutocompleteService();
	const placeService = new google.maps.places.PlacesService(map);
	const streetService = new google.maps.StreetViewService();
	const OUTDOOR = google.maps.StreetViewSource.OUTDOOR;
	const panorama = new google.maps.StreetViewPanorama(document.getElementById("pano"));
	const directionService = new google.maps.DirectionsService();
	const geocoder = new google.maps.Geocoder();

	const defaultCoords = { lat: 43.878453, lng: -78.9372657 };
	map.setCenter(defaultCoords);
	map.setZoom(14);

	const marker = new google.maps.Marker({
		position: defaultCoords,
		map: map,
	});
	marker.setMap(map);

	input.addEventListener("input", (e) => {
		autocomplete.getPlacePredictions(
			{
				input: e.target.value,
				types: ["address"],
				componentRestrictions: { country: "ca" },
			},
			(predictions, status) => {
				predictionsList.innerHTML = "";
				predictions.forEach((element) => {
					const item = document.createElement("li");
					item.classList.add("prediction-item");
					item.innerText = element.description;
					predictionsList.appendChild(item);
					item.addEventListener("click", (e) => {
						console.log(element);
						geocoder.geocode(
							{
								address: element.description,
							},
							(geoResult, status) => {
								console.log("geoResult", geoResult);
								const origin = { placeId: element.place_id };
								directionService.route(
									{
										origin: origin,
										destination: origin,
										travelMode: google.maps.DirectionsTravelMode.DRIVING,
									},
									(directionsResult, status) => {
										streetService.getPanorama(
											{
												location: directionsResult.routes[0].legs[0].start_location,
												source: OUTDOOR,
												radius: 200,
											},
											(panoData, status) => {
												const heading = google.maps.geometry.spherical.computeHeading(
													new google.maps.LatLng(panoData.location.latLng),
													new google.maps.LatLng(geoResult[0].geometry.location)
												);
												// panorama.setPosition(panoData.location.latLng);

												panorama.setPano(panoData.location.pano);
												panorama.setPov({
													heading: heading,
													pitch: 5,
												});
												panorama.setZoom(0);
											}
										);
									}
								);

								// streetService.getPanorama(
								// 	{
								// 		location: geoResult[0].geometry.location,
								// 		source: OUTDOOR,
								// 		radius: 50,
								// 	},
								// 	(panoData, status) => {
								// 		const heading = google.maps.geometry.spherical.computeHeading(
								// 			new google.maps.LatLng(panoData.location.latLng),
								// 			new google.maps.LatLng(geoResult[0].geometry.location)
								// 		);
								// 		// panorama.setPosition(panoData.location.latLng);
								// 		panorama.setPano(panoData.location.pano);
								// 		panorama.setPov({
								// 			heading: heading,
								// 			pitch: 5,
								// 		});
								// 		panorama.setZoom(0);
								// 	}
								// );
							}
						);
						placeService.getDetails(
							{
								placeId: element.place_id,
								fields: ["name", "geometry", "place_id"],
							},
							(place, status) => {
								map.setCenter(new google.maps.LatLng(place.geometry.location));
								marker.setPosition(new google.maps.LatLng(place.geometry.location));
								map.setStreetView(panorama);
								// panorama.setVisible(true);
							}
						);
					});
				});
			}
		);
	});
	// panorama.addListener("pano_changed", () => {
	// 	console.log(panorama.getPano());
	// });
	// panorama.addListener("position_changed", () => {
	// 	console.log(panorama.getPosition());
	// });
	// panorama.addListener("pov_changed", () => {
	// 	console.log(panorama.getPov());
	// });
	// panorama.addListener("links_changed", () => {
	// 	console.log(panorama.getLinks());
	// });
	map.setStreetView(panorama);
}

window.initialize = initialize;
