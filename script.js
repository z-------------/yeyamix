var roundToNearest = function(x, n) {
    return Math.round(x / n) * n;
};

var startButton = document.querySelector("#start");
var introElem = document.querySelector("#intro");
var beatCountElem = document.querySelector("#beat-count");

var notes = [];

var beats = 4; // either 3 or 4

var subBeatLenth = 1000;

var loopLength = subBeatLenth * beats;

createjs.Sound.alternateExtensions = ["mp3"];

for (var soundStr of ["click", "kick", "snare", "hihat", "tom1", "tom2", "cymbal"]) {
    createjs.Sound.registerSound("assets/sounds/notes/" + soundStr + ".ogg", soundStr);
}

var main = function(){
    var metronomeSub = function(){
        playSound("click", 0.1);
    };

    var metronomeBeat = function(){
        playSound("click", 0.2);
        document.body.style.backgroundColor = "rgb(" + new Array(Math.round(Math.random()*255), Math.round(Math.random()*255), Math.round(Math.random()*255)).join(",") + ")";
        
        if (beat !== beats) beat += 1;
        else beat = 1;
        
        beatCountElem.textContent = beat.toString();
    };
    
    var metronomeInterval;
    var colorInterval;
    
    var loopStartTime;
    var beat = 0;
    
    startButton.onclick = function(){
        introElem.classList.add("hidden");
        
        window.onkeydown = function(e){
            var sound;
            if (e.which === 83) sound = "snare"; // s
            if (e.which === 88) sound = "kick"; // x
            if (e.which === 87) sound = "tom1"; // w
            if (e.which === 68) sound = "tom2"; // d
            if (e.which === 65) sound = "hihat"; // a
            if (e.which === 69) sound = "cymbal"; // e

            if (e.which === 83 || e.which === 88 || e.which === 87 || e.which === 68 || e.which === 65 || e.which === 69) {
                var nowTime = new Date().getTime();

                notes.push({
                    time: nowTime - loopStartTime,
                    sound: sound
                });

                playSound(sound);
            }
        };
        
        setInterval(function(){
            if (metronomeInterval) clearInterval(metronomeInterval);
            if (colorInterval) clearInterval(colorInterval);
            
            metronomeSub(); metronomeBeat();
            metronomeInterval = setInterval(metronomeSub, loopLength / Math.pow(beats, 2));
            colorInterval = setInterval(metronomeBeat, loopLength / beats);
            
            playRecordings();
            
            loopStartTime = new Date().getTime();

        }, loopLength);
    };
};

var playSound = function(sound, volume){
    var vol = 1;
    if (typeof volume !== "undefined") vol = volume;
    
    var instance = createjs.Sound.play(sound);
    instance.volume = vol;
};

var queueSound = function(sound, time){
    setTimeout(function(){
        playSound(sound);
    }, time);
};

var playRecordings = function(){
    for (var note of notes) {
        queueSound(note.sound, note.time);
    }
};

main();