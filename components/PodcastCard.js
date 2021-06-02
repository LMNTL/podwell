import * as React from 'react';
import { Text, View, Image, StyleSheet } from "react-native";
import remoteLog from './RemoteLog.js';
import { Card } from 'react-native-elements';

export default function PodcastCard(props){
  return (
    <Card>
      <View>
        <Text>{props.rssObject.title}</Text>
        {props.rssObject.author ? <Text>{props.rssObject.author}</Text> : null}
        {props.rssObject.hasOwnProperty('image') ? ( <Image
          style={{
            width: parseInt(props.rssObject.image.width || 128),
            height: parseInt(props.rssObject.image.height || 128)
          }}
          source={{ uri: props.rssObject.image.url }}
        /> ) : null}
      </View>
      {props.description && props.rssObject.description ? <Text>{props.rssObject.description.replace(/(<([^>]+)>)/gi, "")}</Text> : null}
      <View style={styles.horizontal}>
        {props.children}
      </View>
    </Card>
  );
}

PodcastCard.defaultProps = {
  description: false
};

const styles = StyleSheet.create({
  horizontal: {
    flexDirection: "row",
  }
});
