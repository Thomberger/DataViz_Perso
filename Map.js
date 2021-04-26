const proj = 'round' // round rect rotating
var rot = 0

const Mapwidth = 1000;
const Mapheight = 1000;
const config = {
	speed: 0.005,
	verticalTilt: -10,
	horizontalTilt: 0
}
let locations = [];
const Mapsvg = d3.select("#map").attr('Mapwidth', Mapwidth).attr('Mapheight', Mapheight);
const markerGroup = Mapsvg.append('g');
switch(proj) {
	case 'round':
			projection = d3.geoRobinson();
			rot = 0;
			break;
	case 'rect':
			projection = d3.geoMercator();
			rot = 0;
			break;
	case 'rotating':
			projection = d3.geoOrthographic();
			rot=1;
			break;
	default :
			projection = d3.geoRobinson();
			rot = 0;
}

const initialScale = projection.scale();
const path = d3.geoPath().projection(projection);
const center = [Mapwidth/2, Mapheight/4];
drawGlobe();
drawGraticule();
if (rot){
	enableRotation();
}

console.log('yo')
function drawGlobe() {
	d3.queue()
	.defer(d3.json, 'https://gist.githubusercontent.com/mbostock/4090846/raw/d534aba169207548a8a3d670c9c2cc719ff05c47/world-110m.json')
	.defer(d3.csv, 'Data_processed/races.csv')
	.await((error, worldData, locationData) => {
		Mapsvg.append('path')
    .attr('class', 'sphere')
    .attr('d', path({type: 'Sphere'}));

		Mapsvg.selectAll(".segment")
		.data(topojson.feature(worldData, worldData.objects.countries).features)
		.enter().append("path")
		.attr("class", "country")
		.attr("d", path);

		locations = locationData;

		drawMarkers();
	});
}

function drawGraticule() {
	const graticule = d3.geoGraticule()
	.step([10, 10]);

	Mapsvg.append("path")
	.datum(graticule)
	.attr("class", "graticule")
	.attr("d", path)
}

function enableRotation() {
	d3.timer(function (elapsed) {
		projection.rotate([config.speed * elapsed, config.verticalTilt, config.horizontalTilt]);
		Mapsvg.selectAll("path").attr("d", path);
		drawMarkersRot();
	});
}

function drawMarkersRot() {
	const markers = markerGroup.selectAll('circle')
	.data(locations);
	markers
	.enter()
	.append('circle')
	.merge(markers)
	.attr('cx', d => projection([d.lng, d.lat])[0])
	.attr('cy', d => projection([d.lng, d.lat])[1])
	.attr('fill', d => {
		const coordinate = [d.lng, d.lat];
		gdistance = d3.geoDistance(coordinate, projection.invert(center));
		return gdistance > 1.57 ? 'none' : 'steelblue';
	})
	.attr('r', 2);

	markerGroup.each(function () {
		this.parentNode.appendChild(this);
	});
}

function drawMarkers() {
	const markers = markerGroup.selectAll('circle')
	.data(locations);
	markers
	.enter()
	.append('circle')
	.merge(markers)
	.attr('cx', d => projection([d.lng, d.lat])[0])
	.attr('cy', d => projection([d.lng, d.lat])[1])
	.attr('fill', 'steelblue')
	.attr('r', 2);

	markerGroup.each(function () {
		this.parentNode.appendChild(this);
	});
}
