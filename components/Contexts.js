import React from 'react';

const SubsContext = React.createContext({
  subscribe: () => {},
  unsubscribe: () => {},
  contains: () => {},
  importOPML: () => {},
  exportOPML: () => {}
});

const SubsListContext = React.createContext([]);

const ModalContext = React.createContext({
  activeModal: 0,
  setModal: ()=>{},
  epListObj: {},
  updateEpList: () => {},
});

const DownloadsContext = React.createContext({
  files: [],
  add: () => {},
  remove: () => {},
  pause: () => {},
  resume: () => {},
});

const PlayControlContext = React.createContext({
  play: () => {},
  pause: () => {}
});

const NowPlayingContext = React.createContext({
  nowPlaying: {},
  setNowPlaying: () => {},
});

export { SubsContext, SubsListContext, ModalContext, DownloadsContext, PlayControlContext };