import React, { useContext } from 'react';
import { TouchableOpacity } from 'react-native-gesture-handler';
import PodcastCard from '../PodcastCard.js';
import { Button, FlatList, SafeAreaView, View } from 'react-native'
import { SubsContext, SubsListContext, ModalContext } from '../Contexts.js';


export default function SubscriptionList(){
  const subs = useContext(SubsListContext);
  const subfunctions = useContext(SubsContext);
  const modal = useContext(ModalContext);

  const setModal = (sub) => {
    modal.updateEpList(sub.item);
    modal.setModal(1);
  }

  const renderList = ( sub ) => {
    return (
      <View>
        <PodcastCard rssObject={sub.item}/>
        <Button
          onPress={()=>subfunctions.unsubscribe(sub.item.uri)}
          title="Unsubscribe"
          color="#841584"
        />
        <Button
          onPress={()=>{setModal(sub)}}
          title="Episodes"
          color="#841584"
        />
      </View>
    );
  }

  const extractKey = ( sub ) => {
    return sub.uri;
  }

  return (
    <SafeAreaView>
      <FlatList
        data={subs}
        renderItem={renderList}
        keyExtractor={extractKey}
      />
    </SafeAreaView>
  );
}