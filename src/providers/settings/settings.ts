import { Injectable } from '@angular/core';

interface IConfig{
  theme: string,
  paths: [{name: string, url: string}],
  headerFont: string,
  headerColor: string,
  textFont: string,
  textColor: string,
  textSize: string,
  textFocus: boolean,
  home: string,
}


@Injectable()
export class SettingsProvider {

  config: IConfig

  constructor() {
    console.log('Hello SettingsProvider Provider');
    this.config = {
      theme:'light-theme',
      paths: [{ name: '', url: '' }],
      headerFont: 'roboto',
      headerColor: 'grey',
      textFont: 'roboto',
      textColor: '',
      textSize: 'normal',
      textFocus: true,
      home: ''
    }
    this.config.paths.pop()
  }

  initConfig(obj: IConfig){
    this.config = obj
  }

  setTheme(themeName){
    this.config.theme = themeName
  }

  setTextFont(fontName){
    this.config.textFont = fontName
  }

  setTextColor(color){
    this.config.textColor = color
  }

  setHeaderFont(fontName){
    this.config.headerFont = fontName
  }

  setHeaderColor(color){
    this.config.headerColor = color
  }

  setTextSize(value){
    this.config.textSize = value
  }

  getPaths(){
    return this.config.paths.concat()
  }

  getHeaderFont(){
    return this.config.headerFont
  }

  getTextFont(){
    return this.config.textFont
  }

  getTextColor(){
    return this.config.textColor
  }

  getHeaderColor(){
    return this.config.headerColor
  }

  getTextSize(){
    return this.config.textSize
  }

  getActiveTheme(){
    return this.config.theme
  }

  addPath(name, pathUrl){
    const paths = this.config.paths
    paths.push({'name': name, 'url': pathUrl})
    console.log(name,pathUrl)
  }

  removePath(name){
    const paths = this.config.paths
    const index = paths.findIndex( (el) => el.name === name)
    console.log(paths, index);

    paths.splice(index, 1)
  }

  setTextFocus(value: boolean){
    this.config.textFocus = value
  }

  getTextFocus(){
    return this.config.textFocus
  }

  setHome(home:string) {
    this.config.home = home
  }

  getHome() {
    return this.config.home
  }
}
