import React, { useContext } from 'react';
import * as rssParser from 'react-native-rss-parser';
import { View, Button, Text } from 'react-native';
import { SubsContext } from '../Contexts.js';

export default function Settings(){
  const subs = useContext(SubsContext);
  return (
  <View>
    <Button
      title="Import podcasts from OPML file"
      color="#841584"
      onPress={subs.importOPML}
    />
  </View>
  );
}
