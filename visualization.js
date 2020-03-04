// The svg
var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

// Map and projection
var projection = d3.geoMercator()
    .center([0,20])                // GPS of location to zoom on
    .scale(200)                       // This is like the zoom
    .translate([ width/2, height/2 ])

d3.queue()
    .defer(d3.json, "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")  // World shape
    .defer(d3.csv, "covid19_confirmed.csv") // Position of circles
    .defer(d3.csv, "world_cities.csv")
    .await(ready);

function ready(error, dataGeo, gpsLocSurfer, worldCities) {

  // Draw the map
  svg.append("g")
      .selectAll("path")
      .data(dataGeo.features)
      .enter()
      .append("path")
        .attr("fill", "#b8b8b8")
        .attr("d", d3.geoPath()
            .projection(projection)
        )
      .style("stroke", "none")
      .style("opacity", .3)

  // Create a color scale
  var allContinent = d3.map(gpsLocSurfer, function(d){return(d.homecontinent)}).keys()
  
  var color = d3.scaleOrdinal()
    .domain(allContinent)
    .range(d3.schemePaired);

  // Add a scale for bubble size
  var valueExtent = d3.extent(gpsLocSurfer, function(d) { return +d.n; })
  var size = d3.scaleSqrt()
    .domain(valueExtent)  // What's in the data
    .range([ 1, 50])  // Size in pixel
    
  // Add circles:
  svg
    .selectAll("myCircles")
    .data(gpsLocSurfer.sort(function(a,b) { return +b.n - +a.n }).filter(function(d,i){ return i<1000 }))
    .enter()
    .append("circle")
      .attr("cx", function(d){ return projection([+d.long, +d.lat])[0] })
      .attr("cy", function(d){ return projection([+d.long, +d.lat])[1] })
      .attr("r", function(d){ return size(+d.n) })
      .style("fill", "yellow")
    //   .style("fill", function(d){ return color(d.homecontinent) })
      .attr("stroke", function(d){ 
          if(d.n>30)
          {
              return "white"
            }else{return "none"}  })
      .attr("stroke-width", 1)
      .attr("fill-opacity", .7)
      
  svg.selectAll(".city-circle")
    .data(worldCities)
    .enter().append("circle")
    .attr("r", 2)
    .attr("cx", function (d) {
        var coords = projection([d.long, d.lat])
        return coords[0];
    })
    .attr("cy", function (d) {
        var coords = projection([d.long, d.lat])
        return coords[1];
    })
      
  svg.selectAll('.city-label')
    .data(worldCities)
    .enter().append("text")
    .attr('class', 'city-label')
    .attr("x", function (d) {
        var coords = projection([d.long, d.lat])
        return coords[0];
    })
    .attr("y", function (d) {
        var coords = projection([d.long, d.lat])
        return coords[1];
    })
    .text(function (d) {
        return d.name;
    })
    .attr('dx', 5)
    .attr('dy', 2)
    

}