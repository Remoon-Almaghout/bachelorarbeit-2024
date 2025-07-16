export interface FlatNode {
  expandable: boolean;
  name: string;
  id: number;
  group: number;
  parentId?: { topic?: number; educationPackage?: number; };
  level: number;
}
