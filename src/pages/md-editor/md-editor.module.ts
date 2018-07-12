import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MdEditorPage } from './md-editor';
import { PopUp } from './md-editor-view-popup';

@NgModule({
  declarations: [MdEditorPage,PopUp],
  imports: [IonicPageModule.forChild(MdEditorPage)],  
  entryComponents: [    
    PopUp
  ]
})
export class MdEditorPageModule {}
