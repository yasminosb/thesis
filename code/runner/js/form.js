async function submitForm(){
    validation = check_all_radiobuttons();
    if(validation){
        var time = stop_form_timer();
        var lats2ids = JSON.parse(await getLast2GameplayIdsFromServer());  
        var values = get_form_values();
        var response = {
            secondlastentry: lats2ids.secondlastentry,
            lastentry: lats2ids.lastentry,
            fun: values.fun,
            challenging: values.challenging,
            frustrating: values.frustrating,
            time: time
        }
        reset_form();
        postQuestionResponseToServer(JSON.stringify(response));
        dispatchDocumentEvent("FORMSUBMIT");
    } else {
        show_warning();
    }   
}


var radiobutton_names = ["fun", "challenging","frustrating"];

function get_form_values(){
    var dict = {};
    for(var i = 0; i < radiobutton_names.length; i++){
        var name = radiobutton_names[i];
        var value = get_radiobutton_value_by_name(name);
        dict[name] = value;
    }
    return dict;
}

function reset_form(){
    clear_screens();
    clear_all_radio_buttons();
    hide_warning();
}

function show_warning(){
    document.getElementsByClassName("warning-message")[0].style.display = 'block';
}

function hide_warning(){
    document.getElementsByClassName("warning-message")[0].style.display = 'none';
}

function clear_all_radio_buttons(){
    var tags = document.getElementsByTagName("input");
    for(i = 0; i < tags.length; i++){
        if(tags[i].type === 'radio'){
            tags[i].checked = false;
        }
    }
}

function radiobuttons_checked(){
    var dict = {}
    for(var i = 0; i < radiobutton_names.length; i++){
        var checked = is_radiobutton_checked(radiobutton_names[i])
        dict[radiobutton_names[i]] = checked;
    }
    return dict;
}

function all_dictvalues_true(dict){
    var keys = Object.keys(dict);
    for(var i = 0; i < keys.length; i++){
        var key = keys[i];
        var value = dict[key];
        if(!value){
            return false;
        }
    }
    return true;
}

function check_all_radiobuttons(){
    var checked = radiobuttons_checked();
    var validation = all_dictvalues_true(checked);
    return validation;
}

function is_radiobutton_checked(radio_name){
    var r = document.getElementsByName(radio_name);
    for(var i = 0; i < r.length; i++){
        if(r[i].checked){
            return true;
        }
    }
    return false;
}


var screen_ids = ["screenA", "screenB"];
function clear_screens(){
    for(var i = 0; i < screen_ids.length; i++){
        var screen_id = screen_ids[i];
        remove_last_child(screen_id);
    }
}

function remove_last_child(element_id){
    var element = document.getElementById(element_id)
    element.removeChild(element.lastChild);
}


// not used anymore
function get_select_value_by_id(id){
    var element = document.getElementById(id);
    var value = element.options[element.selectedIndex].value;
    return value;
}

function get_radiobutton_value_by_name(name){
    var value = document.querySelector(`input[name="${name}"]:checked`).value;
    return value
}

async function generate_form(){
    // dynamically generate form based on 2 past games
    var last2games = JSON.parse(await getLast2GameplaysFromServer());
    var gameA = last2games.secondlastentry;
    var gameB = last2games.lastentry;
    
    add_image_to_element(gameA.gameOverScreen, "screenA", gameA.invertedGameOver);
    add_image_to_element(gameB.gameOverScreen, "screenB", gameB.invertedGameOver);
}

function add_image_to_element(img_src, element_id, inverted){
    var img = document.createElement("img");
    img.src = img_src;
    if(inverted){
        img.classList.add("inverted");
    }
    var element = document.getElementById(element_id);
    element.append(img);
}

var start_time = 0;
function start_form_timer(){
    start_time = performance.now();
}

function stop_form_timer(){
    var now = performance.now();
    var time_elapsed = now - start_time;
    return time_elapsed;
}

function hideGame_showForm(){
    document.getElementsByClassName("onlyforchrome")[0].style.display = 'none';
    document.getElementsByClassName("runner-container")[0].style.display = 'none';
    document.getElementById("instructions").style.display = 'none';
    document.getElementById('form').style.display = 'block';
}

function hideForm_showGame(){
    document.getElementsByClassName("onlyforchrome")[0].style.display = 'block';
    document.getElementsByClassName("runner-container")[0].style.display = 'block';
    document.getElementById("instructions").style.display = 'block';
    document.getElementById('form').style.display = 'none';
}