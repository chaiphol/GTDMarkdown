import { Injectable } from '@angular/core';
import * as electron from 'electron';

@Injectable()
export class ElectronProvider {
  constructor() {

  }
  getFs(){
    return electron.remote.require('fs')
  }

  getShell(){
    return electron.remote.require('shell')
  }

}