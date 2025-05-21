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
import { useTextColor } from "../../helpers/Colors";


export default function CustomVideoPlayer({ src }) {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [lastVolume, setLastVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const { myMessageTheme } = useSettingStore();
  const { setExpandVideo, setVideo, setVidDuration } = useExpandVideo();
  const textColor = useTextColor();

  const syncPlayingState = () => {
    if (videoRef.current) {
      setIsPlaying(!videoRef.current.paused && !videoRef.current.ended);
    }
  };

  const togglePlay = () => {
    if (videoRef.current.paused || videoRef.current.ended) {
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.error("Playback failed:", err);
          setIsPlaying(false);
        });
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const newMutedState = !isMuted;
    videoRef.current.muted = newMutedState;
    setIsMuted(newMutedState);
    if (newMutedState) {
      setLastVolume(volume);
      setVolume(0);
      videoRef.current.volume = 0;
    } else {
      const restoredVolume = lastVolume || 1;
      setVolume(restoredVolume);
      videoRef.current.volume = restoredVolume;
    }
  };

  const handleTimeUpdate = () => {
    const current = videoRef.current.currentTime;
    setCurrentTime(current);
    setProgress((current / duration) * 100);
  };

  const handleLoadedMetadata = () => {
    setDuration(videoRef.current.duration);
    setVidDuration(videoRef.current.duration);
    setVolume(videoRef.current.volume);
    setLastVolume(videoRef.current.volume);
  };

  const handleSeek = (e) => {
    const seekTime = (e.target.value / 100) * duration;
    videoRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
    setProgress(e.target.value);
  };

  const toggleExpandedMode = () => {
    setExpandVideo(true);
    setVideo(src);
    setCurrentTime(currentTime);
    setIsPlaying(false);
    setCurrentTime(0);
    setProgress(0);
    videoRef.current.currentTime = 0;
    videoRef.current.pause();
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    setProgress(0);
    videoRef.current.currentTime = 0;
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        syncPlayingState();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);

    return () => {
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
    };
  }, []);

  useEffect(() => {
    syncPlayingState();
  }, [videoRef]);

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
        className="rounded-md relative transition-all duration-300 z-1 w-full max-w-[300px]"
      >
        <video
          ref={videoRef}
          src={src}
          className="w-full h-full rounded-md object-contain cursor-pointer"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
          onClick={togglePlay}
          playsInline
          muted={isMuted}
          preload="auto"
        />
        {!isPlaying && (
          <div
            className="absolute w-10 h-10 rounded-full top-1/2 left-1/2 -translate-x-1/2 
               -translate-y-1/2 flex items-center justify-center cursor-pointer transition-all duration-300"
            style={{
              background: myMessageTheme,
              color: textColor ,
            }}
            onClick={togglePlay}
          >
            <Play size={22} />
          </div>
        )}
        <div className="absolute bottom-0 p-2 z-4 left-0 right-0 bg-black bg-opacity-50 flex items-center gap-2">
          <button onClick={togglePlay} className="cursor-pointer text-white">
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
            onClick={toggleExpandedMode}
            className="text-white hover:text-gray-300"
          >
            <Maximize size={16} />
          </button>
        </div>
      </div>
    </>
  );
}
