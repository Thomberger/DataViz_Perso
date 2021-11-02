//////////////////////////////////////
// Parameters
setTheme('theme-dark')

const Mapwidth = 1000; // change in css
const Mapheight = 600;

var minYear = "1950"
var maxYear = "2021"
init_r = 2
r = init_r
init_bigr = 5
bigr = init_bigr
init_stroke = 2
stroke = init_stroke
scale = 1

projection = d3.geoWinkel3().precision(0.01).scale(195).translate([Mapwidth / 2, Mapheight / 2]);

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

// gauge option
theme =getComputedStyle(document.documentElement)


var opts = {
  angle: 0.18, // The span of the gauge arc
  lineWidth: 0.1, // The line thickness
  radiusScale: 0.8, // Relative radius
  pointer: {
    length: 0.6, // // Relative to gauge radius
    strokeWidth: 0.035, // The thickness
    color: '#000' // Fill color
  },
  limitMax: false,     // If false, max value increases automatically if value > maxValue
  limitMin: false,     // If true, the min value of the gauge will be fixed
  colorStart: theme.getPropertyValue('--Accent'),   // Colors
  colorStop: theme.getPropertyValue('--Accent'),    // just experiment with them
  strokeColor: theme.getPropertyValue('--shady2'),  // to see which ones work best for you
  generateGradient: false,
  highDpiSupport: true,     // High resolution support

};

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

const circuits_tracks = d3.json("Data_processed/f1-circuits.geojson").then(function(worldData) {return worldData.features})

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

const Dstanding = d3.csv('Data_processed/Driver_standings.csv').then(function(data){return data})

const Dstanding_Y = Dstanding.then(function(data){return d3.nest()
	.key(function(d) { return d.year; })
	.entries(data);});

const Dstanding_D = Dstanding.then(function(data){return d3.nest()
	.key(function(d) { return d.name; })
	.entries(data);});

const Cstanding = d3.csv('Data_processed/Constructor_standings.csv').then(function(data){return data})

const Cstanding_Y = Cstanding.then(function(data){return d3.nest()
	.key(function(d) { return d.year; })
	.entries(data);});

const Cstanding_C = Cstanding.then(function(data){return d3.nest()
	.key(function(d) { return d.name; })
	.entries(data);});




updateTable()



function brushMap(){
	d = d3.event.selection
	if (!d) {
		scale =1

	g.transition()
	  .duration(750)
		.ease(d3.easePolyOut.exponent(20))
		.attr("transform", "translate(" + [0,0] + ")scale(" + scale + ")")
		.on("start",function(){

			g.selectAll('circle').transition()
				  .delay(200)
			.attr("stroke-width",function(d) {if (d[0]==circuit_plot[0]){return '1.5px'}else{return "0px"}})
			.attr("fill",function(d) {if (d[0]==circuit_plot[0]){return 'var(--extreme2)'}else{return "var(--Accent)"}})
			.attr('r',init_r)
		})




	g.selectAll('#circuit')
	.attr("stroke", "none") //var(--Foreground)



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
	.style("fill", 'var(--Background)')
	.style("opacity",0.7);

svg.append("g")
.attr("class", "axis axis--grid")
.attr("transform", "translate(0," + Brushheight + ")")
.call(d3.axisBottom(x)
.ticks(d3.timeYear)
.tickSize(-Brushheight)
.tickFormat(function(d) { return null; }))
.selectAll(".tick")
.classed("tick--minor", function(d) { return d3.timeYear(); });

var ticks = d3.selectAll(".tick");
ticks.each(function(_,i){
    if(i%3 !== 0) d3.select(this).attr('opacity',0.5);
});

svg.append("g")
.attr("class", "axis axis--x")
.attr("transform", "translate(0," + Brushheight + ")")
.call(d3.axisBottom(x)
.ticks(d3.timeYear)
.tickPadding(0))
.attr("text-anchor", null)
.selectAll("text")
.attr("x", 6).attr("transform", "rotate(00) translate(-18,5)")

var ticks = d3.selectAll(".axis--x .tick ");
ticks.each(function(_,i){
    if(i%3 !== 0) d3.select(this).attr('opacity',0.5);
});

var ticks = d3.selectAll(".tick text");
ticks.each(function(_,i){
    if(i%3 !== 2) d3.select(this).remove();
});

svg.append("g")
.attr("class", "brush")
.call(d3.brushX()
.extent([[0, 0], [Brushwidth, Brushheight]])
.on("brush",brush)
.on("end", brushend));

function brushend(){
	//ROUND TO YEAR AND UPDATE BRUSH SELECTION
	//RESET BRUSH IF EMPTY
	if (!d3.event.sourceEvent) return; // Only transition after input.
	if (!d3.event.selection) {minYear = "1950";maxYear = "2021";updateData(minYear,maxYear);UpdatePlot_circuit(circuit_plot);UpdatePlot_driver(driver_plot);UpdatePlot_constructor(constructor_plot);updateTable();return;}; // empty selections = select all.
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
	//ROUND TO YEAR AND UPDATE ALL DATA
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
	UpdatePlot_circuit(circuit_plot)
	UpdatePlot_driver(driver_plot)
	UpdatePlot_constructor(constructor_plot)
	updateTable()


}

//////////////////////////////////////
// circuit selection

// External value for brushing update
circuit_plot=0
driver_plot = 0
constructor_plot = 0

var Plotmargin = {
	top: 0,
	right: 20,
	bottom: 30,
	left: 40
}
Plotwidth = 1000 - Plotmargin.left - Plotmargin.right;
Plotheight = 400 - Plotmargin.top - Plotmargin.bottom;

const Plotsvg = d3.select("#plot__circuit")
var Plotx = d3.scaleLinear().range([Plotmargin.left, Plotwidth]);
var Ploty = d3.scaleLinear().range([Plotheight, Plotmargin.top	]);

function circle_select(d) {
	h1 = document.getElementById("plot__circuit");
	circuits_tracks.then(function(t){
		temp=1
		t.forEach((item, i) => {
			if(item.properties.Name==d[3]){
				temp=0
				d.push(parseInt(item.properties.length)/1000)
				bbox = [projection([item.bbox[0],item.bbox[1]]),projection([item.bbox[2],item.bbox[3]])]
				dx = bbox[1][0] - bbox[0][0],
				dy = bbox[1][1] - bbox[0][1],
				xmap = (bbox[0][0] + bbox[1][0]) / 2,
				ymap = (bbox[0][1] + bbox[1][1]) / 2,
				scale = 0.3 / Math.max(dx / Mapwidth, dy / Mapheight),
				translate = [Mapwidth / 2 - scale * xmap, Mapheight / 2 - scale * ymap];

				g.transition()
				.duration(750)
				.attr("transform", "translate(" + translate + ")scale(" +scale + ")")
				.on("end",function(){h1.scrollIntoView({block: "end", inline: "nearest",behavior: 'smooth'});})

				g.selectAll('#circuit')
				.attr("stroke", "var(--Foreground)") //var(--Foreground)

				g.selectAll("circle")
				.attr("fill","none")
			}
		});
	if (temp){
		g.selectAll("circle")
		.attr("stroke-width",function(d) {if (d[0]==circuit_plot[0]){return '1.5px'}else{return "0px"}})
		.attr("fill",function(d) {if (d[0]==circuit_plot[0]){return 'var(--extreme2)'}else{return "var(--Accent)"}});

		h1.scrollIntoView({block: "end", inline: "nearest",behavior: 'smooth'});


	}
})
	driver_plot = 0
	circuit_plot = d
	constructor_plot = 0
	UpdatePlot_circuit(circuit_plot)

}



//////////////////////////////////////
// Tool tip

var tooltip = d3.select("#map-container").append("div")
.attr("class", "tooltip")
.style("opacity", 0);


function tipMouseover(d) {
	this.setAttribute("class", "circle-hover"); // add hover class to emphasize
	this.setAttribute("r",bigr)

	var html  = "<span  style='font-weight:bold;color:var(--Foreground)'> " + d[1] + ", "+ d[2] + " </span><br/>" +
	"<span  style='font-weight:bold;color:var(--Accent)'> " + d[3] +" </span><br/>" +
	"<span  style='color:var(--Foreground)'> Count: " + d[4] + " races. </span>";

	tooltip.html(html)
	.style("left", (d3.event.pageX + 15) + "px")
	.style("top", (d3.event.pageY - 28) + "px")
	.transition()
	.duration(200) // ms
	.style("opacity", 0.9) // started as 0!
};

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
	}).then(circuits_tracks.then(function(d){
		g.selectAll(".segment")
		.data(d)
		.enter().append("path")
		.attr("id",'circuit')
		.attr("stroke-width", "5px")
		.attr("stroke", "none") //var(--Foreground)  none
		.attr("fill","none")
		.attr("vector-effect","non-scaling-stroke")
		.attr("d", path)
	}))
}

function updateData(minYear,maxYear){
	// Circuits
	locations.then(function(data){
		filteredLocation = []
		data.forEach(function(d){
			d.values.forEach(function (v){
				if (v.year>=minYear & parseInt(v.year)<=maxYear){
					id = getCol(filteredLocation,0).indexOf(v.circuitId)
					if (id==-1){
							filteredLocation.push([v.circuitId,v.location,v.country,v.name,+1,projection([v.lng, v.lat]),v.alt])
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
	.attr("fill",function(d) {if (scale<=3000){if (d[0]==circuit_plot[0]){return 'var(--extreme2)'}else{return "var(--Accent)"}}else{return 'none'}})
	.attr("stroke-width",function(d) {if (d[0]==circuit_plot[0]){return '1.5px'}else{return "0px"}})
	.on("mouseover", tipMouseover)
	.on("mouseout", tipMouseout)

	circles.exit().remove() // exiting points

	circles.enter().append("circle") // new entering points
	.attr("fill", "var(--Accent)")
	.attr("cx", function(d) {if (d){return d[5][0] }})
	.attr("cy", function(d) {if (d){return d[5][1] }})
	.attr('r',r)
	.attr('stroke', 'var(--extreme1)')
	.attr("stroke-width",'0px')
	.attr('vector-effect', 'non-scaling-stroke')
	.on("mouseover", tipMouseover)
	.on("mouseout", tipMouseout)

	g.selectAll("circle")
	.attr("cursor", "pointer")
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

function UpdatePlot_circuit(circuit){
	if (circuit_plot != 0) {
	var h1 = document.getElementById("Circuit");

	races.then(function(data){
		besttime = [-1,999999,"No name"]
		filteredData=[]
		data.forEach(function(v){
			if(circuit[0]==v.key){
				v.values.forEach(function (t){
						if (t.year>=minYear & t.year<maxYear){
							filteredData.push([t.year,parseInt(t.milliseconds),t.forename + " " + t.surname])

							if(parseInt(t.milliseconds) <= parseInt(besttime[1])){
								besttime=[t.year,t.milliseconds,t.forename + " " + t.surname]

						}
					}}
				)}})
			data = filteredData


	if (data.length==0){

		h1.innerHTML = circuit[3]
    var h2 = document.getElementById("nolap");
    h2.innerHTML = "No lap time data for selected circuit and time-range.<br>Lap time were recorded starting from 1996.";
		txt = ["Altitude"]
    maxs=[2227]
		Plotsvg.selectAll("g,path").remove()
    stats = [circuit[6]]
	}
	else{
    h1.innerHTML = circuit[3]

    var h2 = document.getElementById("nolap");
    h2.innerHTML = ""
    maxs = [2227,1]
    stats = [circuit[6],"<br>" +millisToMinutesAndSeconds(besttime[1],0)]

    if (stats[7]==1){
      stats.splice(0, 0, circuit[7])
      maxs.splice(0, 0,7004)
      txt = ["Length","Altitude","Best lap time<br>By: "+besttime[2]+"<br>In: "+besttime[0]]
    }
    else {
      txt = ["Altitude","Best lap time<br>By: "+besttime[2]+"<br>In: "+besttime[0]]
    }
  }
  var h2 = document.getElementById("gauge" + (1));
  h2.innerHTML = '';
  var h2 = document.getElementById("gauge" + (1) + "_NUM");
  h2.innerHTML = "";

    for (var i = 0; i < txt.length; i++) {
      var h2 = document.getElementById("gauge" + (i+2));
      h2.innerHTML = txt[i];
      var h2 = document.getElementById("gauge" + (i+2) + "_NUM");
      h2.innerHTML = stats[i];
    }
    for (var i = txt.length+1; i < 7; i++) {
      var h2 = document.getElementById("gauge" + (i+1));
      h2.innerHTML = '';
      var h2 = document.getElementById("gauge" + (i+1) + "_NUM");
      h2.innerHTML = "";
    }
    if (data.length!=0){
    stats[stats["length"]-1] = 55404/besttime[1]
  }
    set_gauges(stats["length"],stats,maxs)

    if (data.length!=0){
		Plotx.domain(d3.extent(data, function(d) {return d[0];}))
		Ploty.domain([d3.extent(data, function(d) {return d[1];})[0]*0.8,d3.extent(data, function(d) {return d[1];})[1]*1.1])

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
				var html  = "<span  style='font-weight:bold;color:var(--Foreground)'> " +d[0]+" - "+ d[2] + " </span><br/>" +
				"<span  style='font-weight:bold;color:var(--Accent)'> " +  millisToMinutesAndSeconds(d[1],0) +" </span>";

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
        .style("fill", "var(--Accent)")
				.on("mouseover", mouseover)
				.on("mouseout", mouseout);

	modifieddata=[]
	data.forEach(function(d){modifieddata.push([Plotx(d[0]),Ploty(d[1])]);})
	var lineGenerator = d3.line();
	var pathData = lineGenerator(modifieddata);

	Plotsvg.append("path")
			.attr("fill", "none")
      .attr("stroke", "var(--Accent)")
      .attr("stroke-width",1)
			.attr("transform", "translate(" + Plotmargin.left + "," + Plotmargin.top + ")")
      .attr("d",pathData)
	}
	})
}}

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

function tabulate(data,columns,iddiv,link) {
	d3.select(iddiv).select('table').remove()
  var table = d3.select(iddiv).append('table').attr("align","center")
	var thead = table.append('thead')
	var tbody = table.append('tbody')

	thead.append('tr')
	  .selectAll('th')
	    .data(columns)
	    .enter()
	  .append('th')
	    .text(function (d) { return d })

	const rows = tbody.selectAll('tr')
							.data(data, function(d,i){   // don't need the first row
								return d;
							}).enter().append("tr")
							.on("click",link)
							.attr('class','first')
							.attr('class',function(d,i) {if(i==0){return 'first'}else if(i==1|i==2){return 'second'}else{return ''}})


	var cells = rows.selectAll('td')
								.data(function(d) {return d; })
								.enter()
								.append("td")
								.text(function(d) {return d;});


}

function updateTable(){
	var h1 = document.getElementById("Driver_header");
	h1.innerHTML = "Driver standings of season " + (maxYear-1)

	Dstanding_Y.then(function(d){
		filteredData=[]
		d.forEach(function(v){
			if(maxYear-1==v.key){
				v.values.forEach(function (t){
						filteredData.push([t.name,t.points,t.wins])
					})
				}})


			data = filteredData
			tabulate(data,["Driver","Points","Wins"],'#Driver_table',driver_select)

		})

		var h1 = document.getElementById("Constructor_header");
		h1.innerHTML = "Constructor standings of season " + (maxYear-1)

		Cstanding_Y.then(function(d){
			filteredData=[]
			d.forEach(function(v){
				if(maxYear-1==v.key){
					v.values.forEach(function (t){
							filteredData.push([t.name,t.points,t.wins])
						})
					}})


				data2 = filteredData
				tabulate(data2,["Constructor","Points","Wins"],'#Constructor_table',constructor_select)

			})


}

function driver_select(d) {
	h1 = document.getElementById("plot__circuit");
	h1.scrollIntoView({block: "end", inline: "nearest",behavior: 'smooth'});
	driver_plot = d
	circuit_plot = 0
	constructor_plot = 0
	UpdatePlot_driver(driver_plot)

}

function constructor_select(d) {
	h1 = document.getElementById("plot__circuit");
	h1.scrollIntoView({block: "end", inline: "nearest",behavior: 'smooth'});
	driver_plot = 0
	circuit_plot = 0
	constructor_plot = d
	UpdatePlot_constructor(constructor_plot)
}

function UpdatePlot_driver(driver){
	if (driver != 0){
		var h1 = document.getElementById("Circuit");
		var h2 = document.getElementById("Circuit_stat");

		Dstanding_D.then(function(data){
			stats = [0,0,0,0,0,0,0,Infinity]
			filteredData=[]
			data.forEach(function(v){

				if(driver[0]==v.key){
					v.values.forEach(function (t){
							if (t.year>=minYear & t.year<maxYear){
								filteredData.push([t.year,parseInt(t.position),t.points,t.wins,t.podium,t.pole])
								stats[1] += parseInt(t.wins)
								stats[2] += parseInt(t.podium)
								stats[3] += parseInt(t.pole)
								stats[4] += parseInt(t.racedone)
								stats[6] += parseInt(t.points)


								if(parseInt(t.position)==1){
									stats[0]+=1
								}

								if(parseInt(t.position) < stats[7]){
									stats[7] = parseInt(t.position)

							}
						}}
					)}})
				data = filteredData

		if (data.length==0){

			h1.innerHTML = driver[0]
      var h2 = document.getElementById("nolap");
			h2.innerHTML = "Driver never participate during this time range"
			Plotsvg.selectAll("g,path").remove()
      txt = []
      maxs=[]
      stats = []
		}
		else{

			h1.innerHTML = driver[0]
      var h2 = document.getElementById("nolap");
      h2.innerHTML = ""

			// Add gauges
      stats[5] = Math.round(stats[1]/stats[4]*100 * 10) / 10 + "%"
			maxs = [7,95,165,98,332,50,3778]

      if (stats[7]==1){
        txt = ["Number of championship won","Number of races won","Number of podium","Number of pole","Number of race entries","Ratio of races won","Number of points"]
      }
      else {
        stats[0] = stats[7]
        txt = ["Best championship final position","Number of races won","Number of podium","Number of pole","Number of race entries","Ratio of races won","Number of points"]
      }
    }

    for (var i = 0; i < txt.length; i++) {
      var h2 = document.getElementById("gauge" + (i+1));
      h2.innerHTML = txt[i];
      var h2 = document.getElementById("gauge" + (i+1) + "_NUM");
      h2.innerHTML = stats[i];
    }
    for (var i = txt.length; i < 7; i++) {
      var h2 = document.getElementById("gauge" + (i+1));
      h2.innerHTML = '';
      var h2 = document.getElementById("gauge" + (i+1) + "_NUM");
      h2.innerHTML = "";
    }

      if (data.length!=0 & stats[7]!=1){
        stats[0] = 1/stats[7]
        maxs[0]=0.7
      }
      set_gauges(Math.min(stats["length"],7),stats,maxs)


if (data.length!=0){
			Plotx.domain(d3.extent(data, function(d) {return d[0];}))
			Ploty.domain([1,d3.extent(data, function(d) {return d[1];})[1]*1.1])

			Plotsvg.selectAll("g,path").remove()
			g_plot = Plotsvg.append("g")
					.attr("transform","translate(" + Plotmargin.left + "," + Plotmargin.top + ")");

			g_plot.append("g")
					 .attr("transform", "translate(0," + Plotheight + ")")
					 .call(d3.axisBottom(Plotx).ticks(data.length).tickFormat(d3.format(".0f")));

			g_plot.append("g")
			.attr("transform", "translate(" + Plotmargin.left + ",0)")
			 .call(d3.axisLeft(Ploty).ticks(d3.extent(data, function(d) {return d[1];})[1]));

			 var Tooltip = d3.select("#circuitdiv")
				.append("div")
				.style("opacity", 0)
				.attr("class", "tooltip")

				// Three function that change the tooltip when user hover / move / leave a cell
				var mouseover = function(d) {
					var html  = "<span  style='font-weight:bold;color:var(--Foreground)'> " +d[0]+" </span><br/>" +
					"<span  style='font-weight:bold;color:var(--Accent)'> Position: " +  d[1] +" </span><br/>" +
					"<span  style='font-weight:bold;color:var(--Foreground)'> Number of wins: " +  d[3] +", Number of points: "+ d[2]+" </span><br/>" +
					"<span  style='font-weight:bold;color:var(--Foreground)'> Number of podiums: " +  d[4] +", Number of poles: "+ d[5]+" </span>";

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
					.style("fill", "var(--Accent)")
					.on("mouseover", mouseover)
					.on("mouseout", mouseout);

			modifieddata=[]
			data.forEach(function(d){modifieddata.push([Plotx(d[0]),Ploty(d[1])]);})
			var lineGenerator = d3.line();
			var pathData = lineGenerator(modifieddata);

			Plotsvg.append("path")
				.attr("fill", "none")
				.attr("stroke", "var(--Accent)")
				.attr("stroke-width",1)
				.attr("transform", "translate(" + Plotmargin.left + "," + Plotmargin.top + ")")
				.attr("d",pathData)
			}
			})
			}}

function UpdatePlot_constructor(constructor){
	if (constructor != 0){
		var h1 = document.getElementById("Circuit");
		var h2 = document.getElementById("Circuit_stat");

		Cstanding_C.then(function(data){
			stats = [0,0,0,0,0,0,0,Infinity]
			filteredData=[]
			data.forEach(function(v){

				if(constructor[0]==v.key){
					v.values.forEach(function (t){
							if (t.year>=minYear & t.year<maxYear){
								filteredData.push([t.year,parseInt(t.position),t.points,t.wins,t.podium,t.pole])
                stats[1] += parseInt(t.wins)
								stats[2] += parseInt(t.podium)
								stats[3] += parseInt(t.pole)
								stats[4] += parseInt(t.racedone)
								stats[6] += parseInt(t.points)


								if(parseInt(t.position)==1){
									stats[0]+=1
								}

								if(parseInt(t.position) < stats[7]){
									stats[7] = parseInt(t.position)

							}
						}}
					)}})
				data = filteredData

		if (data.length==0){

			h1.innerHTML = constructor[0]
      var h2 = document.getElementById("nolap");
			h2.innerHTML = "Constructor never participate during this time range. "
			Plotsvg.selectAll("g,path").remove()
      txt = []
      maxs=[]
      stats = []
		}
		else{
      var h2 = document.getElementById("nolap");
      h2.innerHTML = ""
			h1.innerHTML = constructor[0]
      // Add gauges
      stats[5] = Math.round(stats[1]/stats[4]*100 * 10) / 10 +"%"
			maxs = [16,213,691,203,954,54.5,8346.5]

      if (stats[7]==1){
        txt = ["Number of championship won","Number of races won","Number of podium","Number of pole","Number of race entries","Ratio of races won","Number of points"]
      }
      else {
        stats[0] = stats[7]
        txt = ["Best championship final position","Number of races won","Number of podium","Number of pole","Number of race entries","Ratio of races won","Number of points"]
      }
    }

        for (var i = 0; i < txt.length; i++) {
          var h2 = document.getElementById("gauge" + (i+1));
          h2.innerHTML = txt[i];
          var h2 = document.getElementById("gauge" + (i+1) + "_NUM");
          h2.innerHTML = stats[i];
        }
        for (var i = txt.length; i < 7; i++) {
          var h2 = document.getElementById("gauge" + (i+1));
          h2.innerHTML = '';
          var h2 = document.getElementById("gauge" + (i+1) + "_NUM");
          h2.innerHTML = "";
        }

      if (data.length!=0 & stats[7]!=1){
        stats[0] = 1/stats[7]
        maxs[0]=0.7
      }

      set_gauges(Math.min(stats["length"],7),stats,maxs)


if (data.length!=0){
			Plotx.domain(d3.extent(data, function(d) {return d[0];}))
			Ploty.domain([1,d3.extent(data, function(d) {return d[1];})[1]*1.1])

			Plotsvg.selectAll("g,path").remove()
			g_plot = Plotsvg.append("g")
					.attr("transform","translate(" + Plotmargin.left + "," + Plotmargin.top + ")");

			g_plot.append("g")
					 .attr("transform", "translate(0," + Plotheight + ")")
					 .call(d3.axisBottom(Plotx).ticks(data.length).tickFormat(d3.format(".0f")));

			g_plot.append("g")
			.attr("transform", "translate(" + Plotmargin.left + ",0)")
			 .call(d3.axisLeft(Ploty).ticks(d3.extent(data, function(d) {return d[1];})[1]));

			 var Tooltip = d3.select("#circuitdiv")
				.append("div")
				.style("opacity", 0)
				.attr("class", "tooltip")

				// Three function that change the tooltip when user hover / move / leave a cell
				var mouseover = function(d) {
					var html  = "<span  style='font-weight:bold;color:var(--Foreground)'> " +d[0]+" </span><br/>" +
					"<span  style='font-weight:bold;color:var(--Accent)'> Position: " +  d[1] +" </span><br/>" +
					"<span  style='font-weight:bold;color:var(--Foreground)'> Number of wins: " +  d[3] +", Number of points: "+ d[2]+" </span>";

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
					.style("fill", "var(--Accent)")
					.on("mouseover", mouseover)
					.on("mouseout", mouseout);

			modifieddata=[]
			data.forEach(function(d){modifieddata.push([Plotx(d[0]),Ploty(d[1])]);})
			var lineGenerator = d3.line();
			var pathData = lineGenerator(modifieddata);

			Plotsvg.append("path")
				.attr("fill", "none")
				.attr("stroke", "var(--Accent)")
				.attr("stroke-width",1)
				.attr("transform", "translate(" + Plotmargin.left + "," + Plotmargin.top + ")")
				.attr("d",pathData)
			}
			})
			}}

function setTheme(themeName) {
    localStorage.setItem('theme', themeName);
    document.documentElement.className = themeName;
		Foreground_color = getComputedStyle(document.documentElement).getPropertyValue('--Foreground')
		Background_color = getComputedStyle(document.documentElement).getPropertyValue('--Background')
}

function changetheme() {
   if (localStorage.getItem('theme') === 'theme-dark'){
		 setTheme('theme-light');
		 document.getElementById("mode").className = "icon icon-mode-dark";
     opts["strokeColor"]= getComputedStyle(document.documentElement).getPropertyValue('--shady2')
     set_gauges(7,stats,maxs)


   } else {
		 setTheme('theme-dark');
		 document.getElementById("mode").className = "icon icon-mode-light";
     opts["strokeColor"]= getComputedStyle(document.documentElement).getPropertyValue('--shady2')
     set_gauges(7,stats,maxs)
   }
}

function set_gauges(n,stats,maxs){
  pos=0
if (n<5){
  pos=1
  console.log(pos)
}
  var gauges = document.getElementsByClassName("CanvasHeader");
  for (var i = 0; i < gauges.length; i++) {
       var el = gauges[i];
       el.getContext('2d').clearRect(0, 0, el.width, el.height);

     }

     for (var i = 0; i < n; i++) {
        console.log(pos)
         var el = gauges[i+pos];
         var gauge = new Donut(el).setOptions(opts);
         gauge.animationSpeed = 32;

         gauge.maxValue = maxs[i];
         gauge.animationSpeed = 1;
         gauge.set(stats[i]);
       }

     }
