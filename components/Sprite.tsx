"use client";
import { useState, useRef, useEffect } from "react";
import { useInterval } from "usehooks-ts";

interface SpriteProps {
  src: string;
  width: number;
  height: number;
  fps: number;
  isPlaying: boolean;
  frameStart: number;
  frameEnd: number;

  loop?: boolean;
  isHidden?: boolean;
}

export default function Sprite(props: SpriteProps) {
  // Get Frame positions
  const imgRef = useRef<HTMLImageElement>(null);

  const [xFrames, setXFrames] = useState(0);
  const [yFrames, setYFrames] = useState(0);

  useEffect(() => {
    if (imgRef.current) {
      setXFrames(imgRef.current.width / props.width);
      setYFrames(imgRef.current.height / props.height);
    }
  }, []);

  function calculateFramePosition() {
    let xPosition = (currentFrame % xFrames) * props.width;
    let yPosition = Math.floor(currentFrame / xFrames) * props.height;

    setFramePosition(`-${xPosition}px -${yPosition}px`);
  }

  const [framePosition, setFramePosition] = useState<string>("-0px -0px");

  // Animate Frames
  const [currentFrame, setCurrentFrame] = useState<number>(props.frameStart);

  useInterval(
    () => {
      if (currentFrame < props.frameEnd) {
        setCurrentFrame(currentFrame + 1);
        calculateFramePosition();
      }

      if (props.loop && currentFrame >= props.frameEnd) {
        setCurrentFrame(props.frameStart);
      }
    },
    props.isPlaying ? 1000 / props.fps : null,
  );

  return (
    <div
      onClick={() => {}}
      style={{
        background: `url(${props.src})`,
        width: props.width,
        height: props.height,
        backgroundPosition: `${framePosition}`,
        display: props.isHidden ? "none" : "",
      }}
    >
      <img ref={imgRef} src={props.src} className="hidden" alt="imageElement" />
    </div>
  );
}
