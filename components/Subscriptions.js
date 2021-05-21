import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as OPML from 'opml-generator';
import * as FileSystem from 'expo-file-system';
import * as XmlParser from 'fast-xml-parser';
import remoteLog from './RemoteLog.js';
import * as rssParser from 'react-native-rss-parser';

export default class Subscriptions{
  constructor(outer){
    this.subs = []; // refactor to a dictionary or object? e.g. [ uri: { obj: {rssObject}, episodes} , ...]
    this.outer = outer;
  }

  add = async (podcastObj, uri) => {
    if(this.contains(uri))
      return false;
    this.subs.push({ ...podcastObj, uri: uri });
    await this.save();
  }

  refresh = async (uri) => {
    
  }

  remove = async (uri) => {
    for(let i = 0; i < this.subs.length; i++){
      if(uri == this.subs[i].uri){
        this.subs = this.subs.filter( sub => sub.uri != uri);
        return await this.save();
      }
    }
    console.log("no subscription to remove")
  }

  removeAll = async () => {
    this.subs = [];
    return await this.save();
  }

  update = () => {
    this.outer.setState({ sublist: [...this.subs] });
  }

  addEpisode = () => {
    
  }

  save = async () => {
    try {
      await AsyncStorage.setItem('@Subscription_List', JSON.stringify(this.subs));
    } catch (e) {
      console.log("Error saving subscriptions: " + e.message);
      return false;
    }
    this.update();
    return true;
  }

  load = async () => {
    try{
      let result = await AsyncStorage.getItem('@Subscription_List');
      if( result === null ){
        console.log('Missing subscription list');
        return false;
      }
      else {
        this.subs = JSON.parse(result);
        this.update();
        return true;
      }
    } catch (e) {
      console.log("Error loading subscriptions: " + e.message);
      return false;
    }
  }

  contains = (uri) => {
    for(let i = 0; i < this.subs.length; i++){
      if(uri == this.subs[i].uri || uri == this.subs[i])
        return true;
    }
    return false;
  }

  getPodcastObj = async (uri, cors=false) => {
    const CORS_PROXY = "https://cors-anywhere.herokuapp.com/";
    let rss = null;
    if( typeof uri == "string"){
      const response = await fetch(cors ? CORS_PROXY + uri : uri);
      const rssText = await response.text();
      rss = rssParser.parse(rssText)["_W"];
      if(rss && rss.hasOwnProperty("items")){
        return [rss, uri];
      }      
    }
    if(rss == null && cors == false){
      return await this.getPodcastObj( uri, true );
    }
    return false;
  }

  importOPML = async (event) => {
    console.log("importing opml...")
    const outer = this;
    DocumentPicker.getDocumentAsync({type: "*/*"})
      .then(async(res) => {
        if(res.type == 'success'){
          //safety checking?
          const opmlString = await FileSystem.readAsStringAsync(res.uri)
          if(XmlParser.validate(opmlString)){
            let opmlSubs = opmlString.match( /(xmlUrl=")(.*?)(?=")/g );
            opmlSubs = opmlSubs.map( str => str.slice(8) );
            opmlSubs = opmlSubs.map( uri => 
              outer.getPodcastObj( uri )
              .then( res => res ? this.add(...res) : null)
              .catch( err => remoteLog(err.message)) );
          } else {
            remoteLog("couldn't validate OPML");
          }
        }
        else {
          remoteLog("document picker failed");
        }
      })
      .catch(err => remoteLog("document picker error: " + err.message));
    return false;
  }

  exportOPML = () => {
    const header = {

    };
    const outline = this.subs.map(el => el);
    OPML(header, outline);
  }
   
}