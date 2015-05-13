var roundToNearest = function(x, n) {
    return Math.round(x / n) * n;
};

Object.prototype.isOneOf = function(array) {
    for (var val of array) {
        if (this == val) return true;
    }
    return false;
};

var beatCountElem = document.querySelector("#beat-count");

var recordingToggle = document.querySelector("#recording-toggle"),
    metronomeToggle = document.querySelector("#metronome-toggle"),
    saveButton = document.querySelector("#save"),
    loadButton = document.querySelector("#load"),
    resetButton = document.querySelector("#reset");

var notes = [];

var beats = 4;

var subBeatLenth = 1000;

var loopLength = subBeatLenth * beats;

createjs.Sound.alternateExtensions = ["mp3"];

for (var soundStr of ["kick", "snare", "hihat", "tom1", "tom2", "cymbal", "zargon"]) {
    createjs.Sound.registerSound("assets/sounds/notes/" + soundStr + ".ogg", soundStr);
}

var main = function(){
    var metronomeInterval;
    var colorInterval;
    
    var metronomeBeat = function(){
        if (metronomeInterval) clearInterval(metronomeInterval);
        if (metronomeOn) {
            playSound("zargon", 0.7);
            metronomeInterval = setInterval(function(){
                playSound("zargon", 0.2);
            }, loopLength / Math.pow(beats, 2));
        }
        
        document.body.style.backgroundColor = "rgb(" + new Array(Math.round(Math.random()*255), Math.round(Math.random()*255), Math.round(Math.random()*255)).join(",") + ")";
        
        if (beat !== beats) beat += 1;
        else beat = 1;
        
        beatCountElem.textContent = beat.toString();
    };
    
    var loopStartTime;
    var beat = 0;
    
    var keySoundMap = {
        65: "hihat",
        68: "tom2",
        69: "cymbal",
        83: "snare",
        87: "tom1",
        88: "kick"
    }
    
    var recordingOn = false,
        metronomeOn = true;
    
    window.onkeydown = function(e){
        var sound = keySoundMap[e.which];

        if (e.which.isOneOf(Object.keys(keySoundMap))) {
            var nowTime = new Date().getTime();
            
            if (recordingOn) {
                notes.push({
                    time: nowTime - loopStartTime,
                    sound: sound,
                    queued: false
                });
            }

            playSound(sound);
        }
    };

    var loop = function(){
        if (colorInterval) clearInterval(colorInterval);

        metronomeBeat();
        colorInterval = setInterval(metronomeBeat, loopLength / beats);

        playRecordings();

        loopStartTime = new Date().getTime();
    };
    
    var startLoop = function(){
        loop();
        return setInterval(loop, loopLength);
    };
    
    startLoop();
    
    recordingToggle.addEventListener("change", function(){
        recordingOn = this.checked;
    });
    
    metronomeToggle.addEventListener("change", function(){
        metronomeOn = this.checked;
    });
    
    resetButton.addEventListener("click", function(){
        notes.length = 0;
    });
    
    saveButton.addEventListener("click", function(){
        var recordings = localStorage.getItem("yeyamix_recordings") ? JSON.parse(localStorage.getItem("yeyamix_recordings")) : [];
        
        var recording = {};
        recording.name = prompt("Enter a name for this recording", "My Gourdy Recording") || "Untitled";
        
        recording.notes = notes;
        recording.notes.forEach(function(note){
            delete note.queued;
        });
        
        recordings.push(recording);
        localStorage.setItem("yeyamix_recordings", JSON.stringify(recordings));
    });
    
    loadButton.addEventListener("click", function(){
        var recordings = localStorage.getItem("yeyamix_recordings") ? JSON.parse(localStorage.getItem("yeyamix_recordings")) : [];
        var recordingsStr = "";
        recordings.forEach(function(recording, i){
            recordingsStr += (i + 1) + ". " + recording.name + "\n";
        });
        var chosenIndex = Number(prompt("Which recording do you want to load?\n" + recordingsStr, "1"));
        if (chosenIndex && recordings[chosenIndex - 1]) {
            notes = recordings[chosenIndex - 1].notes;
        } else {
            alert("Nothing loaded.");
        }
    });
};

var playSound = function(sound, volume){
    var vol = 1;
    if (typeof volume !== "undefined") vol = volume;
    
    var instance = createjs.Sound.play(sound);
    instance.volume = vol;
};

var queueSound = function(note){
    note.queued = true;
    setTimeout(function(){
        playSound(note.sound);
        note.queued = false;
    }, note.time);
};

var playRecordings = function(){
    for (var note of notes) {
        if (!note.queued) queueSound(note);
    }
};

main();