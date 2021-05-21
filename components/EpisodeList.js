import React, { useContext, useState } from 'react';
import { SafeAreaView, View, Button, Text, StyleSheet, FlatList, LayoutAnimation, UIManager, Platform } from 'react-native';
import { TouchableHighlight } from 'react-native';
import { ModalContext, DownloadsContext, PlayControlContext } from "./Contexts.js";
import Downloads from './Downloads.js';

//TODO: refactor arrow functions in event handlers - turn renderList into prop

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

export default function EpisodeList(props){
  const modal = useContext(ModalContext);
  const [expanded, setExpanded] = useState(null);
  const downloadsContext = useContext(DownloadsContext);
  const playControlContext = useContext(PlayControlContext);

  const toggleExpanded = (id) => {
    LayoutAnimation.easeInEaseOut();
    if(id == expanded){
      setExpanded(null);
    } else {
      setExpanded(id);
    }
  }

  const renderList = ( episode ) => {
    return (
      <View
        style={[ styles.episodeItem, {
          height: episode.item.id == expanded ? 150 : 50
        }]}
      >
        <TouchableHighlight style={styles.episodeTitle} onPress={( ) => { toggleExpanded(episode.item.id) }}>
          <Text>{episode.item.title}</Text>
        </TouchableHighlight>
        <Text>{episode.item.description}</Text>
        <View style={[ styles.epButtonContainer, { display: episode.item.id == expanded ? "flex" : "none" } ]}>
          <Button
            title="Download"
            onPress={async () => {
               await downloadsContext.add(episode.item)
            }}
            style={styles.epButton}
          />
          <Button
            title="Stream"
            onPress={async () => {
              await playControlContext.playEpisode(episode.item.enclosures[0].url)
            }}
            style={ styles.epButton }
          />
        </View>
      </View>
    );
  }

  const extractKey = ( episode ) => {
    return episode.title;
  }

  return ( 
    <SafeAreaView>
      <FlatList
        data={modal.epListObj.items}
        renderItem={renderList}
        extractKey={extractKey}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  episodeItem: {
    backgroundColor: "#EEEEEE",
    padding: 2,
    margin: 2,
    fontSize: 15,
    height: 50,
    overflow: "hidden",
  },
  episodeTitle: {
    fontSize: 15,
    height: 50,
    width: "auto"
  },
  epButtonContainer: {
    position: "absolute",
    bottom: 0,
    display: "flex",
    flexDirection: "row"
  }
})