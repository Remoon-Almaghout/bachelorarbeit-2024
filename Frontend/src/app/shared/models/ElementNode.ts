export interface ElementNode {
  name: string;
  children?: ElementNode[];
  group: number;
  id: number;
  parentId?:{
    topic?:number,
    educationPackage?:number
  };
  completed? : boolean;
  previousCompleted? : boolean;
}
