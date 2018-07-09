import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { GtdBrowserPage } from './gtd-browser';

@NgModule({
  declarations: [
    GtdBrowserPage,    
  ],
  imports: [
    IonicPageModule.forChild(GtdBrowserPage),
  ],
})
export class GtdBrowserModule {}
