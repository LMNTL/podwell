class Node{
  constructor(value, tail = null){
    this.value = value;
    this.tail = tail;
  }
  setTail(node){
    this.tail = node;
  }
}

export default class Queue{
  constructor(...values){
    this.head = null;
    if(values.length){
      this.head = new Node(values[0]);
      const nodeArray = [this.head];
      let last = this.head;
      for(let i = 1; i < values.length; i++){
        nodeArray[i] = new Node(values[i]);
        last.setTail(nodeArray[i]);
        last = nodeArray[i]
      }
    }
  }

  enqueue = (value) => {
    let current = this.head;
    while(current && current.tail){
      current = current.tail;
    }
    current.value = value;
  }

  dequeue = () => {
    let value = this.head.value;
    this.head = this.head.tail();
    return value;
  }

  log = () => {
    let current = this.head;
    let counter = 0;
    while(current && current.tail){
      console.log(`value ${counter}: ${current.value}`);
      current = current.tail;
      counter++;
    }
    console.log(`value ${counter}: ${current.value}`);
  }
}