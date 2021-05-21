import React, { useContext } from 'react';
import { Modal, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { Divider } from 'react-native-elements';
import { ModalContext } from "./Contexts.js";

const dimensionWindow = Dimensions.get('window');
const width = dimensionWindow.width * dimensionWindow.scale; //full width
const height = dimensionWindow.height * dimensionWindow.scale; //full height


export default function AppModal(props){
  const modalContext = useContext(ModalContext);
  const isVisible = props.modalId == modalContext.activeModal;
  return (
    <Modal
      animationType='slide'
      visible={isVisible}
      transparent={false}
      style={[styles.modal, {display: (isVisible ? "flex" : "none" ) }]}
      propagateSwipe={true}
      onRequestClose={() => console.log("modal closed")}
    >
      {props.title ? <Text style={styles.title}>{props.title}</Text> : null}
      {props.title ? <Divider style={styles.divider}/> : null}
      {props.children}
      <Pressable
        style={styles.back}
        onPress={()=>{modalContext.setModal(0)}}
      >
        <Text>X</Text>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    position: "absolute",
    elevation: 2,
    border: "0.2em solid rgba(154,0,155,0.2)",
    borderRadius: 6,
    overflow: "hidden",
    boxSizing: "border-box",
    padding: width * 0.1,
    margin: width * 0.05,
    flex: 1,
    width: width * 0.9,
    height: height * 0.9,
    backgroundColor: "white"
  },
  title: {
    fontSize: "1em",
  },
  back: {
    position: "absolute",
    right: 10,
    backgroundColor: "#dd00dd",
    padding: width * 0.05,
    fontFamily: "arial"
  },
  divider: {
    margin: "0.5em",
    backgroundColor: "purple"
  }
});