import { EntityRadarChartComponent } from 'src/app/shared/components/explanations/entity-radar-chart/entity-radar-chart.component';
import { GraphComponent } from 'src/app/shared/components/explanations/graph/graph.component';
import { TopKListComponent } from 'src/app/shared/components/explanations/top-k-list/top-k-list.component';
import { TopicVennDiagramComponent } from 'src/app/shared/components/explanations/topic-venn-diagram/topic-venn-diagram.component';
import { TreeDiagramComponent } from 'src/app/shared/components/explanations/tree-diagram/tree-diagram.component';

export default [
  // { title: 'Top K List', component: TopKListComponent },
  { title: 'Graph', component: GraphComponent },
  { title: 'Tree Diagram', component: TreeDiagramComponent },
  { title: 'Entity Radar Chart', component: EntityRadarChartComponent },
  { title: 'Topic Overlap', component: TopicVennDiagramComponent },
];
