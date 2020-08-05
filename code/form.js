async function submitForm(){
    var time = stop_form_timer();
    var lats2ids = JSON.parse(await getLast2GameplayIdsFromServer());  
    var fun = get_radiobutton_value_by_name("fun");
    var challenging = get_radiobutton_value_by_name("challenging");
    var frustrating = get_radiobutton_value_by_name("frustrating");
    var response = {
        A: lats2ids.secondlastentry,
        B: lats2ids.lastentry,
        fun: fun,
        challenging: challenging,
        frustrating: frustrating,
        time: time
    }
    clear_screens();
    postQuestionResponseToServer(JSON.stringify(response));
    var evt = document.createEvent("Event");
    evt.initEvent("FORMSUBMIT", true, true);
    document.dispatchEvent(evt);
}

function clear_screens(){
    remove_last_child("screenA");
    remove_last_child("screenB");
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
    console.log(name, value)
    return value
}

async function generate_form(){
    // dynamically generate form based on 2 past games
    var last2games = JSON.parse(await getLast2GameplaysFromServer());

    add_image_to_element(last2games.secondlastentry.gameOverScreen, "screenA");
    add_image_to_element(last2games.lastentry.gameOverScreen, "screenB");
}

function add_image_to_element(img_src, element_id){
    var img = document.createElement("img");
    img.src = img_src;
    var element = document.getElementById(element_id);
    // element.innerHTML += img;
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
    document.getElementById('form').style.display = 'block';
}

function hideForm_showGame(){
    document.getElementsByClassName("onlyforchrome")[0].style.display = 'block';
    document.getElementsByClassName("runner-container")[0].style.display = 'block';
    document.getElementById('form').style.display = 'none';
}