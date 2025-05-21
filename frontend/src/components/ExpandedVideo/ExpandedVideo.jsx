import React, { useRef, useState, useEffect } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
} from "lucide-react";
import { useSettingStore } from "../../store/useSettingsStore";
import formatTime from "../../helpers/FormatVideoTime";
import { useExpandVideo } from "../../store/useExpandVideo";

export default function ExpandedVideo({ src }) {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(1);
  const [progress, setProgress] = useState(0);
  const { myMessageTheme } = useSettingStore();

  const togglePlay = () => {
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const { expandVideo, setExpandVideo, Video, setVideo , setCloseVideo } = useExpandVideo();
  const toggleMute = () => {
    const newMutedState = !isMuted;
    videoRef.current.muted = newMutedState;
    setIsMuted(newMutedState);
    if (newMutedState) {
      setVolume(0);
    } else {
      setVolume(videoRef.current.volume || 1);
    }
  };
  const handleTimeUpdate = () => {
    const current = videoRef.current.currentTime;
    setCurrentTime(current);
    setProgress((current / duration) * 100);
  };

  const handleLoadedMetadata = () => {
    setDuration(videoRef.current.duration);
    setVolume(videoRef.current.volume);
  };

  const handleSeek = (e) => {
    const seekTime = (e.target.value / 100) * duration;
    videoRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
    setProgress(e.target.value);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    setProgress(0);
    videoRef.current.currentTime = 0;
  };
  useEffect(() => {
    setIsPlaying(false);
    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
      }
    };
  }, []);

  return (
    <>
      <style>
        {`
      input[type="range"].custom-thumb::-webkit-slider-thumb {
        background: ${myMessageTheme};
      }
    `}
      </style>
      <div
        ref={playerRef}
        className={`rounded-md relative transition-all duration-300 z-1 w-full max-w-[400px] `}
      >
        <video
          ref={videoRef}
          src={src}
          loop
          autoPlay
          className="w-full h-full rounded-md object-contain cursor-pointer"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
          onClick={togglePlay}
        />
        <div className="absolute bottom-0 p-2 z-4 left-0 right-0 bg-black bg-opacity-50 flex items-center gap-2">
          <button onClick={togglePlay} className="cursor-pointer">
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <div className="flex-1 relative flex items-center">
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={handleSeek}
              className="w-full custom-thumb h-1 rounded-lg appearance-none cursor-pointer transition-all ease-in-out duration-300"
              style={{
                background: `linear-gradient(to right, ${myMessageTheme} ${progress}%, #606060 ${progress}%)`,
              }}
            />
          </div>
          <span className="text-xs text-white">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
          <button
            onClick={togglePlay}
            className="text-white hover:text-gray-300"
          ></button>
          <div className="flex items-center gap-1">
            <button
              onClick={toggleMute}
              className="text-white hover:text-gray-300"
            >
              {isMuted || volume === 0 ? (
                <VolumeX size={16} />
              ) : (
                <Volume2 size={16} />
              )}
            </button>
          </div>
          <button
            onClick={() => {
                setCloseVideo(!expandVideo);
            }}
            className="text-white hover:text-gray-300 cursor-pointer"
          >
            {expandVideo ? <Minimize size={16} /> : <Maximize size={16} />}
          </button>
        </div>
      </div>
    </>
  );
}
