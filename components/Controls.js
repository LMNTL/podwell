import * as React from 'react';
import { Text, StyleSheet, View, Pressable, Dimensions } from 'react-native';
import Slider from '@react-native-community/slider';
import { Ionicons, AntDesign } from '@expo/vector-icons';

const dimensionWindow = Dimensions.get('window');
const width = dimensionWindow.width * dimensionWindow.scale; //full width
const height = dimensionWindow.height * dimensionWindow.scale; //full height

export default class Controls extends React.Component {
  constructor(props){
    super(props);
    this.state = {
    };
  }

  formatMs = (millis) => {
    const seconds = millis/1000;
    const minutes = seconds/60;
    const hours = minutes/60;
    return `${parseInt(hours).toString().padStart(2, "0")}:${parseInt(minutes % 60).toString().padStart(2, "0")}:${parseInt(seconds % 60).toString().padStart(2, "0")}`;
  }

  seekPosition = async (event) => {
    await this.props.setPosition(event);
  }

  render = () => {
    return (
      <View style={styles.stickyFooter}>
        <View style={styles.container}>
          <Pressable
            onPressOut={this.props.scrubBack}
            style={styles.child}
            disabled={!this.props.isLoaded}
          >
            <AntDesign name="banckward" size={40} color="black" />
          </Pressable>
          <Pressable
            onPressOut={this.props.pause}
            style={styles.child}
            disabled={!this.props.isLoaded}
          >
            <AntDesign name={this.props.isPlaying ? "pause" : "caretright"} size={40} color="black" />
          </Pressable>
          <Pressable
            onPressOut={this.props.scrubForward}
            style={styles.child}
            disabled={!this.props.isLoaded}
          >
            <AntDesign name={"forward"} size={40} color="black" />
          </Pressable>
        </View>
        <Text style={styles.flex}>
          {this.props.elapsed ? this.formatMs(this.props.elapsed) : "-"}/{this.props.duration ? this.formatMs(this.props.duration) : "-"}
        </Text>
        <Slider
          elevation={3}
          style={{flex: 1, height: 40}}
          value={this.props.elapsed}
          minimumValue={0}
          maximumValue={this.props.duration ? this.props.duration : 0 }
          disabled={false}
          onSlidingComplete={this.seekPosition}
          minimumTrackTintColor="#FFFFFF"
          maximumTrackTintColor="#000000"
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: "row",
    alignItems: 'stretch',
    padding: 0
  },
  stickyFooter: {
    flex: 0.2
  },
  child: {
    flex: 1,
    backgroundColor: "#bbb",
    padding: 20,
    justifyContent: "center"
  },
  buttonText: {
    fontSize: 12,
  },
  flex: {
    flex: 1
  }
});
