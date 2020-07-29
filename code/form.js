async function submitForm(){
    var lats2ids = JSON.parse(await getLast2GameplayIdsFromServer());
    console.log(lats2ids.lastentry, lats2ids.secondlastentry)
    var fun = get_value_by_id("fun");
    var challenging = get_value_by_id("challenging");
    var frustrating = get_value_by_id("frustrating");
    var response = {
        A: lats2ids.secondlastentry,
        B: lats2ids.lastentry,
        fun: fun,
        challenging: challenging,
        frustrating: frustrating,
    }
    postQuestionResponseToServer(JSON.stringify(response));
}

function get_value_by_id(id){
    var element = document.getElementById(id);
    var value = element.options[element.selectedIndex].value;
    return value;
}