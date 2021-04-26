//////////////////////////////////////
// Parameters

const proj = 'round' // round rect
switch(proj) {
	case 'round':
	projection = d3.geoRobinson();
	break;
	case 'rect':
	projection = d3.geoMercator();
	break;
	default :
	projection = d3.geoRobinson();
}

const Mapwidth = 1000;
const Mapheight = 1000;

var minYear = 1950
var maxYear = 2020

var Brushmargin = {top: 10, right: 10, bottom: 40, left: 10}
var Brushwidth = 1000 - Brushmargin.left - Brushmargin.right;
var Brushheight = 100 - Brushmargin.top - Brushmargin.bottom;

//////////////////////////////////////
// Map

const Mapsvg = d3.select("#map").attr('Mapwidth', Mapwidth).attr('Mapheight', Mapheight);

const path = d3.geoPath().projection(projection);
const locations_dataset = d3.csv('Data_processed/races.csv').then(function(data){return data;});
const locations =  locations_dataset.then(function(value) {
	return Promise.all(value.map(function(results){return [results.year,projection([results.lng, results.lat])];}))}).then(function(data){return data;});

drawGraticule();
drawGlobe();
var filteredData = locations.then(function(data) {updateMapPoints(getCol(data,1));})



//////////////////////////////////////
// Brush timeline

var x = d3.scaleTime()
.domain([new Date(1950, 1, 1), new Date(2021,1, 1) - 1])
.rangeRound([0, Brushwidth]);

var svg = d3.select("#timescale").attr("transform", "translate(" + Brushmargin.left + ",0)")

svg.append("g")
.attr("class", "axis axis--grid")
.attr("transform", "translate(0," + Brushheight + ")")
.call(d3.axisBottom(x)
.ticks(d3.timeYear)
.tickSize(-Brushheight)
.tickFormat(function() { return null; }))
.selectAll(".tick")
.classed("tick--minor", function(d) { return d3.timeYear(); });

svg.append("g")
.attr("class", "axis axis--x")
.attr("transform", "translate(0," + Brushheight + ")")
.call(d3.axisBottom(x)
.ticks(d3.timeYear)
.tickPadding(0))
.attr("text-anchor", null)
.selectAll("text")
.attr("x", 6).attr("transform", "rotate(90) translate(0,-10)")

svg.append("g")
.attr("class", "brush")
.call(d3.brushX()
.extent([[0, 0], [Brushwidth, Brushheight]])
.on("end", brush));

function brush() {
	if (!d3.event.sourceEvent) return; // Only transition after input.
	if (!d3.event.selection) {updateData(1950,2020);return;}; // Ignore empty selections.
	var d0 = d3.event.selection.map(x.invert),
	d1 = d0.map(d3.timeYear.round);

	// If empty when rounded, use floor & ceil instead.
	if (d1[0] >= d1[1]) {
		d1[0] = d3.timeYear.floor(d0[0]);
		d1[1] = d3.timeYear.offset(d1[0]);
	}

	d3.select(this).transition().call(d3.event.target.move, d1.map(x));
	updateData(d3.timeFormat("%Y")(d1[0]),d3.timeFormat("%Y")(d1[1]))

}




function drawGlobe() {
	// Sphere (ocean)
	Mapsvg.insert("path", ".graticule")
	.attr('class', 'sphere')
	.attr('d', path({type: 'Sphere'}));

	// Countries
	d3.json('https://gist.githubusercontent.com/mbostock/4090846/raw/d534aba169207548a8a3d670c9c2cc719ff05c47/world-110m.json').then(function(worldData) {
		Mapsvg.selectAll(".segment")
		.data(topojson.feature(worldData, worldData.objects.countries).features)
		.enter().insert("path", "circle")
		.attr("class", "country")
		.attr("d", path);
	})
}

function updateData(minYear,maxYear){
	console.log(minYear,maxYear)

	// Circuits
		locations.then(function(data){
			var filteredData = []
			data.forEach(function(d) {
					if(d[0]>=minYear & d[0]<=maxYear){
						filteredData.push(d[1])
					}
			})
			updateMapPoints(filteredData)
		})
	};

	function updateMapPoints(data) {
		console.log(data)
		var circles = Mapsvg.selectAll("circle").data(data);

		circles // update existing points
		.attr("fill", 'steelblue')
		.attr("cx",function(d) {if (d){console.log(d);return d[0]; }})
		.attr("cy",function(d) {if (d){return d[1]; }})
		.attr("r",1.5);
		//.on("mouseover", tipMouseover)
		//.on("mouseout", tipMouseout)

		circles.exit() // exiting points
		.remove();

		circles.enter().append("circle") // new entering points
		.attr("fill", 'steelblue')
		.attr("cx", function(d) {if (d){return d[0] }})
		.attr("cy", function(d) {if (d){return d[1] }})
		.attr("r",  1.5);
		//.on("mouseover", tipMouseover)
		//.on("mouseout", tipMouseout)


	};

	function drawGraticule() {
		const graticule = d3.geoGraticule()
		.step([10, 10]);

		Mapsvg.append("path")
		.datum(graticule)
		.attr("class", "graticule")
		.attr("d", path)
	}

	function getCol(matrix, col){
       var column = [];
       for(var i=0; i<matrix.length; i++){
          column.push(matrix[i][col]);
       }
       return column;
    }

	function addline(array,data){
		array.push(data)
		return array
	}
