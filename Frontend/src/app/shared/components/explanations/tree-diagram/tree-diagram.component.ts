import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, OnInit } from '@angular/core';
import {
  MatTreeFlatDataSource,
  MatTreeFlattener,
} from '@angular/material/tree';
import { finalize, firstValueFrom, forkJoin, map } from 'rxjs';
import { Course } from 'src/app/shared/models/Course';
import { EducationalPackage } from 'src/app/shared/models/EducationalPackage';
import { NodeGroup } from 'src/app/shared/models/NodeGroup';
import { OER } from 'src/app/shared/models/OER';
import { Recommendation } from 'src/app/shared/models/Recommendation';
import { Topic } from 'src/app/shared/models/Topic';
import { RecommendationService } from 'src/app/shared/services/recommendation.service';
import { ElementNode } from 'src/app/shared/models/ElementNode';
import { FlatNode } from 'src/app/shared/models/FlatNode';
import { MatDialog } from '@angular/material/dialog';
import { ExplorationDialogComponent } from '../../dialogs/exploration-dialog/exploration-dialog.component';
import { NavigationExtras, Router } from '@angular/router';
import { HttpService } from 'src/app/shared/services/http.service';

@Component({
  selector: 'app-tree-diagram',
  templateUrl: './tree-diagram.component.html',
})
export class TreeDiagramComponent implements OnInit {
  recommendations: any;
  selectedRecommendations: Recommendation[] = [];
  recommendationJourneyIDs = [3000001];

  private _transformer = (node: ElementNode, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      id: node.id,
      group: node.group,
      level: level,
    };
  };

  treeControl = new FlatTreeControl<FlatNode>(
    (node) => node.level,
    (node) => node.expandable
  );

  treeFlattener = new MatTreeFlattener(
    this._transformer,
    (node) => node.level,
    (node) => node.expandable,
    (node) => node.children
  );

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  constructor(
    private recommendationSerice: RecommendationService,
    private dialog: MatDialog,
    private router: Router,
    private httpService: HttpService
  ) {}

  async ngOnInit() {
    await firstValueFrom(this.recommendationSerice.redommendationState).then(
      (res: any) => {
        this.recommendations = [res.recommended_journey];
        this.selectedRecommendations.push(this.recommendations[0]);
      }
    );

    forkJoin([
      this.httpService.getAllCoursesByJourneyID(
        this.recommendationJourneyIDs[0]
      ),
      this.httpService.getAllTopicsByJourneyID(
        this.recommendationJourneyIDs[0]
      ),
      this.httpService.getAllOERsByJourney(this.recommendationJourneyIDs[0]),
    ])
      .pipe(
        map(([allCoursesRes, allTopicsRes, allOERRes]) => {
          const journeyCourses: Course[] = (allCoursesRes as any)?.data?.length
            ? (allCoursesRes as any)?.data
            : [];
          const journeyTopics: Topic[] = (allTopicsRes as any)?.data?.length
            ? (allTopicsRes as any)?.data
            : [];
          const journeyOERs: OER[] = (allOERRes as any)?.data?.length
            ? (allOERRes as any)?.data
            : [];

          // Set status of oers
          for (
            let i = 0;
            i < this.selectedRecommendations[0]?.courses?.length;
            i++
          ) {
            for (
              let y = 0;
              y < this.selectedRecommendations[0]?.courses[i]?.topics?.length;
              y++
            ) {
              for (
                let z = 0;
                z <
                this.selectedRecommendations[0]?.courses[i]?.topics[y]
                  ?.educational_packages?.length;
                z++
              ) {
                for (
                  let x = 0;
                  x <
                  this.selectedRecommendations[0]?.courses[i]?.topics[y]
                    ?.educational_packages[z]?.educational_contents?.length;
                  x++
                ) {
                  const oerExisitInDatabase = journeyOERs?.some(
                    (o) =>
                      o.ID ===
                      this.selectedRecommendations[0]?.courses[i]?.topics[y]
                        ?.educational_packages[z]?.educational_contents[x]?.ID
                  );
                  if (oerExisitInDatabase) {
                    const targetOER = journeyOERs?.filter(
                      (o) =>
                        o.ID ===
                        this.selectedRecommendations[0]?.courses[i]?.topics[y]
                          ?.educational_packages[z]?.educational_contents[x]?.ID
                    );
                    if (targetOER?.length) {
                      this.selectedRecommendations[0].courses[i].topics[
                        y
                      ].educational_packages[z].educational_contents[
                        x
                      ].completed = targetOER[0]?.completed;
                    }
                    this.selectedRecommendations[0].courses[i].topics[
                      y
                    ].educational_packages[z].educational_contents[x].exist =
                      true;
                  } else {
                    this.selectedRecommendations[0].courses[i].topics[
                      y
                    ].educational_packages[z].educational_contents[
                      x
                    ].completed = true;
                    this.selectedRecommendations[0].courses[i].topics[
                      y
                    ].educational_packages[z].educational_contents[x].exist =
                      false;
                  }
                }
              }
            }
          }

          // set status of packages
          for (
            let i = 0;
            i < this.selectedRecommendations[0].courses?.length;
            i++
          ) {
            for (
              let y = 0;
              y < this.selectedRecommendations[0].courses[i]?.topics?.length;
              y++
            ) {
              for (
                let z = 0;
                z <
                this.selectedRecommendations[0].courses[i]?.topics[y]
                  ?.educational_packages?.length;
                z++
              ) {
                const allOERsCompleted =
                  this.selectedRecommendations[0].courses[i]?.topics[
                    y
                  ]?.educational_packages[z]?.educational_contents?.every(
                    (p: any) => p.completed
                  );
                if (allOERsCompleted) {
                  this.selectedRecommendations[0].courses[i].topics[
                    y
                  ].educational_packages[z].completed = true;
                } else {
                  this.selectedRecommendations[0].courses[i].topics[
                    y
                  ].educational_packages[z].completed = false;
                }
              }
            }
          }

          //set status for topics
          for (
            let i = 0;
            i < this.selectedRecommendations[0].courses?.length;
            i++
          ) {
            for (
              let y = 0;
              y < this.selectedRecommendations[0].courses[i]?.topics?.length;
              y++
            ) {
              const allPackagessCompleted =
                this.selectedRecommendations[0].courses[i]?.topics[
                  y
                ]?.educational_packages?.every((p: any) => p.completed);
              if (allPackagessCompleted) {
                this.selectedRecommendations[0].courses[i].topics[y].completed =
                  true;
              } else {
                this.selectedRecommendations[0].courses[i].topics[y].completed =
                  false;
              }
            }
          }

          //set status for courses
          for (
            let i = 0;
            i < this.selectedRecommendations[0].courses?.length;
            i++
          ) {
            const allTopicsCompleted = this.selectedRecommendations[0].courses[
              i
            ]?.topics?.every((t: any) => t.completed);
            if (allTopicsCompleted) {
              this.selectedRecommendations[0].courses[i].completed = true;
            } else {
              this.selectedRecommendations[0].courses[i].completed = false;
            }
          }

          // Set Previous Completed
          // of all contents

          for (
            let i = 0;
            i < this.selectedRecommendations[0].courses?.length;
            i++
          ) {
            // if the first course, set previous completed true.
            if (i === 0) {
              this.selectedRecommendations[0].courses[i].previousCompleted =
                true;
            } else {
              // else, set prev completed as the completed of previous course.
              this.selectedRecommendations[0].courses[i].previousCompleted =
                this.selectedRecommendations[0].courses[i - 1].completed;
            }

            // then go to the topics

            for (
              let y = 0;
              y < this.selectedRecommendations[0].courses[i].topics?.length;
              y++
            ) {
              // if the first topic in the first course, set previous completed true.
              if (i === 0 && y === 0) {
                this.selectedRecommendations[0].courses[i].topics[
                  y
                ].previousCompleted = true;
              } else {
                // if not first topic and prev topic is completed or first topic and prev course is completed,
                // set prev completed true
                if (
                  (y > 0 &&
                    this.selectedRecommendations[0].courses[i].topics[y - 1]
                      .completed) ||
                  (y === 0 &&
                    this.selectedRecommendations[0].courses[i - 1].completed)
                ) {
                  this.selectedRecommendations[0].courses[i].topics[
                    y
                  ].previousCompleted = true;
                } else {
                  // else, its false
                  this.selectedRecommendations[0].courses[i].topics[
                    y
                  ].previousCompleted = false;
                }
              }

              // then go to packages

              for (
                let z = 0;
                z <
                this.selectedRecommendations[0].courses[i].topics[y]
                  .educational_packages?.length;
                z++
              ) {
                // if the first package in the first topic in the first course,
                // set previous completed true.
                if (i === 0 && y === 0 && z === 0) {
                  this.selectedRecommendations[0].courses[i].topics[
                    y
                  ].educational_packages[z].previousCompleted = true;
                } else {
                  // if not first package and prev package is completed or first package and prev topic is completed,
                  // set prev completed true
                  if (
                    (z > 0 &&
                      this.selectedRecommendations[0].courses[i].topics[y]
                        .educational_packages[z - 1].completed) ||
                    (z === 0 &&
                      this.selectedRecommendations[0].courses[i].topics[y - 1]
                        .completed)
                  ) {
                    this.selectedRecommendations[0].courses[i].topics[
                      y
                    ].educational_packages[z].previousCompleted = true;
                  } else {
                    // else, its false
                    this.selectedRecommendations[0].courses[i].topics[
                      y
                    ].educational_packages[z].previousCompleted = false;
                  }
                }

                // then go to oers (educational contents)

                for (
                  let x = 0;
                  x <
                  this.selectedRecommendations[0].courses[i].topics[y]
                    .educational_packages[z].educational_contents?.length;
                  x++
                ) {
                  // if the first oer in the first package in the first topic,
                  // in the first course, set previous completed true.
                  if (i === 0 && y === 0 && z === 0 && x === 0) {
                    this.selectedRecommendations[0].courses[i].topics[
                      y
                    ].educational_packages[z].educational_contents[
                      x
                    ].previousCompleted = true;
                  } else {
                    // if not first oer and prev oer is completed or first oer and prev package is completed,
                    // set prev completed true
                    if (
                      (x > 0 &&
                        this.selectedRecommendations[0].courses[i].topics[y]
                          .educational_packages[z].educational_contents[x - 1]
                          .completed) ||
                      (x === 0 &&
                        this.selectedRecommendations[0].courses[i].topics[y]
                          .educational_packages[z - 1].completed)
                    ) {
                      this.selectedRecommendations[0].courses[i].topics[
                        y
                      ].educational_packages[z].educational_contents[
                        x
                      ].previousCompleted = true;
                    } else {
                      // else, its false
                      this.selectedRecommendations[0].courses[i].topics[
                        y
                      ].educational_packages[z].educational_contents[
                        x
                      ].previousCompleted = false;
                    }
                  }
                }
              }
            }
          }
        })
      )
      .pipe(
        finalize(() => {
          this.dataSource.data = this.generateTreeData();
          this.treeControl.expand(this.treeControl.dataNodes[0]);
        })
      )
      .subscribe();
  }

  hasChild = (_: number, node: FlatNode) => node.expandable;

  generateTreeData(): ElementNode[] {
    const recommendation: Recommendation = this.selectedRecommendations[0];
    const elementNodes: ElementNode[] = [];

    const recommendationNode: ElementNode = {
      id: recommendation.id,
      name: recommendation.title,
      children: [],
      group: NodeGroup.NODE_GROUP_RECOMMENDATION,
    };

    recommendation.courses.forEach((course: Course) => {
      const courseNode: ElementNode = {
        id: course.ID,
        name: course.title,
        children: [],
        group: NodeGroup.NODE_GROUP_COURSE,
        completed: course?.completed,
        previousCompleted: course?.previousCompleted,
      };

      recommendationNode.children.push(courseNode);

      course.topics.forEach((topic: Topic) => {
        const topicNode: ElementNode = {
          id: topic.ID,
          name: topic.title,
          children: [],
          group: NodeGroup.NODE_GROUP_TOPIC,
          completed: topic?.completed,
          previousCompleted: topic?.previousCompleted,
        };

        courseNode.children.push(topicNode);
        if (topic.educational_packages) {
          topic.educational_packages.forEach(
            (educationalPackage: EducationalPackage) => {
              const educationalPackageNode: ElementNode = {
                id: educationalPackage.ID,
                parentId: { topic: topic.ID },
                name: educationalPackage.title,
                children: [],
                group: NodeGroup.NODE_GROUP_EDUCATIONAL_PACKAGE,
                completed: educationalPackage?.completed,
                previousCompleted: educationalPackage?.previousCompleted,
              };
              topicNode.children.push(educationalPackageNode);
              educationalPackage.educational_contents.forEach((oer: OER) => {
                const oerNode: ElementNode = {
                  id: oer.ID,
                  parentId: {
                    topic: topic.ID,
                    educationPackage: educationalPackage.ID,
                  },
                  name: oer.title,
                  group: NodeGroup.NODE_GROUP_OER,
                  completed: oer?.completed,
                  previousCompleted: oer?.previousCompleted,
                };
                educationalPackageNode.children.push(oerNode);
              });
            }
          );
        }
      });
    });
    elementNodes.push(recommendationNode);
    return elementNodes;
  }

  openExplorationDialog(
    node: any,
    id: number,
    title: string,
    group: NodeGroup,
    parentId: {}
  ): void {
    let cid = null;
    let tid = null;
    let pid = null;
    let nodeStaus: any;
    // group = 2  ---> means course node
    // group = 3  ---> means topic node
    // group = 4  ---> means package node
    // group = 5  ---> means oer node
    if (group == 1) {
      nodeStaus = {
        completed: true,
        previousCompleted: true,
      };
    } else if (group == 2) {
      nodeStaus = {
        completed: true,
        previousCompleted: true,
      };
    } else if (group == 3) {
      for (
        let i = 0;
        i < this.selectedRecommendations[0]?.courses.length;
        i++
      ) {
        for (
          let j = 0;
          j < this.selectedRecommendations[0]?.courses[i].topics.length;
          j++
        ) {
          if (id == this.selectedRecommendations[0].courses[i].topics[j].ID) {
            cid = this.selectedRecommendations[0]?.courses[i].ID;
            nodeStaus = {
              completed:
                this.selectedRecommendations[0].courses[i].topics[j]?.completed,
              previousCompleted:
                this.selectedRecommendations[0].courses[i].topics[j]
                  ?.previousCompleted,
            };
            break;
          }
        }
      }
    } else if (group == 4) {
      for (
        let i = 0;
        i < this.selectedRecommendations[0]?.courses.length;
        i++
      ) {
        for (
          let j = 0;
          j < this.selectedRecommendations[0]?.courses[i].topics.length;
          j++
        ) {
          for (
            let n = 0;
            n <
            this.selectedRecommendations[0].courses[i].topics[j]
              .educational_packages.length;
            n++
          ) {
            if (
              id ==
              this.selectedRecommendations[0].courses[i].topics[j]
                .educational_packages[n].ID
            ) {
              cid = this.selectedRecommendations[0]?.courses[i].ID;
              tid = this.selectedRecommendations[0].courses[i].topics[j].ID;
              nodeStaus = {
                completed:
                  this.selectedRecommendations[0].courses[i].topics[j]
                    .educational_packages[n]?.completed,
                previousCompleted:
                  this.selectedRecommendations[0].courses[i].topics[j]
                    .educational_packages[n]?.previousCompleted,
              };
              break;
            }
          }
        }
      }
    } else if (group == 5) {
      for (
        let i = 0;
        i < this.selectedRecommendations[0]?.courses.length;
        i++
      ) {
        for (
          let j = 0;
          j < this.selectedRecommendations[0]?.courses[i].topics.length;
          j++
        ) {
          for (
            let n = 0;
            n <
            this.selectedRecommendations[0].courses[i].topics[j]
              .educational_packages.length;
            n++
          ) {
            for (
              let p = 0;
              p <
              this.selectedRecommendations[0].courses[i].topics[j]
                .educational_packages[n].educational_contents?.length;
              p++
            ) {
              if (
                id ==
                this.selectedRecommendations[0].courses[i].topics[j]
                  .educational_packages[n].educational_contents[p].ID
              ) {
                cid = this.selectedRecommendations[0]?.courses[i].ID;
                tid = this.selectedRecommendations[0].courses[i].topics[j].ID;
                pid =
                  this.selectedRecommendations[0].courses[i].topics[j]
                    .educational_packages[n].ID;
                nodeStaus = {
                  completed:
                    this.selectedRecommendations[0].courses[i].topics[j]
                      .educational_packages[n].educational_contents[p]
                      ?.completed,
                  previousCompleted:
                    this.selectedRecommendations[0].courses[i].topics[j]
                      .educational_packages[n].educational_contents[p]
                      ?.previousCompleted,
                };
                break;
              }
            }
          }
        }
      }
    }
    this.dialog.open(ExplorationDialogComponent, {
      width: '1240px',
      height: '95vh',
      panelClass: 'no-spacing',
      disableClose: true,
      data: {
        id: id,
        title,
        group,
        parentId,
        cid,
        tid,
        pid,
        recommendation: this.selectedRecommendations[0],
        status: nodeStaus,
      },
    });
  }
}
