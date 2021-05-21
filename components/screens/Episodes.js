import React, { useContext, useState } from 'react';
import * as rssParser from 'react-native-rss-parser';
import { FlatList, View, Text, Pressable } from 'react-native';
import { DownloadsContext, PlayControlContext } from "../Contexts.js";
import { Card } from "react-native-elements";
const prettyBytes = require('pretty-bytes');

export default function Episodes(){
  const downloadsContext = useContext(DownloadsContext);
  //const [downloadStatus, setDownStatus] = useState();

  const renderList = (file) => {
    return (
      <EpisodeItem file={file} />
      /*<Card>
        <Pressable
          onPress={handlePress}
        >
          <Text>{file.item.title}</Text>
          <Text>{ prettyBytes(file.item.size) + " / " + prettyBytes(file.item.expectedSize) }</Text>
        </Pressable>
      </Card>*/
    );
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
    console.log(props.file.item.fileLocation)
    await playControlContext.play(props.file.item.fileLocation);
  }

  return (
    <Card>
      <Pressable
        onPress={handlePress}
      >
        <Text>{props.file.item.title}</Text>
        <Text>{ prettyBytes(props.file.item.size) + " / " + prettyBytes(props.file.item.expectedSize) }</Text>
      </Pressable>
    </Card>
  );
}