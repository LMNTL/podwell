import * as React from 'react';
import { Text, Alert, View, StyleSheet, Image, TextInput, Pressable, Button, ActivityIndicator } from 'react-native';

//expo
import { Audio } from "expo-av";
import Constants from 'expo-constants';

//custom components
import Controls from "./components/Controls.js";
import Queue from "./components/Queue.js";
import Subscriptions from "./components/Subscriptions.js";
import AppModal from "./components/AppModal.js";
import EpisodeList from "./components/EpisodeList.js";
import Downloads from "./components/Downloads.js";

//screens
import SubscribeToCast from "./components/screens/SubscribeToCast.js";
import SubscriptionList from "./components/screens/SubscriptionList.js";
import Episodes from "./components/screens/Episodes.js";
import Settings from "./components/screens/Settings.js";

//contexts
import { SubsContext, SubsListContext, RssContext, ModalContext, DownloadsContext, PlayControlContext } from "./components/Contexts.js";

import { NavigationContainer } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

//constants
const Tab = createMaterialTopTabNavigator();

export default class App extends React.PureComponent {
  constructor(){
    super();
    this.state = {
      files: [],
      rssObject: null,
      response: '',
      nowPlaying: null,
      playerReady: false,
      duration: null,
      elapsed: null,
      isPlaying: null,
      isLoaded: false,
      activeModal: 0,
      sublist: [],
      subscribe: () => {},
      unsubscribe: () => {},
      importOPML: () => {},
      exportOPML: () => {},
      epListObj: {}
    }
  }

  componentDidMount = async () => {
    this.downloads = new Downloads(this.updateFiles);
    await this.downloads.load();
    
    this.playbackObject = new Audio.Sound();
 
    this.playbackObject.setOnPlaybackStatusUpdate(this.statusUpdate);
    
    //await this.playbackObject.setProgressUpdateIntervalAsync(500);
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DUCK_OTHERS,
      playThroughEarpieceAndroid: false
    });
   
    const subs = new Subscriptions(this);
    //await subs.load();
    this.setState({
      files: [...this.downloads.files],
      sublist: subs.subs,
      subscribe: subs.add,
      unsubscribe: subs.remove,
      contains: subs.contains,
      importOPML: subs.importOPML,
      exportOPML: subs.exportOPML,
      isLoaded: true
    });
    this.intervalID = setInterval(this.updateFilesInterval, 500);
  }

  componentWillUnmount = () => {
    clearInterval(this.intervalID);
  }

  statusUpdate = (status) => {
    this.setState({
      duration: status.durationMillis,
      elapsed: status.positionMillis,
      isPlaying: status.isPlaying,
      isLoaded: status.isLoaded
    });
  }

  updateFiles = (files) => {
    this.setState({ files: [...files] });
  }

  updateFilesInterval = () => {
    this.updateFiles(this.downloads.files);
  }

  playEpisode = async ( uri ) => {
    console.log("playing episode: " + uri);
    if( this.state.nowPlaying && this.state.nowPlaying != uri){
      await this.playbackObject.unloadAsync();
    }
    try{
      await this.playbackObject.loadAsync({uri: uri}, {shouldPlay: true}, false);
      await this.playbackObject.playAsync();
      this.setState({nowPlaying: uri});
    }
    catch(e){
      console.log(`playback error: ${e.message}`);
    }
  }

  updateEpList = (rssObj) => {
    this.setState({ epListObj: rssObj });
  }

  pauseToggle = async () => {
    const status = await this.playbackObject.getStatusAsync();
    if(status.isPlaying)
      await this.playbackObject.pauseAsync();
    else
      await this.playbackObject.playAsync();
  }

  nextCast = () => {

  }

  scrub = async (deltatime) => {
    let status = await this.playbackObject.getStatusAsync();
    const newTime = Math.max(deltatime + status.positionMillis, 0);
    if( newTime > status.durationMillis )
      this.nextCast();
    else
      await this.playbackObject.setPositionAsync( newTime );
  }

  scrubForward = async () => {
    await this.scrub(30000);
  }

  scrubBack = async () => {
    await this.scrub(-30000);
  }

  setPosition = async (millis) => {
    await this.playbackObject.setPositionAsync( millis );
  }

  updateRss = (rssObject) => {
    this.setState({ rssObject: {...rssObject} });
  }

  setModal = (modal) => {
    this.setState({activeModal: modal});
  }

  render(){
    return (
      <DownloadsContext.Provider value={{
          files: this.state.files,
          add: this.downloads ? this.downloads.add : null,
          remove: this.downloads ? this.downloads.remove : null,
          pause: this.downloads ? this.downloads.pause : null,
          resume: this.downloads ? this.downloads.resume : null,
      }}>
        <SubsContext.Provider value={{
          subscribe: this.state.subscribe,
          unsubscribe: this.state.unsubscribe,
          contains: this.state.contains,
          importOPML: this.state.importOPML
        }}>
          <SubsListContext.Provider value={this.state.sublist}>
            <RssContext.Provider value={{
              rssObject: this.state.rssObject,
              updateRss: this.updateRss }}>
              <ModalContext.Provider value={{
                  activeModal: this.state.activeModal,
                  setModal: this.setModal,
                  epListObj: this.state.epListObj,
                  updateEpList: this.updateEpList }}>
                <PlayControlContext.Provider value={{
                  play: this.playEpisode,
                  pause: this.pauseToggle
                }}>
                  <View style={styles.container}>
                    <AppModal modalId={1}>
                      <EpisodeList playEpisode={this.playEpisode}/>
                    </AppModal>
                    <NavigationContainer>
                      <Tab.Navigator lazy="true">
                        <Tab.Screen name="Add New" component={SubscribeToCast}/>
                        <Tab.Screen name="Subscriptions" component={SubscriptionList}/>
                        <Tab.Screen name="Episodes" component={Episodes}/>
                        <Tab.Screen name="Settings" component={Settings}/>
                      </Tab.Navigator>
                    </NavigationContainer>
                    <Controls
                        play={this.playEpisode}
                        pause={this.pauseToggle}
                        isLoaded={this.state.isLoaded}
                        scrubForward={this.scrubForward}
                        scrubBack={this.scrubBack}
                        setPosition={this.setPosition}
                        elapsed={this.state.elapsed}
                        duration={this.state.duration}
                        isPlaying={this.state.isPlaying}
                    />
                  </View>
                </PlayControlContext.Provider>
              </ModalContext.Provider>
            </RssContext.Provider>
          </SubsListContext.Provider>
        </SubsContext.Provider>
      </DownloadsContext.Provider>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: 'flex',
    alignItems: 'stretch',
    justifyContent: 'center',
    boxSizing: "border-box",
    paddingTop: Constants.statusBarHeight,
    backgroundColor: '#ecf0f1'
  },
  paragraph: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  textInput: {
    backgroundColor: "#999999",
    flex: 0,
  },
  episodeItem: {
    backgroundColor: "#EEEEEE",
    padding: 2,
    margin: 2,
    fontSize: 15,
    height: 50
  },
  settingsButton: {
    textOrientation: "upright"
  }
});