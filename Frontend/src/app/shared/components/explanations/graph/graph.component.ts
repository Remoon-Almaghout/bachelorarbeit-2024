import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import * as uuid from 'uuid';
import { firstValueFrom } from 'rxjs';
import { HttpService } from 'src/app/shared/services/http.service';
import { Recommendation } from 'src/app/shared/models/Recommendation';
import { NodeGroup } from 'src/app/shared/models/NodeGroup';
import { Node } from 'src/app/shared/models/Node';
import { ExplorationDialogComponent } from '../../dialogs/exploration-dialog/exploration-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Relation } from 'src/app/shared/models/Relation';
import { UserProfileService } from 'src/app/shared/services/user-profile.service';
import { RecommendationService } from 'src/app/shared/services/recommendation.service';
import { Course } from 'src/app/shared/models/Course';
import { Topic } from 'src/app/shared/models/Topic';
import { NodeExpansion } from 'src/app/shared/models/NodeExpansion';

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
})
export class GraphComponent implements OnInit {
  recommendations: any;
  selectedRecommendations: Recommendation[] = [];
  userProfile: any;
  name: string;
  svg: any;
  color: any;
  simulation: any;
  link: any;
  node: any;
  nodes: any = [];
  links: any = [];
  relationLinks: any = [];
  isGrabModus: boolean = false;
  move: boolean = false;
  startXPos: number;
  startYPos: number;
  offsetX: number = -534;
  offsetY: number = -792;
  scale: string = 'scale(1)';
  tooltip: any;
  containerWidth: number;
  clickTimeout: any = null;
  readonly NODE_GROUP_RECOMMENDATION: number = 1;
  readonly NODE_GROUP_COURSE: number = 2;
  readonly NODE_GROUP_TOPIC: number = 3;

  constructor(
    private httpService: HttpService,
    private dialog: MatDialog,
    private userProfileService: UserProfileService,
    private recommendationSerice: RecommendationService
  ) {}

  async ngOnInit() {
    await firstValueFrom(this.recommendationSerice.redommendationState).then(
      (res: any) => {
        this.recommendations = [res.recommended_journey];
        this.selectedRecommendations.push(this.recommendations[0]);
      }
    );

    await firstValueFrom(this.userProfileService.userProfileState).then(
      (res: any) => {
        this.userProfile = res;
      }
    );

    this.containerWidth =
      document.getElementById('graph-container').clientWidth;

    this.createGraph();
  }

  createGraph() {
    this.svg = d3.select('svg#graph');
    this.svg.selectAll('*').remove();

    var width = +this.svg.attr('width');
    var height = +this.svg.attr('height');

    this.color = d3.scaleOrdinal(d3.schemeCategory10);

    this.simulation = d3
      .forceSimulation()
      .force(
        'link',
        d3.forceLink().id(function (d: any) {
          return d.id;
        })
      )
      .force('charge', d3.forceManyBody())
      .force(
        'collide',
        d3.forceCollide(function (d) {
          return 50;
        })
      )
      .force('center', d3.forceCenter(width / 2, height / 2));

    const graph = this.buildNodesAndLinks(this.selectedRecommendations);

    this.render(graph);
  }

  render(graph: any) {
    this.tooltip = d3
      .select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0);

    this.link = this.svg
      .append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(graph.links)
      .enter()
      .append('line')
      .attr('stroke', '#DDE1EE')
      .attr('stroke-width', function (d: any) {
        return Math.sqrt(2);
      });

    this.relationLinks = this.svg
      .append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(graph.links)
      .enter()
      .append('line')
      .attr('stroke', 'transparent')
      .attr('stroke-width', function (d: any) {
        return 14;
      })
      .on('mouseenter', this.mouseenterLink.bind(this))
      .on('mouseleave', this.mouseleaveLink.bind(this));

    this.node = this.svg
      .append('g')
      .attr('class', 'nodes')
      .attr('class', 'cursor-pointer')
      .selectAll('g')
      .data(graph.nodes)
      .enter()
      .append('g');

    var circles = this.node
      .append('circle')
      .attr('r', (d: any) => {
        return 12;
      })
      .attr('stroke', '#4A76FB')
      .attr('stroke-width', function (d: any) {
        return d.selected ? Math.sqrt(2) : 0;
      })
      .attr('fill', (d: any) => {
        return this.getNodeColor(d.group);
      })
      .call(this.drag(this.simulation))
      .on('mouseenter', this.mouseenterNode.bind(this))
      .on('mouseleave', this.mouseleaveNode.bind(this))
      .on('click', this.clickNode.bind(this))
      .on('dblclick', this.doubleClickNode.bind(this));

    var lables = this.node
      .append('text')
      .text(function (d: any) {
        return d.id.length > 25 ? d.id.substring(0, 25) + '...' : d.id;
      })
      .attr('fill', '#8994b7')
      .attr('font-size', 9)
      .attr('text-anchor', 'middle')
      .attr('y', 25);

    this.simulation.nodes(graph.nodes).on('tick', () => {
      return this.ticked();
    });

    this.simulation.force('link').links(graph.links);
  }

  forceScale(node: any) {
    var scale = d3
      .scaleLog()
      .domain(this.nodes.sizeRange)
      .range(this.nodes.sizeRange.slice().reverse());
    return node.r + scale(node.r);
  }

  getNodeColor(group: number) {
    switch (group) {
      case this.NODE_GROUP_RECOMMENDATION:
        return '#536d95';
      case this.NODE_GROUP_COURSE:
        return '#5CDCB5';
      case this.NODE_GROUP_TOPIC:
        return '#D9E4FF';
      default:
        return 'black';
    }
  }

  buildNodesAndLinks(selectedRecommendations: Recommendation[]) {
    this.nodes = [];
    this.links = [];

    selectedRecommendations.forEach(
      (selectedRecommendation: Recommendation) => {
        this.addNode(
          selectedRecommendation.title,
          selectedRecommendation.id,
          this.NODE_GROUP_RECOMMENDATION,
          selectedRecommendation.id
        );

        selectedRecommendation.courses.forEach((course: Course) => {
          this.addNode(
            course.title,
            course.ID,
            this.NODE_GROUP_COURSE,
            selectedRecommendation.id,
            this.isSelectedCourse(course.ID)
          );
          this.addLink(selectedRecommendation.title, course.title);

          course.topics.forEach((topic: Topic) => {
            this.addNode(
              topic.title,
              topic.ID,
              this.NODE_GROUP_TOPIC,
              selectedRecommendation.id,
              this.isSelectedTopic(topic.ID)
            );
            this.addLink(course.title, topic.title);
          });
        });

        // Make links between courses
        const coursePairs = this.findNodePairs(selectedRecommendation.courses);
        coursePairs.forEach((coursePair: any) => {
          this.addLink(coursePair[0].title, coursePair[1].title);
        });
      }
    );

    return { nodes: this.nodes, links: this.links };
  }

  addNode(
    id: string,
    nodeId: number,
    group: number,
    recommendationId: number,
    selected = false
  ) {
    let index = this.nodes.findIndex((node: any) => node.id === id);

    if (index != -1) {
      return;
    }

    const node = {
      id,
      nodeId,
      group,
      recommendationId,
      internId: uuid.v4(),
      selected,
    };
    this.nodes.push(node);
  }

  addLink(source: string, target: string) {
    let index = this.links.findIndex(
      (link: any) =>
        (link.source === source && link.target === target) ||
        (link.target === source && link.source === target)
    );

    if (index != -1) {
      return;
    }
    const link = { source, target };
    this.links.push(link);
  }

  isSelectedCourse(id: number) {
    return (
      this.userProfile.courses.findIndex((course: any) => course.ID === id) !=
      -1
    );
  }

  isSelectedTopic(id: number) {
    return (
      this.userProfile.topics.findIndex((topic: any) => topic.ID === id) != -1
    );
  }

  findNodePairs(arr: any) {
    return arr
      .map((v: any, i: any) => arr.slice(i + 1).map((w: any) => [v, w]))
      .flat();
  }

  drag(simulation: any) {
    function dragstarted(event: any) {
      console.log('dragstarted');
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return d3
      .drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended);
  }

  ticked() {
    this.link
      .attr('x1', function (d: any) {
        return d.source.x;
      })
      .attr('y1', function (d: any) {
        return d.source.y;
      })
      .attr('x2', function (d: any) {
        return d.target.x;
      })
      .attr('y2', function (d: any) {
        return d.target.y;
      });

    this.relationLinks
      .attr('x1', function (d: any) {
        return d.source.x;
      })
      .attr('y1', function (d: any) {
        return d.source.y;
      })
      .attr('x2', function (d: any) {
        return d.target.x;
      })
      .attr('y2', function (d: any) {
        return d.target.y;
      });

    this.node.attr('transform', function (d: any) {
      return 'translate(' + d.x + ',' + d.y + ')';
    });
  }

  mouseenterNode(event: any, d: any) {
    if (d.group === NodeGroup.NODE_GROUP_RECOMMENDATION) {
      return;
    }

    let posX = event.pageX + 28;
    let posY = event.pageY - 28;

    this.tooltip.transition().duration(200).style('opacity', 1);
    this.tooltip
      .html(
        "<div class='text-center'><p class='m-0 text-blue-gray-600 text-sm'>Loading...</p></div>"
      )
      .style('left', posX + 'px')
      .style('top', posY + 'px');

    let groupName = this.getNodeGroupName(d.group);

    this.httpService
      .getNodeInformation(groupName, d.nodeId)
      .subscribe((res: any) => {
        const node: Node = res.data;

        let explanation = node.automatic_explanation
          ? node.automatic_explanation
          : node.expert_explanation;

        if (explanation) {
          this.tooltip.html(
            `<div class='text-left'><p class='mt-0 text-dark-700 text-sm text-bold'>Erklärung:</p><p class='mt-0 text-dark-700 text-sm'>${explanation}</p><p class='mt-0 text-dark-700 text-sm'>Klicke auf das Element um weitere Informationen zu erhalten</p></div>`
          );
        } else {
          this.tooltip.html(
            `<div class='text-left'><p class='mt-0 text-dark-700 text-sm text-bold'>Keine Erklärung gefunden</p></div>`
          );
        }
      });
  }

  mouseleaveNode(d: any) {
    if (d.group === NodeGroup.NODE_GROUP_RECOMMENDATION) {
      return;
    }
    this.tooltip.transition().duration(200).style('opacity', 0);
  }

  mouseenterLink(event: any, d: any) {
    const target = event.target;

    target.classList.add('related-link-active');

    let posX = event.pageX + 28;
    let posY = event.pageY - 28;

    this.tooltip.transition().duration(200).style('opacity', 1);
    this.tooltip
      .html(
        "<div class='text-center'><p class='m-0 text-blue-gray-600 text-sm'>Loading...</p></div>"
      )
      .style('left', posX + 'px')
      .style('top', posY + 'px');

    let sourceGroupName = this.getNodeGroupName(d.source.group);
    let targetGroupName = this.getNodeGroupName(d.target.group);

    this.httpService
      .getLinkRelation(
        sourceGroupName,
        d.source.nodeId,
        targetGroupName,
        d.target.nodeId
      )
      .subscribe((res: any) => {
        const relation: Relation = res.data.length ? res.data[0] : [];

        let explanation = relation.automatic_explanation
          ? relation.automatic_explanation
          : relation.expert_explanation;

        if (explanation) {
          this.tooltip.html(
            `<div class='text-left'><p class='mt-0 text-dark-700 text-sm text-bold'>Erklärung:</p><p class='m-0 text-dark-700 text-sm'>${explanation}</p></div>`
          );
        } else {
          this.tooltip.html(
            `<div class='text-left'><p class='mt-0 text-dark-700 text-sm text-bold'>Keine Erklärung gefunden</p></div>`
          );
        }
      });
  }

  mouseleaveLink(d: any) {
    const target = d.target;
    target.classList.remove('related-link-active');

    this.tooltip.transition().duration(200).style('opacity', 0);
  }

  clickNode(event: any, d: any) {
    clearTimeout(this.clickTimeout);
    const self = this;
    this.clickTimeout = setTimeout(function () {
      const data = event.target.__data__;
      const recommendation = self.selectedRecommendations.find(
        (recommendation: Recommendation) =>
          recommendation.id === data.recommendationId
      );
      self.openExplorationDialog(
        data.nodeId,
        data.id,
        data.group,
        recommendation
      );
    }, 300);
  }

  doubleClickNode(d: any) {
    clearTimeout(this.clickTimeout);

    const data = d.target.__data__;
    this.expandNode(data.nodeId, this.getNodeGroupName(data.group));
  }

  async expandNode(nodeId: number, nodeType: string) {
    // await firstValueFrom(
    //   this.httpService.getExpandedNodeInformation(nodeId, nodeType)
    // ).then((res: any) => {
    //   const nodeExpansions: NodeExpansion[] = res.data;
    //   nodeExpansions.forEach((nodeExpansion: NodeExpansion) => {
    //     this.addNode(
    //       nodeExpansion.target_title,
    //       nodeExpansion.target_id,
    //       this.getNodeGroupId(nodeExpansion.target_type),
    //       this.selectedRecommendations[0].id,
    //       false
    //     );
    //   });
    // });
  }

  getNodeGroupName(group: number): string {
    switch (group) {
      case NodeGroup.NODE_GROUP_RECOMMENDATION:
        return 'Recommendation';
      case NodeGroup.NODE_GROUP_COURSE:
        return 'Course';
      case NodeGroup.NODE_GROUP_TOPIC:
        return 'Topic';
      case NodeGroup.NODE_GROUP_EDUCATIONAL_PACKAGE:
        return 'Educational_Package';
      case NodeGroup.NODE_GROUP_OER:
        return 'OER';
      default:
        return '';
    }
  }

  getNodeGroupId(name: string): number {
    switch (name) {
      case 'Recommendation':
        return NodeGroup.NODE_GROUP_RECOMMENDATION;
      case 'Course':
        return NodeGroup.NODE_GROUP_COURSE;
      case 'Topic':
        return NodeGroup.NODE_GROUP_TOPIC;
      case 'Educational_Package':
        return NodeGroup.NODE_GROUP_EDUCATIONAL_PACKAGE;
      case 'OER':
        return NodeGroup.NODE_GROUP_OER;
      default:
        return 0;
    }
  }

  openExplorationDialog(
    id: number,
    title: string,
    group: NodeGroup,
    recommendation: Recommendation
  ): void {
    this.dialog.open(ExplorationDialogComponent, {
      width: '1240px',
      height: '95vh',
      panelClass: 'no-spacing',
      disableClose: true,
      data: {
        id,
        title,
        group,
        recommendation,
      },
    });
  }

  changeRecommendationSelection(selected: Recommendation[]) {
    this.selectedRecommendations = selected;
    this.createGraph();
  }

  onScale(scale: number) {
    this.scale = `scale(${scale})`;
  }

  onGrab() {
    this.isGrabModus = !this.isGrabModus;
  }

  onMouseUp() {
    this.move = false;
  }

  onMouseDown($event: any) {
    this.startXPos = $event.clientX;
    this.startYPos = $event.clientY;

    this.move = true;
  }

  onMouseMove($event: any) {
    if (this.move) {
      const { clientX, clientY } = $event;

      const moveX = this.startXPos - clientX;
      const moveY = this.startYPos - clientY;

      this.startXPos = clientX;
      this.startYPos = clientY;

      this.offsetX -= moveX;
      this.offsetY -= moveY;
    }
  }
}
