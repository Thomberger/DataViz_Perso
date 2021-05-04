//////////////////////////////////////
// Parameters

const proj = 'round' // round rect
switch(proj) {
	case 'round':
	projection = d3.geoInterruptedMollweideHemispheres().rotate([30, 0]).precision(.1);
	;//geoInterruptedMollweideHemispheres
	break;
	case 'rect':
	projection = d3.geoMercator();
	break;
	default :
	projection = d3.geoRobinson();
}

const Mapwidth = 1000;
const Mapheight = 1000;

var minYear = "1950"
var maxYear = "2021"
init_r = 2
r = init_r
init_bigr = 5
bigr = init_bigr
init_stroke = 2
stroke = init_stroke

var Brushmargin = {top: 10, right: 10, bottom: 40, left: 10}
var Brushwidth = 1000 - Brushmargin.left - Brushmargin.right;
var Brushheight = 100 - Brushmargin.top - Brushmargin.bottom;

//////////////////////////////////////
// Map
const path = d3.geoPath().projection(projection);

const Mapsvg = d3.select("#map")
const g = Mapsvg.append('g');

// Sphere (ocean)

g.append("path")
.datum({type: "Sphere"})
.attr("id", "sphere")
.attr('class', 'sphere')
.attr("d", path);

g.append("clipPath")
.attr("id", "clip")
.append("use")
.attr("xlink:href", "#sphere");



const locations = d3.csv('Data_processed/races.csv').then(function(data){return d3.nest()
	.key(function(d) { return [d.circuitId, d.name,d.lat,d.lng,d.location,d.country]; })
	.entries(data);});
filteredLocation = []

const races = d3.csv('Data_processed/laps.csv').then(function(data){return d3.nest()
	.key(function(d) { return d.circuitId; })
	.entries(data);});


const zoom = d3.zoom().scaleExtent([1, 8]).on('zoom', zoomed)
Mapsvg.call(zoom).on("dblclick.zoom",reset_zoom)


function reset_zoom(){
	d3.event.transform = d3.zoomIdentity
	zoomed()
}

function zoomed(){

	g.selectAll('.country') // To prevent stroke width from scaling
	.attr('transform', d3.event.transform);
	g.selectAll('.sphere') // To prevent stroke width from scaling
	.attr('transform', d3.event.transform);
	//g.selectAll('path') // To prevent stroke width from scaling
	//.attr('transform', d3.event.transform);

	r = init_r/d3.event.transform.k
	bigr = init_bigr/d3.event.transform.k
	stroke = init_stroke/d3.event.transform.k

	g.selectAll('circle')
	.attr('r',r)
	.attr('transform', d3.event.transform)
	brushend()
}


drawGraticule();
drawGlobe();
updateData(1950,2020)


//////////////////////////////////////
// Brush timeline

var x = d3.scaleTime()
.domain([new Date(1950, 1, 1), new Date(2021,1, 1) ])
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
.on("brush",brush)
.on("end", brushend));

function brushend(){
	if (!d3.event.sourceEvent) return; // Only transition after input.
	if (!d3.event.selection) {minYear = "1950";maxYear = "2021";updateData(minYear,maxYear);return;}; // empty selections = select all.
	var d0 = d3.event.selection.map(x.invert),
	d1 = d0.map(d3.timeYear.round);
	// If empty when rounded, use floor & ceil instead.
	if (d1[0] >= d1[1]) {
		d1[0] = d3.timeYear.floor(d0[0]);
		d1[1] = d3.timeYear.offset(d1[0]);
	}
	// round timeline
	d3.select(this).transition().call(d3.event.target.move, d1.map(x));
	// update with rounded data
	updateData(d3.timeFormat("%Y")(d1[0]),d3.timeFormat("%Y")(d1[1]))

}

function brush() {
	var d0 = d3.event.selection.map(x.invert),
	d1 = d0.map(d3.timeYear.round);
	// If empty when rounded, use floor & ceil instead.
	if (d1[0] >= d1[1]) {
		d1[0] = d3.timeYear.floor(d0[0]);
		d1[1] = d3.timeYear.offset(d1[0]);
	}
	// update with rounded data
	minYear = d3.timeFormat("%Y")(d1[0])
	maxYear = d3.timeFormat("%Y")(d1[1])
	updateData(minYear,maxYear)

}

//////////////////////////////////////
// circuit selection
var Plotmargin = {
	top: 20,
	right: 20,
	bottom: 30,
	left: 60
}
Plotwidth = 1000 - Plotmargin.left - Plotmargin.right;
Plotheight = 200 - Plotmargin.top - Plotmargin.bottom;

const Plotsvg = d3.select("#plot__circuit")
var Plotx = d3.scaleLinear().range([Plotmargin.left, Plotwidth]);
var Ploty = d3.scaleLinear().range([Plotheight, Plotmargin.top	]);


function circle_select(d) {
	console.log(minYear,maxYear)
	g.selectAll(".circle-clicked").classed("circle-clicked", false);

	this.setAttribute("class", "circle-clicked"); // add hover class to emphasize
	races.then(function(data){
		filteredData = []
		besttime = [-1,Infinity,"No name"]
		name = d[3]
		data.forEach(function(v){
			if(d[0]==v.key){
				v.values.forEach(function (t){
					if (t.year>=minYear & t.year<maxYear){
						//console.log(t)
						filteredData.push([t.year,t.milliseconds,t.forename + " " + t.surname])
						if(t.milliseconds<=besttime[1]){
							besttime=[t.year,t.milliseconds,t.forename + " " + t.surname]
						}
					}}
				)}})
				UpdatePlot(name,besttime,filteredData)
			})
		}

//////////////////////////////////////
// Tool tip

var tooltip = d3.select("#map-container").append("div")
.attr("class", "tooltip")
.style("opacity", 0);

// tooltip mouseover event handler
function tipMouseover(d) {
	console.log(d)
	this.setAttribute("class", "circle-hover"); // add hover class to emphasize
	this.setAttribute("r",bigr)

	var html  = "<span  style='font-weight:bold;color:#999999'> " + d[1] + ", "+ d[2] + " </span><br/>" +
	"<span  style='font-weight:bold;color:#D20000'> " + d[3] +" </span><br/>" +
	"<span  style='color:#999999'> Count: " + d[4] + " races. </span>";

	tooltip.html(html)
	.style("left", (d3.event.pageX + 15) + "px")
	.style("top", (d3.event.pageY - 28) + "px")
	.transition()
	.duration(200) // ms
	.style("opacity", 0.9) // started as 0!
};

// tooltip mouseout event handler
function tipMouseout(d) {
	this.classList.remove("circle-hover"); // remove hover class
	this.setAttribute("r",r)

	tooltip.transition()
	.duration(500) // ms
	.style("opacity", 0); // don't care about position!
};


function drawGlobe() {

	// Countries
	d3.json('//unpkg.com/world-atlas@1/world/110m.json').then(function(worldData) {
		g.selectAll(".segment")
		.data(topojson.feature(worldData, worldData.objects.countries).features)
		.enter().insert("path", "circle")
		.attr("class", "country")
		.attr("clip-path", "url(#clip)")
		.attr("d", path);
	})
}

function updateData(minYear,maxYear){
	// Circuits
	locations.then(function(data){
		filteredLocation = []
		data.forEach(function(d){
			d.values.forEach(function (v){
				if (v.year>=minYear & v.year<maxYear){
					id = getCol(filteredLocation,0).indexOf(v.circuitId)
					if (id==-1){
						filteredLocation.push([v.circuitId,v.location,v.country,v.name,+1,projection([v.lng, v.lat])])
					}
					else{
						filteredLocation[id][4] += 1
					}
				}})})
				updateMapPoints(filteredLocation)})
			};

function updateMapPoints(data) {
	var circles = g.selectAll("circle").data(data);

	circles // update existing points
	.attr("cx",function(d) {if (d){return d[5][0]; }})
	.attr("cy",function(d) {if (d){return d[5][1]; }})
	.attr('r',r)
	.on("mouseover", tipMouseover)
	.on("mouseout", tipMouseout)

	circles.exit().remove() // exiting points

	circles.enter().append("circle") // new entering points
	.attr("fill", "#D20000")
	.attr("cx", function(d) {if (d){return d[5][0] }})
	.attr("cy", function(d) {if (d){return d[5][1] }})
	.attr('r',r)
	.on("mouseover", tipMouseover)
	.on("mouseout", tipMouseout)

	g.selectAll("circle")
	.on("click", circle_select)


};

function drawGraticule() {
	const graticule = d3.geoGraticule()
	.step([10, 10]);

	g.append("path")
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


function UpdatePlot(name,besttime,data){
	var h1 = document.getElementById("Circuit");
	var h2 = document.getElementById("Circuit_stat");
	var img = document.getElementById("circuitsvg");

	if (data.length==0){
		h1.innerHTML = "No lap time data for selected circuit."
		h2.innerHTML = ""
		img.src = 'Circuit-svg/No-data.jpg';
		Plotsvg.selectAll("g").remove()
	}
	else{
	 	h1.innerHTML = name + "  -  " + data[0][0] + "-" + data[data.length-1][0]
		console.log(besttime,data)
		h2.innerHTML = "Best lap time: "+millisToMinutesAndSeconds(besttime[1])+"   - By: "+besttime[2]+"    - In: "+besttime[0]
		img.src = 'Circuit-svg/'+name+'.svg';

		/*
		var dataset1 = [[2000, 81220], [2001, 79100], [2002, 0], [2003, 1000000], [2004, 80182], [2005, 79720], [2006, 79276], [2007, 82150], [2008, 81115]];
		var xScale = d3.scaleLinear().domain([2000, 2008]).range([0, Plotwidth]),
    		yScale = d3.scaleLinear().domain([70000, 90000]).range([Plotheight, 0]);
		console.log(d3.extent(data, function(d) {return d[1];}))
		*/

		Plotx.domain(d3.extent(data, function(d) {return d[0];}))
		Ploty.domain([0,d3.extent(data, function(d) {return d[1];})[1]])

		Plotsvg.selectAll("g").remove()
		g_plot = Plotsvg.append("g")
		    .attr("transform","translate(" + Plotmargin.left + "," + Plotmargin.top + ")");

		g_plot.append("g")
         .attr("transform", "translate(0," + Plotheight + ")")
         .call(d3.axisBottom(Plotx));

    g_plot.append("g")
		.attr("transform", "translate(" + Plotmargin.left + ",0)")
     .call(d3.axisLeft(Ploty).tickFormat(function(d){return millisToMinutesAndSeconds(d)}));

		Plotsvg.append('g')
        .selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", function (d) { return Plotx(d[0]); } )
        .attr("cy", function (d) { return Ploty(d[1]); } )
        .attr("r", 5)
				.attr("transform", "translate(" + Plotmargin.left + "," + Plotmargin.top + ")")
        .style("fill", "#CC0000");

		Plotsvg.append("path")
      .data(dataset1)
			.attr("fill", "none")
      .attr("stroke", "#69b3a2")
      .attr("stroke-width",10)
      .attr("d",d3.line()
        .x(function (d) { console.log( xScale(d[0]));return xScale(d[0]); })
        .y(function (d) { return yScale(d[1]); }))




/*
		.append('g')
        .selectAll("circle")
        .data(dataset1)
        .enter()
        .append("circle")
        .attr("cx", function (d) { return xScale(d[0]); } )
        .attr("cy", function (d) { return yScale(d[1]); } )
        .attr("r", 2)
        .attr("transform", "translate(" + 100 + "," + 100 + ")")
        .style("fill", "#CC0000");
*/
		/*
		Plotx.domain(d3.extent(data, function(d) {return d[0];}))
		Ploty.domain(d3.extent(data, function(d) {return d[1];}))

		Plotsvg.append("g_plot").attr("class", "y plotaxis")
      .call(d3.axisLeft(Ploty));
		Plotsvg.append("g_plot").attr("class", "x plotaxis")
      .attr("transform", "translate(0," + Plotheight + ")")
      .call(d3.axisBottom(Plotx));

			line = d3.line()
        .x(Plotx(data[0]))
        .y(Ploty(data[1]))
		console.log(line)
		Plotsvg.append("path")
      .data(data)
      .attr("class", "plotline")
      .attr("d",line)
			*/
	}
}

function millisToMinutesAndSeconds(millis) {
  var minutes = Math.floor(millis / 60000);
  var seconds = Math.floor((millis-minutes*60000)/1000);
	var millis = millis-minutes*60000-seconds*1000
  return minutes.toString() + "min " + (seconds < 10 ? '0' : '') + seconds.toString() + "secs " + millis.toString()+ "ms";
}
