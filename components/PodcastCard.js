import * as React from 'react';
import { Text, View, Image } from "react-native";
import remoteLog from './RemoteLog.js';

export default function PodcastCard(props){
  return (
    <View>
      <Text>{props.rssObject.title}</Text>
      {props.rssObject.hasOwnProperty('image') ? ( <Image
        style={{
          width: parseInt(props.rssObject.image.width || 128),
          height: parseInt(props.rssObject.image.height || 128),
          float: "left"
        }}
        source={{ uri: props.rssObject.image.url }}
      /> ) : null}
      <Text>{props.rssObject.description}</Text>
    </View>
  );
}