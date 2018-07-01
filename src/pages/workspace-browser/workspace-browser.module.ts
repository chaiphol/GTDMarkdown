import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { WorkspaceBrowserPage } from './workspace-browser';

@NgModule({
  declarations: [
    WorkspaceBrowserPage,
  ],
  imports: [
    IonicPageModule.forChild(WorkspaceBrowserPage),
  ],
})
export class WorkspaceBrowserModule {}
