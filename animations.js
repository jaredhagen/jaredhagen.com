import { AnimationClip, ColorKeyframeTrack, VectorKeyframeTrack } from "three";

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

class PositionTransition {
  constructor(name, fromVector, toVector, duration) {
    const keyframeTrack = new VectorKeyframeTrack(
      ".position",
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

export { ColorTransition, PositionTransition, ScaleTransition };
