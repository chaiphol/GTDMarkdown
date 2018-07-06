import { Events } from 'ionic-angular';
import { Injectable } from "@angular/core";
import markjax from "markjax";
import marked from "marked";
import * as mermaid from "mermaid"
/*
  Generated class for the MarkjaxProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular DI.
*/

interface IHeading {
  id: string,
  content: string,
  level: string
}

@Injectable()
export class MarkjaxProvider {
  settings: Object;
  headers : Array<IHeading> = [];

  constructor(private events: Events) {
    console.log("Hello MarkjaxProvider Provider");
    var renderer = new marked.Renderer();
    
    // renderer.listitem = text => {
    //   if (/^\s*\[[x ]\]\s*/.test(text)) {
    //     text = text
    //       .replace(
    //         /^\s*\[ \]\s*/,
    //         '<ion-icon name="square"></ion-icon>'
    //       )
    //       .replace(
    //         /^\s*\[x\]\s*/,
    //         '<ion-icon name="checkbox"></ion-icon> '
    //       );
    //     return '<li style="list-style: none">' + text + "</li>";
    //   } else {
    //     return "<li>" + text + "</li>";
    //   }
    // };
    renderer.heading = (text, level) => {
      this.headers.push({id:`H${this.headers.length+1}`, content: text, level})
      return `<h${level} id=H${this.headers.length}> ${text} </h${level}>`;
    };

    renderer.code = function (code, language) {
      if(code.match(/^sequenceDiagram/)||code.match(/^graph/)){
         return '<div class="mermaid">'+code+'</div>';
      }
    };
    
    this.settings = {
      renderer,
      gfm: true,
      tables: true,
      breaks: true,
      pedantic: false,
      sanitize: true,
      smartLists: true,
      smartypants: true,
      //baseUrl: 'file://c:/users/dt66017/Meaning'
    };
    
  }

  init() {
    mermaid.initialize({
      theme: 'forest',
      startOnLoad:true
    })
  }

  parse(source, dest) {
    markjax(source, dest, this.settings);
    this.events.publish('created-heading', this.headers.concat())
    this.headers = [];
    mermaid.init()
  }

  parse2(source, dest) {
    var renderer = new marked.Renderer();
      renderer.code = function (code, language) {
        if(code.match(/^sequenceDiagram/)||code.match(/^graph/)){
           return '<div class="mermaid">'+code+'</div>';
        }
      };
    dest.innerHTML = marked(source, { renderer: renderer });
    mermaid.init()
  }
}
