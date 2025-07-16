import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { OER } from 'src/app/shared/models/OER';
import { HttpService } from 'src/app/shared/services/http.service';
import { SnackbarService } from 'src/app/shared/services/snackbar.service';

@Component({
  selector: 'exploration-oer',
  templateUrl: './exploration-oer.component.html',
})
export class ExplorationOerComponent implements OnInit {
  @Output() select: EventEmitter<any> = new EventEmitter();
  @Output() onClose: EventEmitter<any> = new EventEmitter();
  @Input() oerId: number;
  @Input() parentId:any;
  public menu: string[] = ['Information'];
  public currentMenuSelection: string = null;
  public isLoading: boolean;
  public oer: OER;

  constructor(
    private httpService: HttpService,
    private snackbarService: SnackbarService
  ) {}

  ngOnInit(): void {
    this.init();
  }

  onChangeMenuSelection(selection: string): void {
    if (this.isLoading) {
      return;
    }

    this.currentMenuSelection = selection;
  }

  init() {
    this.currentMenuSelection = this.menu[0];
    this.getOER();
  }

  async getOER() {
    this.isLoading = true;

    await firstValueFrom(this.httpService.getOER(this.oerId))
      .then((res: any) => {
        this.oer = res.data;
      })
      .catch((e) => {
        this.snackbarService.show(e.error.message, 'danger');
      });

    this.isLoading = false;
  }
}
