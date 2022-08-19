import React from 'react';

export const FlyingAnimContext = React.createContext();

export function updateFlyingAnimText(state,setState,text,finalPos) {
  let copy = Object.assign({},state);
  copy.aboutme.animateNow = text;
  copy.aboutme.finalPos = finalPos;
  setState(copy);
}