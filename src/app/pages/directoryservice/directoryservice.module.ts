import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgUploaderModule} from 'ngx-uploader';

import {SystemGeneralService} from '../../services';
import {EntityModule} from '../common/entity/entity.module';

import {ActiveDirectoryComponent} from './activedirectory/';
import {routing} from './directoryservice.routing';
import {LdapComponent} from './ldap/';
import {NISComponent} from './nis/';
import { IdmapAdComponent } from './idmap/ad/';

@NgModule({
  imports : [
    EntityModule, FormsModule, ReactiveFormsModule,
    NgUploaderModule, routing
  ],
  declarations : [ LdapComponent, ActiveDirectoryComponent, NISComponent, IdmapAdComponent ],
  providers : [ SystemGeneralService ]
}) export class DirectoryServiceModule {}
