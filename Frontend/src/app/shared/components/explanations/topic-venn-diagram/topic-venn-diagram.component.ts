import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import * as venn from 'venn.js';
import { firstValueFrom } from 'rxjs';
import { Recommendation } from 'src/app/shared/models/Recommendation';
import { Topic } from 'src/app/shared/models/Topic';
import { UserProfileService } from 'src/app/shared/services/user-profile.service';
import { RecommendationService } from 'src/app/shared/services/recommendation.service';

@Component({
  selector: 'app-topic-venn-diagram',
  templateUrl: './topic-venn-diagram.component.html',
})
export class TopicVennDiagramComponent implements OnInit {
  recommendations: any;
  selectedRecommendations: Recommendation[] = [];
  userProfile: any;
  svg: any;
  circleRad: number = 100;
  percentage: number = 0;
  colors: string[] = ['rgb(87, 129, 255)', 'rgb(35, 204, 152)'];
  overlappingTopics: any[];
  exclusiveProfileTopics: any[];
  exclusiveRecommendationTopics: any[];
  containerWidth: number;

  constructor(
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

    this.containerWidth = document.getElementById(
      'radar-chart-container'
    ).clientWidth;

    document.getElementById('venn-diagram').style.width =
      Math.ceil(this.containerWidth / 2).toString() + 'px';

    this.createVennDiagram();
  }

  createVennDiagram() {
    this.getOverlappingTopics();
    this.calcPercentage();


    console.log("topics",this.getAllTopics());
    console.log("userProfile.topics",this.userProfile.topics);
    console.log("this.overlappingTopics",this.overlappingTopics);
    
    var sets = [
      { sets: ['A'], size: 100 },
      { sets: ['B'], size: 100 },
      { sets: ['A', 'B'], size: this.percentage },
    ];

    var svg = d3.select('#venn-diagram');
    var chart = venn.VennDiagram();
    chart
      .wrap(false)
      .width(this.containerWidth / 2)
      .height(200);
    svg.datum(sets).call(chart);

    var tooltip = d3
      .select('body')
      .append('div')
      .attr('class', 'venntooltip')
      .style('opacity', 0);

    var aSetPath: any = document.querySelector("[data-venn-sets='A']")
      .children[0];
    aSetPath.style.fill = this.colors[0];

    // Remove label
    document.querySelector("[data-venn-sets='A']").children[1].remove();

    var bSetPath: any = document.querySelector("[data-venn-sets='B']")
      .children[0];
    bSetPath.style.fill = this.colors[1];

    // Remove label
    document.querySelector("[data-venn-sets='B']").children[1].remove();

    const self = this;

    // add listeners to all the groups to display tooltip on mouseover
    svg
      .selectAll('g')
      .on('mouseover', function (d: any, i: any) {
        // sort all the areas relative to the current item
        venn.sortAreas(svg, i);

        let html = '';

        if (i.sets.length === 1) {
          if (i.sets[0] === 'A') {
            html =
              "<div class='text-left'><p class='mt-0 text-dark-700 text-sm text-bold'>Nur in der Empfehlung enthaltende Themen: </p>";
            html += `<p class='mt-0 text-dark-700 text-sm'>${self.exclusiveRecommendationTopics
              .map((t) => t.title)
              .join(', ')}</p></div>`;
          } else {
            html =
              "<div class='text-left'><p class='mt-0 text-dark-700 text-sm text-bold'>Nur im Benutzerprofil enthaltende Themen: </p>";
            html += `<p class='mt-0 text-dark-700 text-sm'>${self.exclusiveProfileTopics
              .map((t) => t.title)
              .join(', ')}</p></div>`;
          }
        } else {
          html =
            "<div class='text-left'><p class='mt-0 text-dark-700 text-sm text-bold'>Überschneidende Themen: </p>";
          html += `<p class='mt-0 text-dark-700 text-sm'>${self.overlappingTopics
            .map((t) => t.title)
            .join(', ')}</p></div>`;
        }

        // Display a tooltip with the current size
        tooltip.transition().duration(400).style('opacity', 0.9);

        tooltip.html(html);

        // highlight the current path
        var selection = d3.select(this).transition('tooltip').duration(400);
        selection
          .select('path')
          .style('stroke-width', 3)
          .style('fill-opacity', i.sets.length == 1 ? 0.4 : 0.1)
          .style('stroke-opacity', 1);
      })

      .on('mousemove', function (event: any) {
        tooltip
          .style('left', event.pageX + 28 + 'px')
          .style('top', event.pageY - 28 + 'px');
      })

      .on('mouseout', function (d: any, i: any) {
        tooltip.transition().duration(400).style('opacity', 0);
        var selection = d3.select(this).transition('tooltip').duration(400);
        selection
          .select('path')
          .style('stroke-width', 0)
          .style('fill-opacity', i.sets.length == 1 ? 0.25 : 0.0)
          .style('stroke-opacity', 0);
      });
  }

  changeRecommendationSelection(selected: Recommendation[]) {
    this.selectedRecommendations = selected;
    this.createVennDiagram();
  }

  getOverlappingTopics() {
    const topics: any[] = this.getAllTopics();

    this.overlappingTopics = [];
    this.exclusiveRecommendationTopics = [];
    this.exclusiveProfileTopics = [];

    this.overlappingTopics = topics.filter(
      (topic: Topic) =>
        this.userProfile.topics.findIndex(
          (userProfileTopic: Topic) => userProfileTopic.ID === topic.ID
        ) != -1
    );

    this.exclusiveProfileTopics = this.userProfile.topics.filter(
      (userProfileTopic: Topic) =>
        topics.findIndex((topic: Topic) => userProfileTopic.ID === topic.ID) ===
        -1
    );

    this.exclusiveRecommendationTopics = topics.filter(
      (topic: Topic) =>
        this.exclusiveProfileTopics.findIndex(
          (exclusiveProfileTopic: Topic) =>
            exclusiveProfileTopic.ID === topic.ID
        ) === -1
    );
  }

  getAllTopics() {
    const topics: any[] = [];

    this.selectedRecommendations[0].courses.forEach((course: any) => {
      course.topics.forEach((topic: any) => {
        topics.push(topic);
      });
    });

    return topics;
  }

  calcPercentage() {
    const topics: any[] = this.getAllTopics();

    this.percentage = Math.floor(
      100 * (this.overlappingTopics.length / topics.length)
    );
  }
}
