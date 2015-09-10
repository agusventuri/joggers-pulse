var app = {

    initialize: function() {
        this.bindEvents();
    },

    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },

    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },

    receivedEvent: function(id){
        alert(location.pathname.substring(location.pathname.lastIndexOf("/") + 1));
    }

}

var storage = window.localStorage;
var timeLap = 0;
var stop = 0;
var times = 0;
var tipos = 0;
var secOld = -1;
var puedo = true;

// Wait for Cordova to load
document.addEventListener("deviceready", onDeviceReady, false);

// Cordova is ready
function onDeviceReady() {
    var db = window.openDatabase("Database", "1.0", "Pulse Database", 200000);
    db.transaction(populateDB, errorCB, successCB);
    document.getElementById("points").value = localStorage.getItem("voiceVolume");
}

// Populate the database
var currentRow;
function populateDB(tx) {
    tx.executeSql('CREATE TABLE IF NOT EXISTS pulseDB (' +
        'id INTEGER PRIMARY KEY AUTOINCREMENT, ' +
        'name TEXT, ' +
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
    tx.executeSql('SELECT * FROM pulseDB WHERE id="' + currentRow + '"', [], run, errorCB);
}

//Delete query
function deleteRow(tx) {
    tx.executeSql('DELETE FROM pulseDB WHERE id = ' + currentRow, [], queryDB, errorCB);
}

// Query the success callback
function querySuccess(tx, results) {
    var tblText='<table id="t01"><tr><th>ID</th> <th>Name</th> <th>Time</th> <th>Percentages</th> <th>Tipos</th></tr>';
    var len = results.rows.length;
    for (var i = 0; i < len; i++) {
        var tmpArgs = results.rows.item(i).id + ",'"
            + results.rows.item(i).name + "','"
            + results.rows.item(i).timeDefault + "','"
            + results.rows.item(i).percentages + "','"
            + results.rows.item(i).tipos +"'";
        tblText +='<tr onclick="goPopup('+ tmpArgs + ');">' +
            '<td>' + results.rows.item(i).id +'</td>' +
            '<td>' + results.rows.item(i).name +'</td>' +
            '<td>' + results.rows.item(i).timeDefault +'</td>' +
            '<td>' + results.rows.item(i).percentages +'</td>' +
            '<td>' + results.rows.item(i).tipos +'</td>' +
            '</tr>';
    }
    tblText +="</table>";
    document.getElementById("tblDiv").innerHTML =tblText;
}

// Transaction error callback
function errorCB(err) {
    alert("Error processing SQL: "+err.code);
}

// Transaction success callback
function successCB() {
    var db = window.openDatabase("Database", "1.0", "Pulse Database", 200000);
    db.transaction(queryDB, errorCB);
}

//Insert query
function insertDB(tx) {
    tx.executeSql('INSERT INTO pulseDB (name,timeDefault,percentages,tipos) VALUES (' +
        '"' + document.getElementById("txtName").value +'",' +
        '"' + document.getElementById("txtTime").value +'",' +
        '"' + document.getElementById("txtPercentage").value +'",' +
        '"' + document.getElementById("txtTipo").value + '")');
}

function goInsert() {
    var db = window.openDatabase("Database", "1.0", "Pulse Database", 200000);
    db.transaction(insertDB, errorCB, successCB);
}

function goDelete() {
    var db = window.openDatabase("Database", "1.0", "Pulse Database", 200000);
    db.transaction(deleteRow, errorCB);
    document.getElementById('qrpopup').style.display='none';
    document.getElementById('main').style.display='block';
}

//Show the popup after tapping a row in table
function goPopup(row,rowname,rowtime,rowpercentage,rowtipo) {
    currentRow=row;
    document.getElementById("qrpopup").style.display="block";
    document.getElementById("main").style.display="none";
    document.getElementById("editNameBox").value = rowname;
    document.getElementById("editTimeBox").value = rowtime;
    document.getElementById("editPercentageBox").value = rowpercentage;
    document.getElementById("editTipoBox").value = rowtipo;
}

//Edits a row in the DB
function editRow(tx) {
    tx.executeSql('UPDATE pulseDB SET ' +
        'name ="'+document.getElementById("editNameBox").value + '", ' +
        'timeDefault= "'+document.getElementById("editTimeBox").value+ '", ' +
        'percentages= "'+document.getElementById("editPercentageBox").value+ '", ' +
        'tipos= "'+document.getElementById("editTipoBox").value+ '" ' +
        'WHERE id = '+ currentRow, [], queryDB, errorCB);
}

function goEdit() {
    var db = window.openDatabase("Database", "1.0", "Pulse Database", 200000);
    db.transaction(editRow, errorCB);
    document.getElementById('qrpopup').style.display='none';
    document.getElementById('main').style.display='block';
}

function goRun() {
    var db = window.openDatabase("Database", "1.0", "Pulse Database", 200000)
    db.transaction(queryById, errorCB);
}

//Modifies voiceVolume's value
function modVal() {
    storage.setItem("voiceVolume",document.getElementById("points").value);
}

//Shows voiceVolume's value
function showVal() {
    alert("Valor: " + storage.getItem("voiceVolume"));
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
    end = new Date();
    diff = end - start;
    diff = new Date(diff);

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

    /*            if (sec > secOld) {
     playMP3();
     secOld++;
     puedo = true;
     }

     if (msec > 450 && msec <550 && puedo) {
     playMP3();
     puedo = false;
     }*/


    document.getElementById("chronotime").innerHTML = hr + ":" + min + ":" + sec + ":" + msec;
    timerID = setTimeout("chrono()", 0);

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