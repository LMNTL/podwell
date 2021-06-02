import React, { useContext, useState } from 'react';
import * as rssParser from 'react-native-rss-parser';
import { FlatList, View, Text, Pressable, StyleSheet } from 'react-native';
import { DownloadsContext, PlayControlContext } from "../Contexts.js";
import { Card, LinearProgress } from "react-native-elements";
const prettyBytes = require('pretty-bytes');

export default function Episodes(){
  const downloadsContext = useContext(DownloadsContext);
  const [selected, setSelected] = useState([]);

  const renderList = (file) => {
    return (
      <EpisodeItem file={file} selected={selected} toggle={toggleSelected} />
    );
  }

  const toggleSelected = (title) => {
    if(selected.indexOf(title) > -1){
      setSelected( selected.filter(el => el != title) );
    } else {
      setSelected( selected.concat(title) );
    }
  }

  const extractKey = (files) => {
    return files.uri;
  }



  return (
    <View>
      <FlatList
        data={downloadsContext.files}
        renderItem={renderList}
        keyExtractor={extractKey}
      />
    </View>
    );
}

function EpisodeItem(props){
  const playControlContext = useContext(PlayControlContext);
  const handlePress = async () => {
    await playControlContext.play(props.file.item.fileLocation);
  }

  const handleLongPress = () => {
    props.toggle(props.file.item.title);
  }

  return (
    <Card containerStyle={(props.selected.indexOf(props.file.item.title) == -1) ? [] : [styles.selected]}>
      <Pressable
        onPress={handlePress}
        onLongPress={handleLongPress}
      >
        <Text>{props.file.item.title}</Text>
        <LinearProgress
          value={props.file.item.expectedSize ? ( props.file.item.size / props.file.item.expectedSize ) : 0}
          variant={"determinate"}
        />
        <Text>{ prettyBytes(props.file.item.size) + " / " + prettyBytes(props.file.item.expectedSize) }</Text>
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  selected: {
    backgroundColor: "yellow"
  }
});