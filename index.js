var svg = d3.select("svg"), //selects the first SVG. SVG can be modified using attributes.
    margin = {top: 20, right: 80, bottom: 30, left: 50}, //creates a margin
    width = svg.attr("width") - margin.left - margin.right, //length of the graph, based of the margin
    height = svg.attr("height") - margin.top - margin.bottom, //height of the graph, based of the margin
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")"); //Makes a group of transform and translate

var parseTime = d3.timeParse("%Y%m%d"); //Format to parse time. Returns year, month, date. 

var x = d3.scaleTime().range([0, width]), //Creates a linear scale for time. 
    y = d3.scaleLinear().range([height, 0]), //Creates a new scale, based on height.
    z = d3.scaleOrdinal(d3.schemeCategory10); //Creates ordinal scale and color scheme.

var line = d3.line() //Create a new line
    .curve(d3.curveBasis) //Makes it possible to curve the line
    .x(function(d) { return x(d.date); }) //set dates on x axis
    .y(function(d) { return y(d.temperature); }); //set temperature on y axis

d3.csv("data.csv", type, function(error, data) {
  if (error) throw error; //Takes data from the CSV. When there is a error, nothing will show

  var cities = data.columns.slice(1).map(function(id) {
    return { 
      id: id,
      values: data.map(function(d) {
        return {date: d.date, temperature: d[id]};
      })
    };
  });//

  x.domain(d3.extent(data, function(d) { return d.date; })); //calculates the minimum and maximum value of an array on the x axis.

  y.domain([
    d3.min(cities, function(c) { return d3.min(c.values, function(d) { return d.temperature; }); }),
    d3.max(cities, function(c) { return d3.max(c.values, function(d) { return d.temperature; }); })
  ]); //The .domain function calculates the maximum and minimum value, as the range for the y axis.


  z.domain(cities.map(function(c) { return c.id; })); //Calculates the minumum and maximum of the graph-line(z axis)

  g.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x)); //Set all the attributes in an group

  g.append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(y))
      .append("text") //Makes text
      .attr("transform", "rotate(-90)") //Rotates the label 'temperature'
      .attr("y", 6)
      .attr("dy", "0.71em") //font size of the label
      .attr("fill", "#000") //color of the label 'temperature'
      .text("Temperature, ºC"); //Set all the attributes in an group

  var temp = g.selectAll(".temp")
      .data(cities)
      .enter().append("g")
      .attr("class", "temp");//selects all temp elements, add them in a group.

  temp.append("path") 
      .attr("class", "line")
      .attr("d", function(d) { return line(d.values); })
      .style("stroke", function(d) { return z(d.id); }); //appends a path to temp element

  temp.append("text")
      .datum(function(d) { return {id: d.id, value: d.values[d.values.length - 1]}; })
      .attr("transform", function(d) { return "translate(" + x(d.value.date) + "," + y(d.value.temperature) + ")"; })
      .attr("x", 3)
      .attr("dy", "0.35em")
      .style("font", "10px sans-serif")
      .text(function(d) { return d.id; });//appends text to temp element
});

function type(d, _, columns) {
  d.date = parseTime(d.date); //Set correct date for every column in the data.
  for (var i = 1, n = columns.length, c; i < n; ++i) d[c = columns[i]] = +d[c];
  return d;
}//Loops thru all data to display the correct time format.