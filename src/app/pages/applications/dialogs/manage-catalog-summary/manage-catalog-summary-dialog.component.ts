import {
  OnInit, Component, ViewEncapsulation, Inject,
} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { JobState } from 'app/enums/job-state.enum';
import helptext from 'app/helptext/apps/apps';
import { CatalogItem } from 'app/interfaces/catalog.interface';
import { Job } from 'app/interfaces/job.interface';
import { EntityJobComponent } from 'app/pages/common/entity/entity-job/entity-job.component';
import { EntityUtils } from 'app/pages/common/entity/utils';
import { DialogService, WebSocketService } from 'app/services';
import { AppLoaderService } from 'app/services/app-loader/app-loader.service';
import { LocaleService } from 'app/services/locale.service';

@UntilDestroy()
@Component({
  selector: 'manage-catalog-summary-dialog',
  styleUrls: ['./manage-catalog-summary-dialog.component.scss'],
  templateUrl: './manage-catalog-summary-dialog.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class ManageCatalogSummaryDialog implements OnInit {
  catalog: any;
  statusOptions: string[] = ['All', 'Healthy', 'Unhealthy'];
  trainOptions: string[] = ['All'];
  helptext = helptext;
  selectedStatus: string = this.statusOptions[0];
  selectedTrain: string = this.trainOptions[0];
  filteredItems: any[] = [];
  catalogItems: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<EntityJobComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    protected localeService: LocaleService,
    private ws: WebSocketService,
    private loader: AppLoaderService,
    protected dialogService: DialogService,
  ) {
    this.catalog = data;
  }

  ngOnInit(): void {
    this.loader.open();
    this.ws.job('catalog.items', [this.catalog.label, { retrieve_versions: true }]).pipe(untilDestroyed(this)).subscribe((res: Job<CatalogItem>) => {
      if (res.state === JobState.Success) {
        this.loader.close();
        const result = res.result;
        this.catalogItems = [];
        this.trainOptions = ['All'];
        if (result) {
          Object.keys(result).forEach((trainKey) => {
            const train = result[trainKey];
            this.trainOptions.push(trainKey);
            Object.keys(train).forEach((appKey) => {
              const app = train[appKey];
              Object.keys(app.versions).forEach((versionKey) => {
                const version = app.versions[versionKey];
                version['train'] = trainKey;
                version['app'] = appKey;
                this.catalogItems.push(version);
              });
            });
          });
          this.filteredItems = this.catalogItems;
        }
      }
    }, (err) => {
      this.loader.close();
      new EntityUtils().handleWSError(this, err, this.dialogService);
    });
  }

  onOptionChanged(): void {
    this.filteredItems = this.catalogItems.filter((item) => {
      let isSeletectedTrain = false;
      if (this.selectedTrain == this.trainOptions[0]
        || this.selectedTrain == item.train) {
        isSeletectedTrain = true;
      }

      let isSeletectedStatus = false;
      if (this.selectedStatus == this.statusOptions[0]
        || this.selectedStatus == this.statusOptions[1] && item.healthy
        || this.selectedStatus == this.statusOptions[2] && !item.healthy) {
        isSeletectedStatus = true;
      }

      return isSeletectedTrain && isSeletectedStatus;
    });
  }

  versionStatusLabel(item: any): string {
    let label = '';
    if (this.selectedStatus == this.statusOptions[0]) {
      if (item.healthy) {
        label += '(Healthy)';
      } else {
        label += '(Unhealthy)';
      }
    }

    return label;
  }
}
