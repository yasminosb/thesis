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
    gameplays_element.innerHTML = "Total:" + number_of_gameplays;

 
}

document.addEventListener('DOMContentLoaded', onDocumentLoad);

