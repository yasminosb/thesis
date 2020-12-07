async function onDocumentLoad() {
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

    var number_of_gameplays = await getNumberOfGameplaysFromServer();
    var gameplays_element = document.getElementById("numberofgameplays")
    gameplays_element.innerHTML = "Total gameplays: " + number_of_gameplays;

 
    //d3 stuff
    var scores = await getAllScoresFromServer();
    data = JSON.parse(scores);

    // set the dimensions and margins of the graph
    var margin = {top: 10, right: 30, bottom: 30, left: 40},
        fullwidth = 1000,
        fullheight = 400,
        width = fullwidth - margin.left - margin.right,
        height = fullheight - margin.top - margin.bottom;


    var min = floor(d3.min(data, d => d.actualDistance), 100),
        max = ceil(d3.max(data, d => d.actualDistance), 100),
        domain = [min, max],
        range = max - min,
        nBins = range/100;
    
        console.log(domain.toString());
        console.log(nBins);

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
        .domain([0, d3.max(bins, d => d.length)])   // d3.hist has to be called before the Y axis
        .range([height, 0]);
    var yAxis = d3.axisLeft()
        .scale(yScale);
    svg.append("g")
        .call(yAxis);

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

}

document.addEventListener('DOMContentLoaded', onDocumentLoad);

