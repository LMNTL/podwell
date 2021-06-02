import React, { useContext } from 'react';
import PodcastCard from './PodcastCard.js';
import { Button, FlatList, SafeAreaView, View } from 'react-native'
import { Card } from 'react-native-elements';
import { SubsContext, SubsListContext, ModalContext } from './Contexts.js';


export default function SearchResults(props){
  const subfunctions = useContext(SubsContext);
  const subsList = useContext(SubsListContext);
  const modal = useContext(ModalContext);

  const renderList = ( result ) => {
    return (
        <PodcastCard
          rssObject={result.item}
          description={true}
        >
          <Button
            onPress={props.sub.bind(this, result.item.uri)}
            title={subfunctions.contains(result.item.uri) ? "Unsubscribe" : "Subscribe"}
            color="#841584"
          />
          <Button
            onPress={props.more.bind(this, result.item.uri)}
            title="More info..."
            color="#841584"
          />
      </PodcastCard>
    );
  }

  const extractKey = ( sub ) => {
    return sub.uri;
  }

  return (
    <SafeAreaView>
      <FlatList
        data={props.results}
        renderItem={renderList}
        keyExtractor={extractKey}
      />
    </SafeAreaView>
  );
}