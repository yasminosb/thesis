async function onDocumentLoad() {
    var games = JSON.parse(await getAllGameplaysFromServer());

    var table = document.getElementById("table");
    for(var i = 0; i < games.length; i++){
        var game = games[i]
        create_table_row(table, game);
    }

    function create_table_row(table, game){
        var row = table.insertRow();
        var cell1 = row.insertCell();
        cell1.innerHTML = game._id;
        var cell2 = row.insertCell();
        cell2.innerHTML = game.dateTime;
        var cell3 = row.insertCell();
        cell3.innerHTML = game.actualDistance;
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
    }

    var number_of_gameplays = await getNumberOfGameplaysFromServer();
    var gameplays_element = document.getElementById("numberofgameplays")
    gameplays_element.innerHTML = "Total:" + number_of_gameplays;

 
}

document.addEventListener('DOMContentLoaded', onDocumentLoad);

