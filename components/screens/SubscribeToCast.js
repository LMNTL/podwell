import React, { useState, useContext } from 'react';
import * as rssParser from 'react-native-rss-parser';
import { Text, TextInput, Button, StyleSheet, View, Pressable } from 'react-native';
import PodcastCard from '../PodcastCard.js';
import { SubsContext, RssContext } from '../Contexts.js';

const SubscribeToCast = () => {
  const [val, setVal] = useState("https://www.giantbomb.com/podcast-xml/beastcast/");
  const [status, setStatus] = useState("");

  const subsContext = useContext(SubsContext);
  const rssContext = useContext(RssContext);

  const trySubscribe = async (event) => {
    let result = await subsContext.subscribe(rssContext.rssObject, val);
    if(!result){
      setStatus("Subscribed!");
    }
    else {
      setStatus("error: " + result);
    }
  }


  const tryUnsubscribe = async (event) => {
    let result = await subsContext.unsubscribe(rssContext.rssObject.uri);
    if(result === true){
      setStatus("Unsubscribed to " + rssContext.rssObject.title);
    }
    else {
      setStatus("error: " + result);
    }
  }

  const fetchInfo = (uri, cors=false) => {
    console.log(subsContext)
    const CORS_PROXY = "https://cors-anywhere.herokuapp.com/";
    fetch(cors ? CORS_PROXY + uri : uri)
      .then((response) => response.text())
      .then((responseData) => rssParser.parse(responseData))
      .then((rss) => {
        if(rss && rss.hasOwnProperty("items")){
          console.log("fetch success!");
          rssContext.updateRss({...rss, uri: uri});
          return true;
        }
        else {
          setStatus("some error");
        }
      })
      .catch((err) => {
        if(cors){
          setStatus(`Error: ${err.message}`);
        }
      });
    return false;
  }

  const onSubmitEditing = (event) => {
    console.log("fetching URL: " + val)
    
    if(!fetchInfo(val)){
      console.log("retrying with cors proxy");
      fetchInfo(val, true);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.paragraph}>
            Put the RSS feed in below:
      </Text>
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
      {rssContext.rssObject != null && subsContext.contains(rssContext.rssObject.uri) ? (
        <Button
          onPress={tryUnsubscribe}
          title="Unsubscribe"
          color="#841584"
        />
      ) : (
        <Button
          onPress={trySubscribe}
          title="Subscribe"
          color="#841584"
          disabled={rssContext.rssObject == null}
        />
      )}
      <Text style={styles.paragraph}>{status ? status : null}</Text>
      {rssContext.rssObject != null ? (
        <PodcastCard rssObject={rssContext.rssObject}/>
      ) : null}
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
