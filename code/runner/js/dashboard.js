
async function onDocumentLoad() {
        
    // ------------------------------------------------------
    // ----------------------- TABLE ------------------------
    // ------------------------------------------------------
    var games = JSON.parse(await getAllGameplaysFromServer());

    var table = document.getElementById("table");
    for(var i = 0; i < games.length; i++){
        var game = games[i]
        create_table_row(table, game);
    }

    function create_table_row(table, game){
        var row = table.insertRow();
        // ID
        create_table_cell(row, game._id)
        // dateTime
        create_table_cell(row, game.dateTime);
        // actualDistance
        create_table_cell(row, game.actualDistance);
        // gameOverScreen
        var cell4 = row.insertCell();
        var img = document.createElement("img");
        img.style = "max-height: 150px; max-width: 450px; object-fit: contain";
        img.src = game.gameOverScreen;
        if(game.invertedGameOver){
            img.classList.add("inverted");
        }
        cell4.append(img);
        row.onclick = function (){
            window.location.href = 'replay_instance.html?id=' + game._id;
        }
        // invertedGameOver
        create_table_cell(row, game.invertedGameOver);
        // nr_jumps
        create_table_cell(row, game.nr_jumps);
        // collisionObstacle
        create_table_cell(row, game.collisionObstacle.typeConfig.type);
        // newHighScore
        create_table_cell(row, game.newHighScore);
        // total nr obstacles
        create_table_cell(row, game.obstacles.length);
        // total nr events
        create_table_cell(row, game.events.length);
        // obstacletypes 1-3
        var obstacles = game.obstacleTypes.map(obstacleType => obstacleType.type).join("<br />");
        create_table_cell(row, obstacles);
        // parameters
        var p = game.parameters;
            // prepare obstacle_types_spec in correct order of obstacle_types array
        var OBSTACLE_TYPES_SPEC_order = [];
        p.OBSTACLE_TYPES.forEach(obstacle_type => {
            OBSTACLE_TYPES_SPEC_order.push([p.OBSTACLE_TYPES_SPEC[obstacle_type]])
        });
        var parameters = [
            "CLEAR_TIME: " + p.CLEAR_TIME,
            "SPEED: " + p.SPEED,
            "MAX+SPEED: " + p.MAX_SPEED,
            "MIN_GAP: " + p.MIN_GAP,
            "MAX_GAP: " + p.MAX_GAP,
            "NIGHT_MODE_ENABLED: " + p.NIGHT_MODE_ENABLED,
            "NIGHT_MODE_DISTANCE: " + p.NIGHT_MODE_DISTANCE,
            "OBSTACLE_TYPES: " + "(" + p.OBSTACLE_TYPES.join(", ") + ")",  
            "OBSTACLE_TYPES_SPEC: " + "(" + OBSTACLE_TYPES_SPEC_order.join(", ") + ")",  
        ]
        parameters = parameters.join("<br />");
        create_table_cell(row, parameters);

    }

    function create_table_cell(row, innerHTML){
        var cell = row.insertCell();
        cell.innerHTML = innerHTML;
    }

    
    // ------------------------------------------------------
    // ----------------------- STATS ------------------------
    // ------------------------------------------------------
    var number_of_gameplays = await getNumberOfGameplaysFromServer();
    var gameplays_element = document.getElementById("numberofgameplays")
    gameplays_element.innerHTML = "Total gameplays: " + number_of_gameplays;

    
    var number_of_questionresponses = await getNumberOfQuestionResponsesFromServer();
    var questionresponses_element = document.getElementById("numberofquestionresponses")
    questionresponses_element.innerHTML = "Total questionresponses: " + number_of_questionresponses;

    // ------------------------------------------------------
    // ------------------ SCORE HISTOGRAM -------------------
    // ------------------------------------------------------
    var scores = await getAllScoresFromServer();
    data = JSON.parse(scores);

    // set the dimensions and margins of the graph


    var min = floor(d3.min(data, d => d.actualDistance), 100),
        max = ceil(d3.max(data, d => d.actualDistance), 100),
        domain = [min, max],
        range = max - min,
        nBins = range/100;
    
    var margin = {top: 10, right: 200, bottom: 50, left: 40},
        fullwidth = nBins*15,
        fullheight = 500,
        width = fullwidth - margin.left - margin.right,
        height = fullheight - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3.select("#histogram_scores")
    .append("svg")
        .attr("width", fullwidth)
        .attr("height", fullheight)
    .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    // X axis: scale and draw
    var xScale = d3.scaleLinear()
        .domain(domain)
        .range([0, width]);
    var xAxis = d3.axisBottom()
        .scale(xScale)
        .ticks(nBins);

    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .selectAll("text")	                          // slant the axis labels
        .style("text-anchor", "start")
        .attr("dx", "0.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(45)");

    // set the parameters for the histogram
    var histogram = d3.histogram()
        .value(function(d) { return d.actualDistance; })    // I need to give the vector of value
        .domain(xScale.domain())                                            // then the domain of the graphic
        .thresholds(nBins);                                                 // then the numbers of bins

    // And apply this function to data to get the bins
    var bins = histogram(data);

    // Y axis: scale and draw:
    var yScale = d3.scaleLinear()
        .domain([0, ceil(d3.max(bins, d => d.length), 20)])   // d3.hist has to be called before the Y axis
        .range([height, 0]);
    var yAxis = d3.axisLeft()
        .scale(yScale);

    svg.append("g")
        .call(yAxis);

    // Add a tooltip div. Here I define the general feature of the tooltip: stuff that do not depend on the data point.
    // Its opacity is set to 0: we don't see it by default.
    var tooltip = d3.select("#histogram_scores")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "black")
    .style("color", "white")
    .style("border-radius", "5px")
    .style("padding", "10px")

    // A function that change this tooltip when the user hover a point.
    // Its opacity is set to 1: we can now see it. Plus it set the text and position of tooltip depending on the datapoint (d)
    var distance = 50;
    var showTooltip = function(d) {
        tooltip
        .transition()
        .duration(100)
        .style("opacity", 1)
        tooltip
        .html(`Range: ${d.x0} - ${d.x1}<br>Count: ${d.length}`) // +  " + d.x0 + " - " + d.x1 + "\n" )
        .style("left", (d3.mouse(this)[0]) + "px")
        .style("top", (d3.mouse(this)[1]) + "px")
    }
    var moveTooltip = function(d) {
        tooltip
        //.style("left", (d3.mouse(this)[0]) + "px")
        //.style("top", (d3.mouse(this)[1]) + "px")
        .style("top", d3.event.pageY - 10 + "px")
        .style("left", d3.event.pageX + 10 + "px");
    }

    // A function that change this tooltip when the leaves a point: just need to set opacity to 0 again
    var hideTooltip = function(d) {
        tooltip
        .transition()
        .duration(100)
        .style("opacity", 0)
    }

    // append the bar rectangles to the svg element
    svg.selectAll("rect")
        .data(bins)
        .enter()
        .append("rect")
            .attr("x", 1)
            .attr("transform", function(d) { return "translate(" + xScale(d.x0) + "," + yScale(d.length) + ")"; })
            .attr("width", function(d) { return xScale(d.x1) - xScale(d.x0) -1 ; })
            .attr("height", function(d) { return height - yScale(d.length); })
            .style("fill", "#69b3a2")
            .on("mouseover", showTooltip )
            .on("mousemove", moveTooltip )
            .on("mouseleave", hideTooltip )


    // ------------------------------------------------------
    // ------------ COLLISION OBSTACLE PIE CHART ------------
    // ------------------------------------------------------


    function make_pie_chart(id, data, percentages){

        // set the dimensions and margins of the graph
        var width = 1000
            height = 450
            margin = 40

        // The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
        var radius = Math.min(width, height) / 2 - margin

        // append the svg object to the div called 'my_dataviz'
        var svg = d3.select(id)
        .append("svg")
            .attr("width", width)
            .attr("height", height)
        .append("g")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

        // set the color scale
        var color = d3.scaleOrdinal()
        .domain(Object.keys(data))//["a", "b", "c", "d", "e", "f", "g", "h"])
        .range(d3.schemeDark2);

        // Compute the position of each group on the pie:
        var pie = d3.pie()
        .sort(null) // Do not sort group by size
        .value(function(d) {return d.value; })
        var data_ready = pie(d3.entries(data))
        console.log(data_ready);

        // The arc generator
        var arc = d3.arc()
        .innerRadius(radius * 0.5)         // This is the size of the donut hole
        .outerRadius(radius * 0.8)

        // Another arc that won't be drawn. Just for labels positioning
        var outerArc = d3.arc()
        .innerRadius(radius * 0.9)
        .outerRadius(radius * 0.9)

        // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
        svg
        .selectAll('allSlices')
        .data(data_ready)
        .enter()
        .append('path')
        .attr('d', arc)
        .attr('fill', function(d){ return(color(d.data.key)) })
        .attr("stroke", "white")
        .style("stroke-width", "2px")
        .style("opacity", 0.7)

        // Add the polylines between chart and labels:
        svg
        .selectAll('allPolylines')
        .data(data_ready)
        .enter()
        .append('polyline')
            .attr("stroke", "black")
            .style("fill", "none")
            .attr("stroke-width", 1)
            .attr('points', function(d) {
            var posA = arc.centroid(d) // line insertion in the slice
            var posB = outerArc.centroid(d) // line break: we use the other arc generator that has been built only for that
            var posC = outerArc.centroid(d); // Label position = almost the same as posB
            var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2 // we need the angle to see if the X position will be at the extreme right or extreme left
            posC[0] = radius * 0.95 * (midangle < Math.PI ? 1 : -1); // multiply by 1 or -1 to put it on the right or on the left
            return [posA, posB, posC]
            })

        // Add the polylines between chart and labels:
        svg
        .selectAll('allLabels')
        .data(data_ready)
        .enter()
        .append('text')
            .text( function(d) {return d.data.key} )
            .attr('transform', function(d) {
                var pos = outerArc.centroid(d);
                var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
                pos[0] = radius * 0.99 * (midangle < Math.PI ? 1 : -1);
                return 'translate(' + pos + ')';
            })
            .style('text-anchor', function(d) {
                var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
                return (midangle < Math.PI ? 'start' : 'end')
            })

        // add percentages
        svg
            .selectAll('allLabels')
            .data(data_ready)
            .enter()
            .append('text')
                .text( function(d) {  return + percentages[d.data.key].toFixed(2) *100 + "%" } )
                .attr('transform', function(d) {
                    var pos = outerArc.centroid(d);
                    var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
                    pos[0] = radius * 0.99 * (midangle < Math.PI ? 1 : -1);
                    return 'translate(' + pos + ')';
                })
                .style('text-anchor', function(d) {
                    var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
                    return (midangle < Math.PI ? 'start' : 'end')
                })
                .attr("dy", "1em") // you can vary how far apart it shows up

    }

    

    var collisionObstacles = await getAllCollisionObstaclesFromServer();
    collisionObstacles = JSON.parse(collisionObstacles);

    var d = {};
    for(var i = 0; i < collisionObstacles.length; i++){
        var collisionObstacle = collisionObstacles[i];
        var type = collisionObstacle.collisionObstacle.typeConfig.type
        if(type in d){
            d[type] = d[type] + 1;
        } else {
            d[type] = 1;
        }
    }
    var data_collisions = d;
    var percentages_collisions = get_percentages_from_count_dict(data_collisions);


    make_pie_chart("#piechart_collisionobstacle", data_collisions, percentages_collisions);

    // ------------------------------------------------------
    // ------------  INVERTED GAMEOVER PIE CHART ------------
    // ------------------------------------------------------


    var invertedGameOvers = await getAllInvertedGameOversFromServer();
    invertedGameOvers = JSON.parse(invertedGameOvers);
    console.log(invertedGameOvers)
    var d = {};
    for(var i = 0; i < invertedGameOvers.length; i++){
        var invertedGameOver = invertedGameOvers[i];
        var type = invertedGameOver.invertedGameOver;
        if(type in d){
            d[type] = d[type] + 1;
        } else {
            d[type] = 1;
        }
    }
    var data_gameover = d;
    var percentages_gameover = get_percentages_from_count_dict(data_gameover);

    make_pie_chart("#piechart_invertedgameover", data_gameover, percentages_gameover);
    



}

document.addEventListener('DOMContentLoaded', onDocumentLoad);

