//////////////////////////////////////
// Parameters


const Mapwidth = 1000; // change in css
const Mapheight = 500;

var minYear = "1950"
var maxYear = "2021"
init_r = 2
r = init_r
init_bigr = 5
bigr = init_bigr
init_stroke = 2
stroke = init_stroke

projection = d3.geoRobinson().precision(0.01).scale(150).translate([Mapwidth / 2, Mapheight / 2]);

  //geoRobinson
	//geoInterruptedMollweideHemispheres().rotate([30,0])
	//geoMercator
	//geoOrthographic
	//geoWinkel3

var Brushmargin = {top: 5, right: 10, bottom: 20, left: 10}
var Brushwidth = 1000 - Brushmargin.left - Brushmargin.right;
var Brushheight = 50 - Brushmargin.top - Brushmargin.bottom;

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

const locations = d3.csv('Data_processed/races.csv').then(function(data){return d3.nest()
	.key(function(d) { return [d.circuitId, d.name,d.lat,d.lng,d.location,d.country]; })
	.entries(data);});
filteredLocation = []

const races = d3.csv('Data_processed/laps.csv').then(function(data){return d3.nest()
	.key(function(d) { return d.circuitId; })
	.entries(data);});


drawGraticule();
drawGlobe();

g.append("g")
.attr("class", "brush")
.call(d3.brush()
.extent([[0, 0], [Mapwidth, Mapheight]])
.on("end",brushMap))


updateData(1950,2020)


function brushMap(){
	console.log(d3.event.selection)
	d = d3.event.selection
	if (!d) {
		scale =1
		g.transition()
      .duration(750)
			.attr("transform", "translate(" + [0,0] + ")scale(" + scale + ")");
	}
	else{
			dx = d[1][0] - d[0][0],
      dy = d[1][1] - d[0][1],
      xmap = (d[0][0] + d[1][0]) / 2,
      ymap = (d[0][1] + d[1][1]) / 2,
      scale = 1 / Math.max(dx / Mapwidth, dy / Mapheight),
      translate = [Mapwidth / 2 - scale * xmap, Mapheight / 2 - scale * ymap];

		g.transition()
      .duration(750)
			.attr("transform", "translate(" + translate + ")scale(" + scale + ")")
		Mapsvg.select(".brush").call(d3.brush().clear)
	}
	r = init_r/Math.pow(scale,3/4)
	bigr = init_bigr/Math.pow(scale,3/4)
	stroke = init_stroke/scale

	g.selectAll('circle')
				.transition()
	      .duration(750)
				.attr('r',r)

}





//////////////////////////////////////
// Brush timeline

var x = d3.scaleTime()
.domain([new Date(1950, 1, 1), new Date(2021,1, 1) ])
.rangeRound([0, Brushwidth]);

var svg = d3.select("#timescale").attr("transform", "translate(" + Brushmargin.left + ",0)")

svg.append("rect")
	.attr("x",0)
	.attr("y", Brushheight)
	.attr("height", 30)
	.attr("width", Brushwidth+5)
	.attr("rx",5 )
	.style("fill", '#111111')
	.style("opacity",0.7);

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
	if (!d3.event.selection) {minYear = "1950";maxYear = "2021";updateData(minYear,maxYear);UpdatePlot(plot_id,plot_name);return;}; // empty selections = select all.
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
	UpdatePlot(plot_id,plot_name)


}

//////////////////////////////////////
// circuit selection

// External value for brushing update
plot_id=0
plot_name=0

var Plotmargin = {
	top: 20,
	right: 20,
	bottom: 30,
	left: 60
}
Plotwidth = 1000 - Plotmargin.left - Plotmargin.right;
Plotheight = 400 - Plotmargin.top - Plotmargin.bottom;

const Plotsvg = d3.select("#plot__circuit")
var Plotx = d3.scaleLinear().range([Plotmargin.left, Plotwidth]);
var Ploty = d3.scaleLinear().range([Plotheight, Plotmargin.top	]);

function circle_select(d) {
	g.selectAll("circle")
	.attr("fill","#D20000")

	this.setAttribute("fill", "#fff"); // add hover class to emphasize
	plot_id = d[0]
	plot_name=d[3]
	UpdatePlot(plot_id,plot_name)

}

//////////////////////////////////////
// Tool tip

var tooltip = d3.select("#map-container").append("div")
.attr("class", "tooltip")
.style("opacity", 0);

// tooltip mouseover event handler
function tipMouseover(d) {
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
		.enter().insert("path", "g")
		.attr("class", "country")
		.attr("clip-path", "url(#clip)")
		.attr("d", path)
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


function UpdatePlot(id,name){
	var h1 = document.getElementById("Circuit");
	var h2 = document.getElementById("Circuit_stat");
	var img = document.getElementById("circuitsvg");

	races.then(function(data){
		besttime = [-1,Infinity,"No name"]
		filteredData=[]
		data.forEach(function(v){
			if(id==v.key){
				v.values.forEach(function (t){
						if (t.year>=minYear & t.year<maxYear){
							filteredData.push([t.year,t.milliseconds,t.forename + " " + t.surname])

							if(t.milliseconds<=besttime[1]){
								besttime=[t.year,t.milliseconds,t.forename + " " + t.surname]
						}
					}}
				)}})
			data = filteredData


	if (data.length==0){

		h1.innerHTML = "No lap time data for selected circuit.<br>Lap time were recorded starting from 1996."
		h2.innerHTML = ""
		img.src = 'Circuit-svg/No-data.jpg';
		Plotsvg.selectAll("g,path").remove()
	}
	else{

	 	h1.innerHTML = name + "  -  " + data[0][0] + "-" + data[data.length-1][0]
		h2.innerHTML = "Best lap time: "+millisToMinutesAndSeconds(besttime[1],0)+"<br>By: "+besttime[2]+"    - In: "+besttime[0]
		img.src = 'Circuit-svg/'+name+'.svg';

		Plotx.domain(d3.extent(data, function(d) {return d[0];}))
		Ploty.domain([0,d3.extent(data, function(d) {return d[1];})[1]*1.1])

		Plotsvg.selectAll("g,path").remove()
		g_plot = Plotsvg.append("g")
		    .attr("transform","translate(" + Plotmargin.left + "," + Plotmargin.top + ")");

		g_plot.append("g")
         .attr("transform", "translate(0," + Plotheight + ")")
         .call(d3.axisBottom(Plotx).ticks(data.length).tickFormat(d3.format(".0f")));

    g_plot.append("g")
		.attr("transform", "translate(" + Plotmargin.left + ",0)")
     .call(d3.axisLeft(Ploty).ticks(20).tickFormat(function(d,i){return i % 2 === 0 ?  millisToMinutesAndSeconds(d,1): null}));

		 var Tooltip = d3.select("#circuitdiv")
      .append("div")
      .style("opacity", 0)
      .attr("class", "tooltip")

      // Three function that change the tooltip when user hover / move / leave a cell
      var mouseover = function(d) {
				var html  = "<span  style='font-weight:bold;color:#999999'> " +d[0]+" - "+ d[2] + " </span><br/>" +
				"<span  style='font-weight:bold;color:#D20000'> " +  millisToMinutesAndSeconds(d[1],0) +" </span>";

				tooltip.html(html)
				.style("left", (d3.event.pageX + 15) + "px")
				.style("top", (d3.event.pageY - 14) + "px")
				.transition()
				.duration(200) // ms
				.style("opacity", 0.9) // started as 0!
      }
      var mouseout = function(d) {
				tooltip.transition()
				.duration(500) // ms
				.style("opacity", 0); // don't care about position!
      }

		Plotsvg.append('g')
        .selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", function (d) { return Plotx(d[0]); } )
        .attr("cy", function (d) { return Ploty(d[1]); } )
        .attr("r", 5)
				.attr("transform", "translate(" + Plotmargin.left + "," + Plotmargin.top + ")")
        .style("fill", "#D20000")
				.on("mouseover", mouseover)
				.on("mouseout", mouseout);

	modifieddata=[]
	data.forEach(function(d){modifieddata.push([Plotx(d[0]),Ploty(d[1])]);})
	var lineGenerator = d3.line();
	var pathData = lineGenerator(modifieddata);

	Plotsvg.append("path")
			.attr("fill", "none")
      .attr("stroke", "#D20000")
      .attr("stroke-width",1)
			.attr("transform", "translate(" + Plotmargin.left + "," + Plotmargin.top + ")")
      .attr("d",pathData)
	}
	})
}

function millisToMinutesAndSeconds(millis,short) {
  var minutes = Math.floor(millis / 60000);
  var seconds = Math.floor((millis-minutes*60000)/1000);
	var millis = millis-minutes*60000-seconds*1000
	var string = ""
	if (minutes>=1){
		string += minutes.toString() + "min "
	}
	if (seconds<10){
		string += "0"
	}
	string += seconds.toString() + "secs "
	if (short==0){
		string+= millis.toString()+ "ms"
	}
  return string;
}
