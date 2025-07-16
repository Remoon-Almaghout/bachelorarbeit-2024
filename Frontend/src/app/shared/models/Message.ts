export interface Message {
    id: string;
    type : string;
    content: string | ArrayBuffer;
    user: string;
    user_name: string;
    created_at: string;
    local_message_id: string;
    options: any;
    file_info:any;
  }
  