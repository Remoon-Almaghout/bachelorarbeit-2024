import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { firstValueFrom } from 'rxjs';
import { Course } from 'src/app/shared/models/Course';
import { Recommendation } from 'src/app/shared/models/Recommendation';
import { Topic } from 'src/app/shared/models/Topic';
import { HttpService } from 'src/app/shared/services/http.service';
import { RecommendationService } from 'src/app/shared/services/recommendation.service';
import { UserProfileService } from 'src/app/shared/services/user-profile.service';

@Component({
  selector: 'app-entity-radar-chart',
  templateUrl: './entity-radar-chart.component.html',
})
export class EntityRadarChartComponent implements OnInit {
  recommendations: any;
  selectedRecommendations: Recommendation[] = [];
  userProfile: any;
  svg: any;
  features = [
    'Topics',
    'Hours per week',
    'Number of weeks',
    'Level of detail',
    'Educational content length',
  ];
  data: any[] = [];
  legendColors: any[];
  isLoading: boolean;
  courses: Course[];
  containerWidth: number;

  constructor(
    private userProfileService: UserProfileService,
    private recommendationSerice: RecommendationService,
    private httpService: HttpService
  ) {}

  async ngOnInit() {
    this.isLoading = true;

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

    await firstValueFrom(this.httpService.getCoursesByJourney(3000001)).then(
      (res: any) => {
        this.courses = res.data;
      }
    );

    this.containerWidth = document.getElementById(
      'radar-chart-container'
    ).clientWidth;
    document.getElementById('radar-chart').style.width =
      this.containerWidth.toString() + 'px';

    this.isLoading = false;

    let selectedRecommendation = this.selectedRecommendations[0];

    this.data.push([
      this.calcTopics(selectedRecommendation),
      this.calcHoursPerWeek(),
      this.calcNumberOfWeeks(),
      this.calcLevelOfDetail(),
      this.caclcEducationalContentLength(),
    ]);

    this.createRadar();
  }

  createRadar() {
    this.svg = d3.select('svg#radar-chart');
    this.svg.selectAll('*').remove();

    let radialScale = d3.scaleLinear().domain([0, 10]).range([0, 150]);
    let ticks = [2, 4, 6, 8, 10];

    ticks.forEach((t) =>
      this.svg
        .append('circle')
        .attr('cx', this.containerWidth / 2)
        .attr('cy', 200)
        .attr('fill', 'none')
        .attr('stroke', '#C6CBDB')
        .attr('r', radialScale(t))
    );

    for (var i = 0; i < this.features.length; i++) {
      let ft_name = this.features[i];
      let angle = Math.PI / 2 + (2 * Math.PI * i) / this.features.length;
      let line_coordinate = this.angleToCoordinate(angle, 10, radialScale);
      let label_coordinate = this.angleToCoordinate(angle, 10.5, radialScale);

      //draw axis line
      this.svg
        .append('line')
        .attr('x1', this.containerWidth / 2)
        .attr('y1', 200)
        .attr('x2', line_coordinate.x)
        .attr('y2', line_coordinate.y)
        .attr('stroke', '#C6CBDB');

      //draw axis label
      this.svg
        .append('text')
        .attr('x', label_coordinate.x)
        .attr('y', label_coordinate.y)
        .attr('font-size', 11)
        .attr('fill', '#29263A')
        .text(ft_name);
    }

    let line = d3
      .line()
      .x((d: any) => d.x)
      .y((d: any) => d.y);

    let colors = ['#4A76FB', '#5CDCB5', '#ffc760'];

    var tooltip = d3
      .select('body')
      .append('div')
      .attr('class', 'tooltip absolute z-9999')
      .style('opacity', 0);

    this.legendColors = [];

    for (var i = 0; i < this.data.length; i++) {
      let d = this.data[i];
      let dataObj: any = {};

      this.features.forEach((key, index) => {
        dataObj[key] = d[index];
      });

      let color = colors[i];
      let coordinates = this.getPathCoordinates(
        dataObj,
        this.features,
        radialScale
      );

      // Push to legend array
      this.legendColors.push({
        title: this.selectedRecommendations[i].title,
        color: color,
      });

      //draw the path element
      this.svg
        .append('path')
        .datum(coordinates)
        .attr('d', line)
        .attr('id', i)
        .attr('stroke-width', 3)
        .attr('stroke', color)
        .attr('fill', color)
        .attr('class', 'z-9999 relative')
        .attr('stroke-opacity', 1)
        .attr('opacity', 0.5);
    }
  }

  calcCourses(recommendation: Recommendation): number {
    const courses = recommendation.courses;

    const matches = courses.filter((course: Course) => {
      return (
        this.userProfile.courses.findIndex(
          (userProfileCourse: Course) => userProfileCourse.ID === course.ID
        ) != -1
      );
    });

    const percentage = matches.length / courses.length;

    return percentage * 10;
  }

  calcTopics(recommendation: Recommendation): number {
    const topics: any[] = [];

    recommendation.courses.forEach((course: Course) => {
      course.topics.forEach((topic: Topic) => {
        topics.push(topic);
      });
    });

    const matches = topics.filter((topic: Topic) => {
      return (
        this.userProfile.topics.findIndex(
          (userProfileTopic: Topic) => userProfileTopic.ID === topic.ID
        ) != -1
      );
    });

    const percentage = matches.length / topics.length;

    return percentage * 10;
  }

  calcHoursPerWeek() {
    const numberOfCourses = this.courses.length;

    const counter = this.courses.filter(
      (course: Course) =>
        course.hours_per_week <= this.userProfile.number_of_hours_per_week
    ).length;

    return (counter / numberOfCourses) * 10;
  }

  calcNumberOfWeeks() {
    const numberOfCourses = this.courses.length;

    const counter = this.courses.filter(
      (course: Course) =>
        course.number_of_weeks <= this.userProfile.number_of_weeks
    ).length;

    return (counter / numberOfCourses) * 10;
  }

  calcLevelOfDetail() {
    const numberOfCourses = this.courses.length;
    const counter = this.courses.filter(
      (course: Course) =>
        course.level_of_detail <= this.userProfile.level_of_detail_preference
    ).length;

    return (counter / numberOfCourses) * 10;
  }

  caclcEducationalContentLength() {
    const numberOfCourses = this.courses.length;
    const counter = this.courses.filter(
      (course: Course) =>
        course.education_content_length <=
        this.userProfile.educational_content_length_preference
    ).length;

    return (counter / numberOfCourses) * 10;
  }

  angleToCoordinate(angle: any, value: any, radialScale: any) {
    const x = Math.cos(angle) * radialScale(value);
    const y = Math.sin(angle) * radialScale(value);
    return { x: this.containerWidth / 2 + x, y: 200 - y };
  }

  getPathCoordinates(dataPoint: any, features: any, radialScale: any) {
    const coordinates = [];
    for (var i = 0; i < features.length; i++) {
      const ft_name = features[i];
      const angle = Math.PI / 2 + (2 * Math.PI * i) / features.length;
      coordinates.push(
        this.angleToCoordinate(angle, dataPoint[ft_name], radialScale)
      );
    }
    return coordinates;
  }

  async changeRecommendationSelection(selected: Recommendation[]) {
    this.isLoading = true;

    await firstValueFrom(
      this.httpService.getCoursesByJourney(selected[0].id)
    ).then((res: any) => {
      this.courses = res.data;
    });

    this.isLoading = false;
    this.selectedRecommendations = selected;

    this.createRadar();
  }
}
