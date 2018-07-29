import { SettingsProvider } from './../../providers/settings/settings';
import { MarkjaxProvider } from './../../providers/markjax/markjax'
import { MdEditorPage } from './../md-editor/md-editor';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, Events, MenuController,ModalController } from 'ionic-angular';
import { ExternFilesProvider } from '../../providers/extern-files/extern-files'
import { FolderBrowserPage} from './../folder-browser/folder-browser'
import { ExpandableComponent } from '../../components/expandable/expandable'
import { Storage } from "@ionic/storage";
import * as moment from 'moment'
/*
class TodoTxt {
  private tokens: string[]
  private const reTrim = /^\s+|\s+$/g
  private const reSplitSpaces = /\s+/
  private const rePriority = /^\([A-Z]\)$/
  
  constructor(txt: string) {
    
    this.tokens = [];
    let line = txt.replace(this.reTrim,'');
    this.tokens = line.split(this.reSplitSpaces);
  }

  get isComplete(): boolean {
    return this.tokens.length > 0 && this.tokens[0] === 'x'
  }

  get Priority(): string {
    let pos = 0;
    if(this.isComplete) {
      pos++;      
    }
    if(this.tokens.length<=pos) return null;
    let token = this.tokens[pos];
    if(!this.rePriority.test(token)) return null;
    return token[1];
  }

}
*/
@IonicPage()
@Component({
  selector: 'gtd-folder-browser',
  templateUrl: 'gtd-browser.html',
  host: {
    '(document:keyup)': 'onKeyUp($event)'
  }
})
export class GtdBrowserPage {


  searchWords: string;
  fileSelectMode: boolean;

  fileSelected:boolean;
  templateMode: boolean;

  folders: Array<any> = [];
  files: Array<any> = [];
  items: Array<any> = [];
  filterItems: Array<any> = [];
  foldersBackup: Array<any> = [];
  path: string;
  basePath: string;  

  workspace: string = 'Meaning1';

  filterCriteria: any = null;
  groupBySet: Array<any> = [];
  
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private extFiles: ExternFilesProvider,
    private alertCtrl: AlertController,
    private events: Events,
    private menuCtrl: MenuController,    
    private modalCtrl: ModalController,
    private settings: SettingsProvider,
    private storage: Storage,
    private markjax: MarkjaxProvider) {
      this.events.subscribe("filter-changed", r => this.onFilterChanged(r));
      this.events.subscribe("groupby-changed", r => this.onGroupByChange(r));
      this.events.subscribe("folder-selected", (r) => {
        this.path = this.extFiles.base
        this.loadFilesAndDirs()
      })      
  }

  ionViewDidLoad() {
    //this.menuCtrl.close();
    this.fileSelectMode = this.navParams.get('fileSelect')
    this.fileSelectMode = true;
    if (this.fileSelectMode) {
      this.templateMode = this.navParams.get('templates')
      if (this.templateMode) {
        this.extFiles.jumpToDir(this.extFiles._base + '/Meaning/templates')
        this.events.publish('templates-opened')
      }
      this.storage.get("home").then(res => {
        if (res) {
          this._setHome(res)
        }        
      });    

      this.extFiles.jumpToDir(this.extFiles._base)
      this.loadFilesAndDirs()
    }
    else this.loadList()
    console.log('ionViewDidLoad GtdBrowserPage');
    this.path = this.extFiles.base;
    this.basePath = this.extFiles._base;
    this.fileSelected = false;
    this.markjax.init();
  }
  
  ionViewWillLeave(){
    if(this.fileSelectMode && !this.fileSelected) this.events.publish('menu-toggle')
    if(this.templateMode) this.events.publish('templates-closed')
  }

  async loadList(){
    this.folders.splice(0, this.folders.length)
    this.folders = this.folders.concat(await this.extFiles.listDirs())
    this.initBackUp(this.folders)
  }

  async loadFilesAndDirs(){
    //this.folders.splice(0, this.folders.length)
    this.files.splice(0, this.files.length)
    this.items.splice(0, this.files.length)
    //this.folders = this.folders.concat(await this.extFiles.listDirs())
    let f = await this.extFiles.listFiles([])
    if(f)
      this.files = this.files.concat(f)
    this.initBackUp(this.folders)
    let _contexts = []
    let _projects = []
    let _people = []
    let _dues = []
    console.log(JSON.stringify(this.files))
    for(let i=0;i<this.files.length;i++) {
      let tokens = this.splitFileName(this.files[i])
      //this.items.push(tokens)      
      _contexts = _contexts.concat(tokens.filter(token => token.startsWith('@')))
      _projects = _projects.concat(tokens.filter( token => token.startsWith('+')))
      _people = _people.concat(_projects.filter( token => token.startsWith('++')))
      _dues = _dues.concat(tokens[1])
    } 
    //this.events.publish('filter-domain-changed', {contexts: new Set(_contexts), projects: new Set(_projects)})       
    let _peopleSet = new Set(_people)
    this.events.publish('filter-domain-changed', {
      contexts: new Set(_contexts), 
      projects: new Set([..._projects].filter(x => !_peopleSet.has(x))), 
      people: _peopleSet,
      dues: new Set([..._dues])
    })   
    this.onFilterChanged(null)
  }


  initBackUp(arr){
    this.foldersBackup.splice(0, this.folders.length)
    this.foldersBackup.concat(arr)
  }

  async select(){
    this.extFiles.selectDir()
    let r = await this.extFiles.listFiles(['.md','.txt'])
    let dirName = this.path.match(/(\w+)$/g)
    this.settings.addPath(dirName, this.path)
    this.getMetadata(r)
    //this.navCtrl.setRoot(HomePage)
    this.events.publish('bookmark-selected')
    this.events.publish('menu-toggle')
  }

  async openFile(fileName){
    /*
    let ret = {content: null, isTemplate: false}
    if (this.path.includes(`${this.extFiles.defaultAppLocation}/templates`)) ret.isTemplate = true;
    ret.content = await this.extFiles.openFile(fileName)
    this.fileSelected = true
    this.events.publish('file-opened', ret)
    //this.navCtrl.pop()
    this.navCtrl.push(HomePage);
    */
   //const modal = this.modalCtrl.create(MdEditorPage, {file:fileName});
   //modal.present();
   if(fileName.endsWith('.md')) {
    this.navCtrl.push(MdEditorPage,{file:fileName});

    let ret = {content: null, isTemplate: false}
    ret.content = await this.extFiles.openFile(fileName)
    this.fileSelected = true   
    this.events.publish('editor-opened', fileName)
   } else if(fileName.endsWith('.url')) {
     let path = await this.extFiles.openFile(fileName)
     this.extFiles.openExternal(path)
   }
   else {
     this.extFiles.openExternal(this.extFiles.base + '/' + fileName)
   }
  }

  async goTo(dirName){
    this.path = await this.extFiles.goToDir(dirName)
    this.loadFilesAndDirs()
  }

  prevDir(){
    this.path = this.extFiles.prevDir()
    this.loadFilesAndDirs()
  }

  makeDir(dirName){
    this.extFiles.makeDir(dirName)
  }

  async getMetadata(fileNames){
    let a = await this.extFiles.getMetadata(fileNames)
    console.log(
      Math.max.apply(Math, a.map((obj) => {return obj.time;}))
    );3
  }

  doPrompt() {
    let prompt = this.alertCtrl.create({
      inputs: [
        {
          name: 'dirName',
          placeholder: 'Enter new folder name:'
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Save',
          handler: data => {
            console.log('Saved clicked');
          }
        }
      ]
    });
    prompt.present();
    prompt.onDidDismiss((r)=>{
      this.makeDir(r.dirName)
    })
  }


  onKeyUp(e: KeyboardEvent){
    // console.log(e)
    if(e.key === 'Escape') this.navCtrl.pop()

  }

  goBack(){
    this.navCtrl.pop()
  }

  openModal(){

  }

  search(){
    console.log(this.foldersBackup)
    this.folders = this.foldersBackup.filter((el)=>{
      return el.search(this.searchWords) > 0
    })
    console.log(this.folders)
    if (this.folders.length === 0) this.folders = this.foldersBackup
  }

  splitFileName(txt){
    console.log('splitFileName')
    let  reTrim = /^\s+|\s+$/g
    let reSplitSpaces = /\s+/
    let rePriority = /^\([A-Z]\)$/
    let tokens = [];
    let line = txt.replace(reTrim,'');

    tokens = line.split(reSplitSpaces);
    tokens[tokens.length-1] = tokens[tokens.length-1].split('.')[0]
    
    let t0 = tokens[0]
    console.log('t0 = ' + t0)
    if(t0.length>2)
    {
      if(!(t0.charAt(0)=='(' && t0.charAt(2)==')'))
      {
        tokens.splice(0,0,'(D)')
      }
    }
    else
      tokens.splice(0,0,'(D)')

    let due = ''
    if(tokens.length>1) due = tokens[tokens.length-1]
    if(due.startsWith('By20'))
    {
      due = moment(due.substring(2),'YYYY-MM-DD').fromNow()      
      tokens = tokens.slice(0,-1)
    }
    else
      due = ''       
    
    tokens.splice(1,0,due)

   // if(!tokens[0]) tokens[0]='dummy'
/*
    let due = tokens[tokens.length-1]
    if(due.startsWith('By20'))
    {
      due = due.substring(2)
      tokens = tokens.slice(0,-1)
    }
    else
      due = ''       
    tokens = tokens.splice(1,0,due)

    let prty = tokens[0]
    if(prty!==undefined)
    {
      if(!(prty.charAt(0)=='(' && prty.charAt(2)==')'))
      {
        tokens = tokens.splice(0,0,'( )')
      }
    }
    else
      tokens = tokens.splice(0,0,'( )')
      */
    console.log(JSON.stringify(tokens))
  
    return tokens;
  }

  doRefresh() {
    this.loadFilesAndDirs()
  }

  doSelectWS() {
    this.navCtrl.push(FolderBrowserPage, { 'fileSelect': false })
  }

  doNew() {
    console.log('doNew')
    let prompt = this.alertCtrl.create({
      inputs: [
        {
          name: 'name',
          placeholder: '(A) Buy Milk @Errand +Family',       
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Add',
          handler: data => {
            console.log('Add clicked ' + data.name);            
            this.extFiles.saveFile(data.name + '.md', data.name)         
            this.doRefresh();   
          }
        }
      ]
    });
    prompt.present();
    prompt.onDidDismiss((r)=>{
      console.log('onDidDismiss' + r.name)
    })
  }

  doEdit(file) {
    console.log('doEdit : ' + file)
    let prompt = this.alertCtrl.create({
      inputs: [
        {
          name: 'name',
          placeholder: '(A) Buy Milk @Errand +Family',
          value: file
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Save',
          handler: data => {
            if(data.name != file)
              console.log('Saved clicked ' + data.name);
              this.extFiles.renameFile(this.extFiles.base,file, this.extFiles.base,data.name)
              this.doRefresh()
          }
        }
      ]
    });
    prompt.present();
    prompt.onDidDismiss((r)=>{
      console.log('onDidDismiss' + r.name)
    })
  }

  onFilterChanged(r) {
    if(r)
      this.filterCriteria = r
    else
      r = this.filterCriteria
    if(!r)
      r = {contexts: [], projects: [], people: []}
    console.log('gtdbrowser-onfilterchanged ' + JSON.stringify(r))
    this.filterItems.splice(0,this.filterItems.length)
    let hasContexts = []
    if(r.contexts && r.contexts.length>0) {
      let pattern = new RegExp(r.contexts.join('|'))
      hasContexts = this.files.filter(file => file.match(pattern))
    } else {
      hasContexts = hasContexts.concat(this.files);
    }
    console.log('hasContexts = ' + JSON.stringify(hasContexts))

    let hasProjects = []
    if(r.projects && r.projects.length>0) {
      let pattern = new RegExp(r.projects.join('|').replace('+','\\+'))
      hasProjects = hasContexts.filter(file => file.match(pattern))
    } else {
      hasProjects = hasProjects.concat(hasContexts)
    }
    console.log('hasProjects = ' + JSON.stringify(hasProjects))

    for(let i=0;i<hasProjects.length;i++) {
      let tokens = this.splitFileName(hasProjects[i])
      this.filterItems.push({file:hasProjects[i],tokens:tokens})
    }
  }

  onGroupByChange(r) {
    this.groupBySet.splice(0,this.groupBySet.length)    
    this.groupBySet = this.groupBySet.concat(r)    
    console.log('onGroupByChange ' + JSON.stringify(this.groupBySet))
  }

  filterGroup(list:Array<any>,group): Array<any> {
    return list.filter(item => item.tokens.includes(group))
  }

  onFilterItems(ev: any) {
    /*
    this.setItems();
    let val = ev.target.value;

    if (val && val.trim() !== '') {
      this.items = this.items.filter(function(item) {
        return item.toLowerCase().includes(val.toLowerCase());
      });
    }
    */
  }

  _setHome(home) {
    this.extFiles._base = home
    this.settings.setHome(home)
    this.extFiles.base = this.extFiles._base
    this.path = this.extFiles.base
    this.loadList()
    this.loadFilesAndDirs()
  }

  doHomeSetting() {
    let prompt = this.alertCtrl.create({
      inputs: [
        {
          name: 'homepath',
          placeholder: 'Enter home path'
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Save',
          handler: data => {
            console.log('home path saved : ' + data.homepath)
            this.storage.set("home", data.homepath);           
            this._setHome(data.homepath)
          }
        }
      ]
    });
    prompt.present();
    prompt.onDidDismiss((r)=>{
      //this.makeDir(r.dirName)      
    })
  }
  
  doMoveFileToList(file) {
    console.log('doMoveFileToList : ' + file)    
    let alert = this.alertCtrl.create();
    alert.setTitle('Target list');

    alert.addInput({
      type: 'radio',
      label: 'Inbox',
      value: 'Inbox',
      checked: false
    });
    alert.addInput({
      type: 'radio',
      label: 'Next',
      value: 'Next',
      checked: false
    });
    alert.addInput({
      type: 'radio',
      label: 'Waiting',
      value: 'Waiting',
      checked: false
    });
    alert.addInput({
      type: 'radio',
      label: 'Maybe',
      value: 'Maybe',
      checked: false
    });

    alert.addButton('Cancel');
    alert.addButton({
      text: 'OK',
      handler: data => {        
        let tokens = this.extFiles.base.split('@')
        if(tokens.length==2) {
          if(tokens[1]!=data) {
            let newPath = tokens[0] + '@' + data
            console.log('newPath = ' + newPath)
            this.extFiles.renameFile(this.extFiles.base,file,newPath,file)
            this.doRefresh()
          }
        }
      }
    });
    alert.present();
  }
    
   getEntryColor(priority,due) 
   {
     if(priority=='(X)') return 'light'
     else if(due.endsWith('ago')) return 'danger'
     else return 'dark'
   }

   getPriorityColor(priority)
   {
     switch(priority) {
        case '(A)':
          return 'danger'
        case '(B)':
          return 'primary'
        case '(C)':
          return 'secondary'
        case '(D)':
          return 'light'
        default: 
          return 'dark'
     }
   }

   doSelectFolder() {
    console.log('doSelectFolder : ')    
    let alert = this.alertCtrl.create();
    alert.setTitle('Target list');
    
    let folders = this.extFiles.listDirs();
    folders.forEach(element => {
      alert.addInput({
        type: 'radio',
        label: element,
        value: element,
        checked: false
      });
    });

    alert.addButton('Cancel');
    alert.addButton({
      text: 'OK',
      handler: data => {        
        console.log("folder change : " + data)
        this.extFiles.base = this.extFiles._base + '/' + data
        this.events.publish('folder-selected',{})

      }
    })
    alert.present();
  }
}
