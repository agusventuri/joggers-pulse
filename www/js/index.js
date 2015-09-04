var timeLap = 0;
var stop = 0;
var times = 0;
var tipos = 0;
var secOld = -1;
var barPercentages = [100];
var barTipos = [7];
var nowEditingId = "0";
var nowEditing = false;

// Wait for Cordova to load
document.addEventListener("deviceready", onDeviceReady, false);

// Cordova is ready
function onDeviceReady() {
    var db = window.openDatabase("Database", "1.0", "Pulse Database", 200000);
    db.transaction(populateDB, errorCB, successCB);
}

// Populate the database
function populateDB(tx) {
    tx.executeSql('CREATE TABLE IF NOT EXISTS pulseDB (' +
        'id INTEGER PRIMARY KEY AUTOINCREMENT, ' +
        'name TEXT, ' +
        'description TEXT, ' +
        'timeDefault INT, ' +
        'percentages TEXT, ' +
        'tipos TEXT)');
}

// Query the database
function queryDB(tx) {
    tx.executeSql('SELECT * FROM pulseDB', [], querySuccess, errorCB);
}

// Query the database by ID
function queryById(tx) {
    tx.executeSql('SELECT * FROM pulseDB WHERE id="' + nowEditingId + '"', [], run, errorCB);
}

//Delete query
function deleteRow(tx) {
    tx.executeSql('DELETE FROM pulseDB WHERE id = ' + nowEditingId, [], queryDB, errorCB);
}

// Creates a string with all the cards from the DB and arranges them on front page
function querySuccess(tx, results) {
    var tblText='';
    var len = results.rows.length;
    for (var i = 0; i < len; i++) {
        var idExercise = results.rows.item(i).id;
        var name = results.rows.item(i).name;
        var description = results.rows.item(i).description;
        var timeDefault = results.rows.item(i).timeDefault;
        var percentages = results.rows.item(i).percentages.toString();
        var tipos = results.rows.item(i).tipos.toString();
        //var supporttingText = description + " - Duracion: " + timeDefault + "'";

        tblText += "<div class='cards mdl-card mdl-shadow--2dp demo-card-square'><div class='mdl-card__title mdl-card--expand'><button id='edit"+idExercise+"' onclick=\"goEditPage('"+idExercise+"','"+ name +"','"+description+"','"+timeDefault+"','"+percentages+"','"+tipos+"');\" class='edit mdl-button mdl-js-button mdl-button--icon mdl-js-ripple-effect'><i class='material-icons md-light'>edit</i></button><h2 class='mdl-card__title-text'>" + name + "</h2></div><div class='mdl-card__supporting-text'>" + description + " - " + timeDefault + " Minutos</div><div class='mdl-card__actions mdl-card--border'><button id='buttonEditRun"+ idExercise +"' class='botona mdl-button mdl-js-button mdl-button--icon mdl-button--colored mdl-js-ripple-effect'><i class='material-icons md-lightº'>input</i></button><button id='buttonRun"+ idExercise +"' class='boton mdl-button mdl-js-button mdl-button--icon mdl-button--colored mdl-js-ripple-effect'><i class='material-icons md-lightº'>directions_run</i></button></div></div>";
    }
    document.getElementById("cards").innerHTML =tblText;
}

/*function crear() {
    var idExercise = 1;
    var name = "A";
    var description = "B";
    var timeDefault = 60;
    var percentages = ["50","50"];
    var tipos = ["0","1"];

    var tblText = "<div class='cards mdl-card mdl-shadow--2dp demo-card-square'><div class='mdl-card__title mdl-card--expand'><button id='edit"+idExercise+"' onclick=\"goEditPage('"+idExercise+"','"+ name +"','"+description+"','"+timeDefault+"','"+percentages+"','"+tipos+"');\" class='edit mdl-button mdl-js-button mdl-button--icon mdl-js-ripple-effect'><i class='material-icons md-light'>edit</i></button><h2 class='mdl-card__title-text'>" + name + "</h2></div><div class='mdl-card__supporting-text'>" + description + " - " + timeDefault + " Minutos</div><div class='mdl-card__actions mdl-card--border'><button id='buttonEditRun"+ idExercise +"' class='botona mdl-button mdl-js-button mdl-button--icon mdl-button--colored mdl-js-ripple-effect'><i class='material-icons md-lightº'>input</i></button><button id='buttonRun"+ idExercise +"' class='boton mdl-button mdl-js-button mdl-button--icon mdl-button--colored mdl-js-ripple-effect'><i class='material-icons md-lightº'>directions_run</i></button></div></div>";


    document.getElementById("cards").innerHTML =tblText;
}*/

// Transaction error callback
function errorCB(err) {
    alert("Error processing SQL: "+err.code);
}

// Transaction success callback
function successCB() {
    var db = window.openDatabase("Database", "1.0", "Pulse Database", 200000);
    db.transaction(queryDB, errorCB);
}

// Decides, based on the value of 'nowEditing' variable, if to insert a new plan or edit an existing one
function goInsertOrEdit() {
    if (nowEditing) {
        goEdit();
    } else {
        goInsert();
    }
}

function goInsert() {
    var db = window.openDatabase("Database", "1.0", "Pulse Database", 200000);
    db.transaction(insertDB, errorCB, successCB);
}

//Insert query
function insertDB(tx) {
    tx.executeSql('INSERT INTO pulseDB (name,description,timeDefault,percentages,tipos) VALUES (' +
        '"' + document.getElementById("addEditName").value +'",' +
        '"' + document.getElementById("addEditDescription").value +'",' +
        '"' + document.getElementById("addEditTimeDefault").value +'",' +
        '"' + barPercentages +'",' +
        '"' + barTipos + '")');
    cleanAddEditPage();
    document.getElementById("cardsPage").style.display = "block";
    document.getElementById("addEditCard").style.display = "none";
}

function goEdit() {
    var db = window.openDatabase("Database", "1.0", "Pulse Database", 200000);
    db.transaction(editRow, errorCB);
    document.getElementById('qrpopup').style.display='none';
    document.getElementById('main').style.display='block';
}

//Edits a row in the DB
function editRow(tx) {
    tx.executeSql('UPDATE pulseDB SET ' +
        'name ="'+document.getElementById("addEditName").value + '", ' +
        'description ="'+document.getElementById("addEditDescription").value + '", ' +
        'timeDefault= "'+document.getElementById("addEditTimeDefault").value+ '", ' +
        'percentages= "'+barPercentages+ '", ' +
        'tipos= "'+barTipos+ '" ' +
        'WHERE id = '+ nowEditingId, [], queryDB, errorCB);
    document.getElementById("cardsPage").style.display = "block";
    document.getElementById("addEditCard").style.display = "none";
}

// Prepares the DB to delete a row
function goDelete() {
    var db = window.openDatabase("Database", "1.0", "Pulse Database", 200000);
    db.transaction(deleteRow, errorCB);
    document.getElementById('qrpopup').style.display='none';
    document.getElementById('main').style.display='block';
}

//Show the edit page with the data from a card to edit
function goEditPage(id,name,description,timeDefault,percentages,tipos) {
    alert(percentages);
    alert(tipos);
    nowEditingId=id;
    nowEditing = true;
    document.getElementById("addEditCard").style.display="block";
    document.getElementById("cardsPage").style.display="none";
    document.getElementById("addEditName").value = name;
    document.getElementById("addEditDescription").value = description;
    document.getElementById("addEditTimeDefault").value = timeDefault;
    document.getElementById("addEditSaveBtn").value = "Guardar";
    barPercentages = percentages.split(",");
    barTipos = tipos.split(",");

    alert(barPercentages);
    alert(barTipos);
    arrangePercentages();
}

function goRun() {
    var db = window.openDatabase("Database", "1.0", "Pulse Database", 200000);
    db.transaction(queryById, errorCB);
}

//Modifies sliders values
function modSliderVal(id) {
    storage.setItem(id,document.getElementById(id + "Points").value);
}

//Prepares things to start the running function
function run(tx,results) {
    document.getElementById('qrpopup').style.display = 'none';
    document.getElementById('runView').style.display = 'block';

    var name = results.rows.item(0).name;
    var time = results.rows.item(0).timeDefault * 60;
    var percentages = results.rows.item(0).percentages.split(",");
    tipos = results.rows.item(0).tipos.split(",");

    times = percentages;
    for (var i=0;i<percentages.length;i++) {
        times [i] = time/100*percentages[i];
    }

    for (var a=1;a<times.length;a++) {
        times [a] += times[a-1];
    }

    document.getElementById('planName').innerHTML = name;
    document.getElementById('planTime').innerHTML = "Tiempo: " + time;
    document.getElementById('planPercentages').innerHTML = "Porcentajes: " + percentages;
    document.getElementById('planTipos').innerHTML = "Tipos: " + tipos;

    document.getElementById("tipo").innerHTML = "Tipo: " + tipos[timeLap];

    start = new Date();
    chrono();
}

//Chronometer that does stuff
function chrono() {
    stop = times[timeLap];
    //SE LE AGREGO EL VAR PORQUE SEGUN EL IDE LO NECESITABA
    var end = new Date();
    var diff = end - start;
    var diff = new Date(diff);

    var msec = diff.getMilliseconds(),
        sec = diff.getSeconds(),
        min = diff.getMinutes(),
        hr = diff.getHours()-diff.getHours();

    if (min < 10) {
        min = "0" + min;
    }
    if (sec < 10) {
        sec = "0" + sec;
    }
    if (msec < 10) {
        msec = "00" + msec;
    } else if (msec < 100) {
        msec = "0" + msec;
    }

    if (sec == stop) {
        timeLap++;
        document.getElementById("tipo").innerHTML = tipos[timeLap];
    }

    if (sec > secOld) {
        secOld++;
        if (secOld%2 == false){
            playMP3();
        }
    }

    document.getElementById("chronotime").innerHTML = hr + ":" + min + ":" + sec + ":" + msec;
    //SE LE AGREGO EL VAR PORQUE SEGUN EL IDE LO NECESITABA
    var timerID = setTimeout("chrono()", 0);

    if (times.length == timeLap) {
        document.getElementById("tipo").innerHTML = tipos[timeLap-1];
        document.getElementById("chronotime").innerHTML = "0:00:00.000";
        clearTimeout(timerID);
    }
}

function playMP3() {
    var mp3URL = getMediaURL("sounds/pop" + tipos[timeLap] + ".mp3");
    var media = new Media(mp3URL, null, mediaError);
    media.play();
}

function getMediaURL(s) {
    if(device.platform.toLowerCase() === "android") return "/android_asset/www/" + s;
    return s;
}

function mediaError(e) {
    alert('Media Error');
    alert(JSON.stringify(e));
}

//Adds a percentage to the list of percentages and refreshes the bar
function addPercentage() {
    var newPercentage = document.getElementById("addEditPercentage").value;
    if (newPercentage > barPercentages[0]) {
        return alert("Te excedes del valor máximo");
    }
    barPercentages.push(newPercentage);
    barPercentages[0] = barPercentages[0] - newPercentage;

    var select = document.getElementById("selectTipos");
    var newTipo = select.options[select.selectedIndex].value;
    barTipos.push(newTipo);

    arrangePercentages();
}

//Arranges the percentages according to their position and creates a colored bar with them
function arrangePercentages() {
    //console.log("Perc: " + barPercentages + " - " + "Tipos: " +barTipos);
    var cambiado = true;
    var primerPercentage = barPercentages.shift();
    var primerTipo = barTipos.shift();
    //console.log("Perc: " + barPercentages + " - " + "Tipos: " +barTipos);
    if (primerPercentage != 0) {
        barPercentages.push(primerPercentage);
        barTipos.push(primerTipo);
        cambiado = false;
    }
    //console.log("Perc: " + barPercentages + " - " + "Tipos: " +barTipos);

    var barText = '<div class="bar-general">';
    var contador = 0;
    var color = "";
    for (var i = 0; i < barPercentages.length; i++) {
        switch(barTipos[i]) {
            case "0":
                color = "#4FC3F7";
                break;
            case "1":
                color = "#26A69A";
                break;
            case "2":
                color = "#5C6BC0";
                break;
            case "3":
                color = "#673AB7";
                break;
            case "4":
                color = "#EC4637";
                break;
            default:
                color = "#FFFFFF";
                break;
        }
        barText += '<div onclick="deletePercentage('+i+');" style="' +
            'background-color:' + color + ';' +
            'width:'+barPercentages[i]+'%;' +
            'height:20px;" id="bar'+contador+'"><p>'+barPercentages[i]+'%</p><div class="mdl-tooltip" for="bar'+contador+'">Trote</div></div>';
        contador++;
    }
    barText += '</div>';
    document.getElementById("bars").innerHTML = barText;
    document.getElementById("addEditPercentage").setAttribute("max",barPercentages[contador-1].toString());
    document.getElementById("barPercentageError").innerHTML = "El maximo es: " + barPercentages[contador-1];

    if (!cambiado) {
        var ultimoPercentage = barPercentages.pop();
        barPercentages.unshift(ultimoPercentage);
        var ultimoTipo = barTipos.pop();
        barTipos.unshift(ultimoTipo);
    } else {
        barPercentages.unshift("0");
        barTipos.unshift("7");
    }
    //console.log("Perc: " + barPercentages + " - " + "Tipos: " +barTipos);
}

//Cleans the different inputs from the AddEdit page
function cleanAddEditPage() {
    document.getElementById("addEditName").value = "";
    document.getElementById("addEditName").setAttribute("placeholder","Nombre del plan");
    document.getElementById("addEditDescription").value = "";
    document.getElementById("addEditDescription").setAttribute("placeholder","Descripcion del plan");
    document.getElementById("addEditTimeDefault").value = "";
    document.getElementById("addEditTimeDefault").setAttribute("placeholder","Minutos");
    document.getElementById("addEditPercentage").value = "";
    document.getElementById("addEditPercentage").setAttribute("placeholder","%");
    document.getElementById("selectTipos").selectedIndex = "0";
    barPercentages = [100];
    barTipos = [7];
}

//Deletes a percentage from the list of percentages and refreshes the bar
function deletePercentage(i) {
    if (barPercentages.length > 1 && barPercentages.length != i+1) {
        console.log("Al entrar: " + barPercentages);
        var toDelete = parseInt(barPercentages[i+1]);
        barPercentages[0] = parseInt(barPercentages[0]) + toDelete;
        barPercentages.splice(i+1,1);
        barTipos.splice(i+1,1);
        console.log("Al salir: " + barPercentages);
        arrangePercentages();
    }
}