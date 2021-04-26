var margin = {top: 10, right: 10, bottom: 40, left: 10}
var width = 1000 - margin.left - margin.right;
var height = 100 - margin.top - margin.bottom;

console.log(width)

var x = d3.scaleTime()
    .domain([new Date(1950, 1, 1), new Date(2021,1, 1) - 1])
    .rangeRound([0, width]);

var svg = d3.select("#timescale").attr("transform", "translate(" + margin.left + ",0)")



svg.append("g")
    .attr("class", "axis axis--grid")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x)
        .ticks(d3.timeYear)
        .tickSize(-height)
        .tickFormat(function() { return null; }))
  .selectAll(".tick")
    .classed("tick--minor", function(d) { return d3.timeYear(); });

svg.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x)
        .ticks(d3.timeYear)
        .tickPadding(0))
    .attr("text-anchor", null)
  .selectAll("text")
    .attr("x", 6).attr("transform", "rotate(90) translate(0,-10)")




svg.append("g")
    .attr("class", "brush")
    .call(d3.brushX()
        .extent([[0, 0], [width, height]])
        .on("end", brush));

function brush() {
  if (!d3.event.sourceEvent) return; // Only transition after input.
  if (!d3.event.selection) return; // Ignore empty selections.
  var d0 = d3.event.selection.map(x.invert),
      d1 = d0.map(d3.timeYear.round);

  // If empty when rounded, use floor & ceil instead.
  if (d1[0] >= d1[1]) {
    d1[0] = d3.timeYear.floor(d0[0]);
    d1[1] = d3.timeYear.offset(d1[0]);
  }

  d3.select(this).transition().call(d3.event.target.move, d1.map(x));
}
