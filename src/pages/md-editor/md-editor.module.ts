import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MdEditorPage } from './md-editor';
//import { PopUp } from './home-view-popup';

@NgModule({
  declarations: [MdEditorPage],
  imports: [IonicPageModule.forChild(MdEditorPage)],  
  entryComponents: [
    MdEditorPage,
  ]
})
export class MdEditorPageModule {}
