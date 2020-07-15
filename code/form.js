async function submitForm(){
    var fun = get_value("fun");
    var challenging = get_value("challenging");
    var frustrating = get_value("frustrating");
    var response = {
        fun: fun,
        challenging: challenging,
        frustrating: frustrating,
    }
    logger.store("response",response)
    var serial = logger.serialize();
    postToServer(serial);
}

function get_value(id){
    var element = document.getElementById(id);
    var value = element.options[element.selectedIndex].value;
    return value;
}