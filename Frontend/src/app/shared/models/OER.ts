export interface OER {
  ID: number;
  title: string;
  description?: string;
  url?: string;
  enabled : boolean;
  completed : boolean;
  created_at?: Date;
  updated_at?: Date;
  url_classification?: string;
  classification? : string;
  exist ? : boolean;
  previousCompleted? : boolean;
}

export interface RemoteOER{
  oer : OER
}