import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { SnackbarService } from "src/app/shared/services/snackbar.service";
import { SocketService } from "src/app/shared/services/socket.service";
import { HttpService } from "src/app/shared/services/http.service";
import { Message } from 'src/app/shared/models/Message';
import { environment } from 'src/environments/environment';
import { ImageViewer } from '../../image-viewer/image-viewer.component';
import { MatDialog } from '@angular/material/dialog';
import { UserProfileService } from 'src/app/shared/services/user-profile.service';
import { SpeechService } from 'src/app/shared/services/speech.service';
@Component({
    selector:"chatbot-chatting-menu",
    templateUrl:"./chatbot-chatting-menu.component.html",
    styleUrls: ['chatbot-chatting-menu.css']
})
export class ChatbotChattingMenu implements OnInit{
    @Output() onClose: EventEmitter<any> = new EventEmitter();
    @Output() onChange: EventEmitter<any> = new EventEmitter();
    @Output() showHideSpeechMenu: EventEmitter<any> = new EventEmitter();
    @Input()  currentSessionId: string;
    @Input()  ownSession: boolean = false;
    @ViewChild('messagesList') messagesList : ElementRef; 
    public LOGO = "/assets/images/logo.png";
    public userImg = "/assets/images/unknown_user.png";
    public userImg2 = "/assets/images/userimg2.png";
    public isLoading : boolean;
    public messages : Message[];
    public acceptedFileTypes : string = '';
    public acceptedImageFiles : string[] = [".png",".jpeg",".jpg",".gif"]
    public acceptedDocsFiles : string[] = [".pdf",".docx"]
    public isStillFileUploading : boolean = false;
    public imageBaseUrl : string = environment.backendUrl;
    public typingStatus : any ;
    public showEmojiPicker = false;
    public messageInputFieldValue = ''
    public hideTag = true

    constructor(private httpService: HttpService,    
        private snackbarService: SnackbarService,
        private socketService: SocketService,
        public dialog: MatDialog,
        public speechService:SpeechService){



    }

    
    async ngOnInit() {

        this.acceptedFileTypes = this.acceptedImageFiles.concat(this.acceptedDocsFiles).join(',')

        this.getMessages(this.currentSessionId)
        this.socketService.onWrittingStatusRecieved().subscribe((data:any)=>{
            console.log("writting status recieved",data);
            if(data['status'] == 'success')
            {
                const typingStatus = data.message;

                if(typingStatus["sender_message_id"] == environment.localId)
                    return;
                
                this.typingStatus = typingStatus

                
            }
            
        })
        this.socketService.onMessageRecieved().subscribe((data:any) => {
            console.log("message recieved",data);
            if(data['status'] == 'success')
            {
                const message = data.message;
                console.log('message',message);
                if(message["sender_message_id"] == environment.localId)
                    return;

                this.messages.unshift(message)
    
                this.scrollDown()

                if(message.user == 'bot')
                    this.speechService.updateVoiceMessage(message.content)
            }
            else
            {
                this.snackbarService.show(data['message'], 'danger');
            }
        })

        this.speechService.textMessageState.subscribe(textMessage => this.sendMessage(textMessage))



    }
    scrollDown()
    {
 
        const messagesList = document.getElementById("messagesList");
        messagesList.scrollTop = 0
    }

    async getMessages(session_id: string){

        this.isLoading = true;

        await firstValueFrom(this.httpService.getMessages(session_id))
        .then((res: any) => {

            this.messages = res.data.reverse();



        })
        .catch((e) => {
            this.snackbarService.show(e.error.message, 'danger');
        });

        this.isLoading = false;
    }

    async sendInvite(expertCategory : string){


        this.socketService.onInviteCreated().subscribe((data: any) => {

            if(data['status'] == 'success')
            {
                this.snackbarService.show(data["message"], 'success');
            }
            else
            {
                this.snackbarService.show(data['message'], 'danger');
            }

        });
        this.socketService.createInvite(expertCategory, this.currentSessionId, environment.localId);
    }

    sendMessage(message : string){

        if (message.length == 0 || message.trim() === '')
            return;
        
        if (!this.hideTag)
            message = "@dodo " + message

        var messageObj: Message = {
            type : 'text',
            content : message,
            created_at : new Date().toLocaleTimeString("en-US",{  hour: 'numeric' , minute: 'numeric' }),
            id : '',
            user : 'me',
            user_name: 'me',
            local_message_id: environment.localId,
            options : {},
            file_info : {}
        };

        
        this.messages.unshift(messageObj);

        this.scrollDown()

        this.socketService.onMessageCreated().subscribe((data: any) => {

            if(data['status'] == 'success')
            {
                
            }
            else
            {
                this.snackbarService.show(data['message'], 'danger');
            }

        });
        this.socketService.createMessage(this.currentSessionId, message, 'text', environment.localId)

        this.messageInputFieldValue = ''
    }

    onFileSelected(event : any) {
        const file:File = event.target.files[0];
        const fileType = "."+file.type.split('/')[1]
        const fileName = file.name

        if(this.acceptedImageFiles.find(acceptedImageFile => acceptedImageFile == fileType))
        {
            const formData = new FormData();
            formData.append("image", file);
            const type = 'image';
            this.upload(formData, type, fileName);

            return;
        }

        if(this.acceptedDocsFiles.find(acceptedDocFile => acceptedDocFile == fileType))
        {
            const formData = new FormData();
            formData.append("doc", file);
            const type = 'doc';
            this.upload(formData, type, fileName);
            return;
        }

        this.snackbarService.show("The file type is not allowed", 'danger');
    }

    async upload(formData: FormData, type: string, fileName: string){

        this.isStillFileUploading = true;

        await firstValueFrom(this.httpService.upload(formData))
        .then((res: any) => {

            console.log("res",res)
            if(res.status == 'success')
            {
                const fileType = res.type

                if(fileType == 'image')
                {
                    const imageUrl = res.url;
                    const messageObj: Message = {
                        type : fileType,
                        content : imageUrl,
                        created_at : new Date().toLocaleTimeString("en-US",{  hour: 'numeric' , minute: 'numeric' }),
                        id : '',
                        user : 'me',
                        user_name: 'me',
                        local_message_id: environment.localId,
                        options: {},
                        file_info : {
                            name : fileName,
                            type : type
                        }
                    };
                    this.messages.unshift(messageObj);
                    this.scrollDown()
                
                    this.socketService.createMessage(this.currentSessionId, imageUrl, 'image', environment.localId)
                }
                if(fileType == 'doc')
                {
                    const docUrl = res.url;
                    const messageObj: Message = {
                        type : fileType,
                        content : docUrl,
                        created_at : new Date().toLocaleTimeString("en-US",{  hour: 'numeric' , minute: 'numeric' }),
                        id : '',
                        user : 'me',
                        user_name: 'me',
                        local_message_id: environment.localId,
                        options: {},
                        file_info : {
                            name : fileName,
                            type : type
                        }
                    };
                    this.messages.unshift(messageObj);
                    this.scrollDown()
                
                    this.socketService.createMessage(this.currentSessionId, docUrl, 'doc', environment.localId)
                }

            }
            this.isStillFileUploading = false;
    
        })
        .catch((e) => {
            console.log("error",e)
            this.snackbarService.show(e.error.message, 'danger');
        });
        


    }

    viewImage(event: any){
        var target = event.target || event.srcElement || event.currentTarget;
        var srcAttr = target.attributes.src;
        var imgSrc = srcAttr.nodeValue;
        

        this.dialog.open(ImageViewer, {
            panelClass: 'custom-dialog-container',
            width: '90%',
            height: '90%',
            data: { imgSrc,
            },
          });
    }
    
    async downloadFile(fileUrl: any){
        return window.location.href = environment.backendUrl+fileUrl
    }

    close(){
        this.onClose.emit();
    }

    onFocus(){

        this.socketService.sendWrittingStatus(this.currentSessionId, 'typing', environment.localId)
    }
    onBlur(){
        this.socketService.sendWrittingStatus(this.currentSessionId, 'stopped', environment.localId)
    }

    showEmojiMenu(){
        this.showEmojiPicker = !this.showEmojiPicker;
    }

    addEmoji(event : any) {
        this.messageInputFieldValue += event.emoji.native
    }

    onEnterClicked(messageInputField : any){

        this.sendMessage(messageInputField.value)
    }

    onMessageInputChange(event : any){
        if(this.hideTag && event.target.value.toLowerCase().includes('@dodo'))
        {
            this.hideTag = false
            this.messageInputFieldValue = ''
        }
             
    }

    leaveSession()
    {
        this.socketService.onSessionLeft().subscribe((data: any) => {

            console.log('data',data)
            if(data['status'] == 'success')
            {
                this.snackbarService.show(data['message'], 'success');
                this.onChange.emit({selected_page : 'start'})
            }
            else
            {
                this.snackbarService.show(data['message'], 'danger');
            }

        });
        this.socketService.leaveSession(this.currentSessionId)
    }


}