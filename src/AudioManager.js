// AudioManager.js
export default class AudioManager {
    constructor() {
       this.audios = {};
    }
   
    addAudio(name, audio) {
       this.audios[name] = audio;
    }
   
    play(name) {
       const audio = this.audios[name];
       if (audio) {
         audio.play();
       } else {
         console.error(`Audio with name ${name} not found.`);
       }
    }
   
    pause(name) {
       const audio = this.audios[name];
       if (audio) {
         audio.pause();
       } else {
         console.error(`Audio with name ${name} not found.`);
       }
    }
   }
   