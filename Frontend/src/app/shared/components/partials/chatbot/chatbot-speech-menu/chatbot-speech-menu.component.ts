import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { SnackbarService } from "src/app/shared/services/snackbar.service";
import { SpeechService } from "src/app/shared/services/speech.service";
declare var webkitSpeechRecognition: any;
declare var SpeechRecognition: any

@Component({
    selector: 'chatbot-speech-menu',
    templateUrl: './chatbot-speech-menu.component.html',
    styleUrls: ['chatbot-speech-menu.css'],
})

export class ChatbotSpeechMenu implements OnInit {
    @Output() showHideSpeechMenu : EventEmitter<any> = new EventEmitter();
    public LOGO = "/assets/images/logo.png";
    public startStopRecognition: boolean = false
    public showSpeechControll : boolean = false
    public speechRecognition : any
    public forceStop: boolean = false;
    public recognitionIcon : string = 'record_voice_over'
    public englishVoice : SpeechSynthesisVoice;
    public germanVoice : SpeechSynthesisVoice;
    public speechMsg: SpeechSynthesisUtterance;
    public startStopSpeaking: boolean = false;
    public voiceIcon: string = 'volume_up';

    private isRecognitionStarted = false;
    private isSpeaking = false;
    private selectedVoice: SpeechSynthesisVoice;

    constructor( private snackbarService: SnackbarService,
                 private speechService: SpeechService) {}
  
    ngOnInit(): void {

        if(!this.isRecognitionSupported())
        {
            this.snackbarService.show('Sorry, but your browser doesnt support Voice Recognition', 'danger');
            return;
        }

        const me = this;
        this.speechRecognition = ('webkitSpeechRecognition' in window) ? new webkitSpeechRecognition() : new SpeechRecognition();
        this.speechRecognition.continuous = true;
        this.speechRecognition.lang = 'en-US';
        this.speechRecognition.onstart = () => {
            this.isRecognitionStarted = true
        };
        this.speechRecognition.onend = () => {
            this.isRecognitionStarted = false;
            if(!this.forceStop)
            {
                this.startRecognition()
            }

     
        };
        this.speechRecognition.onerror = () => {
    
        };
        this.speechRecognition.onresult = (event:any) => {
            var finalTranscript = "";
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal)
                    finalTranscript += event.results[i][0].transcript;
            }
            
            console.log("Voice recognition: '"+ (finalTranscript)+"'");
            this.speechService.updateTextMessage("@dodo "+finalTranscript)
        };


        window.speechSynthesis.onvoiceschanged = function () {
        
            window.speechSynthesis.getVoices().forEach(voice => {
             

                if(me.englishVoice == null && voice.lang == 'en-US' && voice.name.includes('Natural'))
                {
                    me.englishVoice = voice
                    
                }
                if(me.germanVoice == null && voice.lang == 'de-DE' && voice.name.includes('Natural'))
                {
                    me.germanVoice = voice
                }
            
    
            });
            if(me.englishVoice == null || me.germanVoice == null)
            {
                window.speechSynthesis.getVoices().forEach(voice => {
             
                    if(me.englishVoice == null && voice.name.includes('Microsoft Mark - English (United States)'))
                    {
                        me.englishVoice = voice
                    }
                    if(me.germanVoice == null && voice.name.includes('Google Deutsch'))
                    {
                        me.germanVoice = voice
                    }
        
                });
            }

            console.log('onvoiceschanged');

            if( me.speechMsg == null)
            {
                me.selectedVoice = me.englishVoice

                me.speechMsg = new SpeechSynthesisUtterance();
                me.speechMsg.voice = me.selectedVoice;
                me.speechMsg.rate = 1;
                me.speechMsg.pitch = 1;
                me.speechMsg.onstart= () => {
                    me.isSpeaking = true
                    me.stopRecognition()
                }
                me.speechMsg.onend = () => {
    
                    console.log('voice stopped')
                    me.isSpeaking = false
                    me.startRecognition()
    
          
                }
            }


    
        };





        this.speechService.voiceMessageState.subscribe(voiceMessage => this.sayVoiceMessage(voiceMessage))


    }
    ngOnDestroy(){
        this.stopRecognition()
        window.speechSynthesis.cancel()
        this.isSpeaking = false
        this.startStopSpeaking = false

    }
    startTTSAndSTT(){


        if(!this.isRecognitionSupported())
        {
            this.snackbarService.show('Sorry, but your browser doesnt support Voice Recognition', 'danger');
            return;
        }

        this.showSpeechControll = true
        this.startStopRecognition = !this.startStopRecognition
        this.startRecognition()
        
        this.startStopSpeaking = true



    }
    isRecognitionSupported()
    {
        if ('webkitSpeechRecognition' in window) {
            console.log("Speech recognition API supported");
            return true
        } else {
            console.log("speech recognition API not supported.");
            return false
        }
        
    }

    resumStopRecognition(startStopRecognition: boolean)
    {
        this.startStopRecognition = !startStopRecognition

        if(this.startStopRecognition)
        {
            this.forceStop = false
            this.recognitionIcon = 'record_voice_over'
            this.startRecognition();


        }
        else
        {
            this.forceStop = true
            this.recognitionIcon = 'voice_over_off'
            this.stopRecognition()
            this.isRecognitionStarted = false;

        }
    }
    resumStopSpeaking(startStopSpeaking: boolean){

        this.startStopSpeaking = !startStopSpeaking
        if(this.startStopSpeaking)
        {
            this.voiceIcon='volume_up'
            this.isSpeaking = true
        }
        else
        {
            this.voiceIcon='volume_off'
            window.speechSynthesis.cancel()
            this.isSpeaking = false
            this.startRecognition()

        }
    }

    stopRecognition()
    {
   
        if(this.speechRecognition)
            this.speechRecognition.stop();

    }
    startRecognition()
    {
        const me = this
        console.log('me.forceStop',me.forceStop);
        console.log('me.isRecognitionStarted',me.isRecognitionStarted);
        console.log('me.speechRecognition',me.speechRecognition);
        if(me.speechRecognition && !me.isRecognitionStarted && !me.forceStop && !me.isSpeaking)
        {
            setTimeout(function(){ me.speechRecognition.start(); }, 400);

        }



    }


    close(){


        this.resumStopRecognition(false)
        window.speechSynthesis.cancel()
        this.startStopSpeaking = false
        this.startStopRecognition = false

        this.showHideSpeechMenu.emit();
    }

    languageChanged(event: any){


  
        const me = this
        this.speechRecognition.lang = event.value
        this.stopRecognition()
        this.startRecognition()


        
        if(event.value == 'en-US')
            this.selectedVoice = this.englishVoice;
        
        if(event.value == 'de-DE')
            this.selectedVoice = this.germanVoice;
    }

    sayVoiceMessage(voiceMessage: string)
    {
        if(this.startStopSpeaking)
        {

            this.speechMsg.text = voiceMessage
            this.speechMsg.voice = this.selectedVoice
            console.log('this.speechMsg.voice',this.speechMsg.voice);

            window.speechSynthesis.speak(this.speechMsg);
        }

    }
  
  }