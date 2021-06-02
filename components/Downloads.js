import AsyncStorage from '@react-native-async-storage/async-storage';
import { ToastAndroid } from 'react-native';
import Constants from 'expo-constants';
import * as DocumentPicker from 'expo-document-picker';
import * as OPML from 'opml-generator';
import * as FileSystem from 'expo-file-system';
import remoteLog from './RemoteLog.js';

//TODO: remove query strings when saving download

export default class Downloads{
  constructor(update){
    this.downloadLocation = FileSystem.documentDirectory;
    this.files = [];
    this.update = update;
  }

  add = async (episode) => {
    const uri = episode.enclosures[0].url;
    let extension = uri.split(".");
    extension = extension[extension.length-1];
    extension = extension.split("?")[0]; //removing query strings
    const episodeTitle = episode.title.replace(/[/\\?%*:|"<>]/g, '-'); //and making sure filename is valid
    const filename = episodeTitle + "." + extension;
    const exists = await this.pathExists(filename);
    if( exists ){
      console.log(`${filename} already exists`)
      return false;
    }
    console.log(`creating ${filename}...`);
    const file = new File({
      rssObject: null,
      uri: uri,
      fileLocation: this.downloadLocation + filename,
      filename: filename,
      title: episodeTitle
    });
    const download = FileSystem.createDownloadResumable(
      uri,
      file.fileLocation,
      {},
      file.updateProgress
    );
    file.download = download;
    this.files.push(file);
    await this.save();
    await this.download(file);
  }

  download = async (file) => {
    try{
      const result = await file.download.downloadAsync();
      if(result.status == 200){
        ToastAndroid.show(`${file.filename} downloaded`, ToastAndroid.SHORT);
        file.status = "complete";
      } else {
        ToastAndroid.show(`${file.filename} download failed`, ToastAndroid.SHORT);
        file.status = "download failed";
      }
    } catch(e){
      ToastAndroid.show(`download error: ${e.message}`, ToastAndroid.SHORT);
      file.status = "error";
    }
    await this.save();
  }

  remove = async () => {
  }

  pathExists = async (filename) => {
    const dir = await FileSystem.getInfoAsync( this.downloadLocation );
    if(!dir.exists || !dir.isDirectory){
      await FileSystem.makeDirectoryAsync(this.downloadLocation, {intermediates: true});
    }
    const file = await FileSystem.getInfoAsync( this.downloadLocation + filename);
    return file.exists;
  }

  pause = async (file) => {
    try {
      await file.download.pauseAsync();
      console.log('paused ' + file.uri);
      file.resumeData = file.download.savable()
      await this.save();
    } catch (e) {
      console.log("pause error: " + e.message);
    }
  }

  resume = async (file) => {
    //todo: handle creating download if file object exists but doesn't have a download
    if(file.download instanceof FileSystem.DownloadResumable){
      try {
        await file.download.resumeAsync();
        console.log('resumed ' + file.uri);
        await this.save();
      } catch (e) {
        console.log("resume error: " + e.message);
      }
    } else {
      const downloadArgs = [
        file.uri,
        file.fileLocation,
        {},
        file.updateProgress
      ];
      if(file.resumeData && typeof file.resumeData == "string"){
        downloadArgs.push(file.resumeData);
      }
      const download = new FileSystem.DownloadResumable(...downloadArgs);
      file.download = download;
      await this.save();
      await this.download(file);
    }
  }

  indexOf = (uri) => {
    return this.files.findIndex((el) => el.uri == uri);
  }

  save = async () => {
    const serializable = this.files.map((file) => {
      return {
        uri: file.uri,
        fileLocation: file.fileLocation,
        filename: file.filename,
        title: file.title,
        expectedSize: file.expectedSize,
        size: file.size,
        timestamp: file.timestamp,
        status: file.status,
        resumeData: file.resumeData
      }
    });
    try {
      await AsyncStorage.setItem('@Downloads', JSON.stringify(serializable));
    } catch (e) {
      console.log("Error saving downloads: " + e.message);
      return false;
    }
    console.log(this.update)
    this.update(this.files);
    console.log("updated files");
    return true;
  }

  load = async () => {
    try {
      let filesObject = await AsyncStorage.getItem('@Downloads');
      if(!filesObject)
        return false;
      filesObject = JSON.parse(filesObject);
      for(let i = 0; i < filesObject.length; i++){
        this.files[i] = new File(filesObject[i]);
      }
    } catch (e) {
      console.log("Error saving downloads: " + e.message);
      return false;
    }
    return true;
  }

}

class File{
  constructor(options){
    this.rssObject = options.rssObject ? options.rssObject : null;
    this.uri = options.uri;
    this.fileLocation = options.fileLocation;
    this.filename = options.filename;
    this.expectedSize = options.expectedSize ? options.expectedSize : -1;
    this.size = options.size ? options.size: -1;
    this.timestamp = options.timestamp ? options.timestamp : Date.now();
    this.status = options.status ? options.status : "starting";
    this.resumeData = options.resumeData ? options.resumeDate : "";
    this.title = options.title;
  }

  updateProgress = (status) => {
    this.expectedSize = status.totalBytesExpectedToWrite;
    this.size = status.totalBytesWritten;
  }
}