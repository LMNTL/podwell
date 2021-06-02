import React, { useState, useContext } from 'react';
import * as rssParser from 'react-native-rss-parser';
import { Text, TextInput, Button, StyleSheet, View, Pressable, Keyboard } from 'react-native';
import { Tab } from 'react-native-elements';
import * as FileSystem from 'expo-file-system';

import PodcastCard from '../PodcastCard.js';
import { SubsContext, RssContext } from '../Contexts.js';
import SearchResults from '../SearchResults.js';

const SubscribeToCast = () => {
  const [val, setVal] = useState("https://www.giantbomb.com/podcast-xml/beastcast/");
  const [status, setStatus] = useState("");
  const [searchMode, setSearchMode] = useState(0);
  const [results, setResults] = useState([]);

  const subsContext = useContext(SubsContext);

  const trySubscribe = async (rss) => {
    let rssObject = rss;
    if(typeof rss == "string"){//if we just have a URI, fetch the feed before subscribing
      rssObject = await fetchInfo(rss);
    }
    let result = await subsContext.subscribe(rssObject, val);
    if(!result){
      setStatus("Subscribed!");
    }
    else {
      setStatus("error: " + result);
    }    
  }

  const tryUnsubscribe = async (uri) => {
    let result = await subsContext.unsubscribe(uri);
    if(result === true){
      setStatus("Unsubscribed to " + uri);
    }
    else {
      setStatus("error: " + result);
    }
  }

  const subscribeButton = async (uri) => {
    if(subsContext.contains(uri)){
      await tryUnsubscribe();
    } else {
      await trySubscribe(uri);
    }
  }

  const searchItunes = async () => {
    let searchURI = "https://itunes.apple.com/search?media=podcast&term=";
    searchURI += encodeURI(val.split(" ").join("+"));
    try{
      const responseURI = await FileSystem.downloadAsync(searchURI, FileSystem.cacheDirectory + 'itunes.txt');
      const status = await FileSystem.getInfoAsync(responseURI.uri);
      const responseString = await FileSystem.readAsStringAsync(
        responseURI.uri
      );
      let response = JSON.parse(responseString);
      response = response.results.map((el) => {
        return {
          title: el.collectionName,
          author: el.artistName,
          uri: el.feedUrl,
          image: {
            url: el.artworkUrl100,
            width: 100,
            height: 100
          }
        };
      });
      setResults(response);
    } catch(error) {
      console.log(`itunes error: ${error.message}`)
    }
  }

  const fetchInfo = async (uri, cors=false) => {
    const CORS_PROXY = "https://cors-anywhere.herokuapp.com/";
    let response = await fetch(cors ? CORS_PROXY + uri : uri);
    try{
      response = await response.text();
      const rss = await rssParser.parse(response);
      if(rss && rss.hasOwnProperty("items")){
        console.log("fetch success!");
        return {...rss, uri: uri};
      }
      else {
        throw new Error("RSS response empty");
      }
    }
    catch(e){
      if(!cors){
        return await fetchInfo(uri, true);
      } else {
        setStatus("Error: " + e.message);
        return false;
      }
    }
  }

  const moreInfo = async (uri) => {
    console.log("fetching more info for " + uri)
    const feed = await fetchInfo(uri);
    console.log(feed);
    const updateIndex = results.findIndex(el => el.uri == uri);
    if(updateIndex >= 0){
      const newResults = [...results];
      newResults[updateIndex] = feed;
      console.log(newResults)
      setResults(newResults);
    }
  }

  const onSubmitEditing = async (event) => {
    Keyboard.dismiss();
    switch(searchMode){
      case 0: //rss url
        setResults( [ await fetchInfo(val) ] );
        break;
      case 1: //itunes
        await searchItunes();
        break;
      case 2: //match similar podcasts
        //implement me!
        break;
      default:
        break;
    }
    
  }

  const onChangeTab = (event) => {
    setSearchMode(event);
    setVal("");
    setResults([]);
  }

  return (
    <View style={styles.container}>
      <Tab value={searchMode} onChange={onChangeTab}>
        <Tab.Item title="RSS" />
        <Tab.Item title="iTunes" />
        <Tab.Item title="Similar" />
      </Tab>
      <TextInput
        style={styles.paragraph, styles.textInput}
        onChangeText={setVal}
        onSubmitEditing={this.onSubmitEditing}
        value={val}
      />
      <Button
        onPress={onSubmitEditing}
        title="Submit"
        color="#841584"
        disabled={!val}
      />
      <Text style={styles.paragraph}>{status ? status : null}</Text>
      <SearchResults
        results={results}
        more={moreInfo}
        sub={trySubscribe}
        unsub={tryUnsubscribe}
      />
    </View>
  );
}

export default SubscribeToCast;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: 'flex',
    alignItems: 'stretch',
    justifyContent: 'center',
    backgroundColor: '#ecf0f1',
    padding: 8,
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
});
