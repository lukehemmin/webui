import {
  ChangeDetectionStrategy, Component,
} from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Store } from '@ngrx/store';
import { take } from 'rxjs';
import { toLoadingState } from 'app/helpers/to-loading-state.helper';
import { helptextSystemGeneral as helptext } from 'app/helptext/system/general';
import { GuiFormComponent } from 'app/pages/system/general-settings/gui/gui-form/gui-form.component';
import { IxSlideInService, ResponseOnClose } from 'app/services/ix-slide-in.service';
import { AppState } from 'app/store';
import { guiFormClosedWithoutSaving } from 'app/store/preferences/preferences.actions';
import { waitForPreferences } from 'app/store/preferences/preferences.selectors';
import { waitForGeneralConfig } from 'app/store/system-config/system-config.selectors';

@UntilDestroy()
@Component({
  selector: 'ix-gui-card',
  templateUrl: './gui-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GuiCardComponent {
  readonly generalConfig$ = this.store$.pipe(
    waitForGeneralConfig,
    toLoadingState(),
  );

  readonly preferences$ = this.store$.pipe(
    waitForPreferences,
    toLoadingState(),
  );

  readonly helptext = helptext;

  constructor(
    private store$: Store<AppState>,
    private slideInService: IxSlideInService,
  ) {}

  doAdd(): void {
    this.slideInService.open(GuiFormComponent);
    this.slideInService.onClose$.pipe(take(1), untilDestroyed(this)).subscribe(({ response }: ResponseOnClose) => {
      // TODO: Do not simplify. Refactor slideInService to be more like MatDialog.
      if (response === true) {
        return;
      }

      this.store$.dispatch(guiFormClosedWithoutSaving());
    });
  }
}
