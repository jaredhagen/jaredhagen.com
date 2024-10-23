import {
  AnimationClip,
  ColorKeyframeTrack,
  KeyframeTrack,
  VectorKeyframeTrack,
} from "three";

class ColorTransition {
  constructor(name, startColor, endColor, duration) {
    const keyframeTrack = new ColorKeyframeTrack(
      ".material.color",
      [0, duration],
      [...startColor.toArray(), ...endColor.toArray()]
    );
    const animationClip = new AnimationClip(
      name,
      -1, // use -1 to automatically calculate the length from the array of tracks
      [keyframeTrack]
    );

    this.keyframeTrack = keyframeTrack;
    this.animationClip = animationClip;
  }
}

class ZPositionTransition {
  constructor(name, fromZ, toZ, duration) {
    const keyframeTrack = new KeyframeTrack(
      ".position[z]",
      [0, duration],
      [fromZ, toZ]
    );
    const animationClip = new AnimationClip(
      name,
      -1, // use -1 to automatically calculate the length from the array of tracks
      [keyframeTrack]
    );

    this.keyframeTrack = keyframeTrack;
    this.animationClip = animationClip;
  }
}

class ScaleTransition {
  constructor(name, fromVector, toVector, duration) {
    const keyframeTrack = new VectorKeyframeTrack(
      ".scale",
      [0, duration],
      [...fromVector.toArray(), ...toVector.toArray()]
    );
    const animationClip = new AnimationClip(
      name,
      -1, // use -1 to automatically calculate the length from the array of tracks
      [keyframeTrack]
    );

    this.keyframeTrack = keyframeTrack;
    this.animationClip = animationClip;
  }
}

export { ColorTransition, ZPositionTransition, ScaleTransition };
