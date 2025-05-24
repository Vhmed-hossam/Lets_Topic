import { useRef, useState, useEffect } from "react";
import { Play, Pause } from "lucide-react";
import WaveSurfer from "wavesurfer.js";
import { formatVoiceDuration } from "../../helpers/DurationVFormatter";
import { useSettingStore } from "../../store/useSettingsStore";

export default function MinimalAudioPlayer({ src }) {
  const audioRef = useRef(null);
  const waveformRef = useRef(null);
  const waveSurferRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const { myMessageTheme } = useSettingStore();

  useEffect(() => {
    waveSurferRef.current = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: "#d1d5db",
      progressColor: myMessageTheme,
      cursorColor: "transparent",
      barWidth: 2,
      barGap: 1,
      height: 20,
      responsive: true,
      hideScrollbar: true,
    });

    waveSurferRef.current.load(src);

    waveSurferRef.current.on("ready", () => {
      setDuration(waveSurferRef.current.getDuration());
    });

    const audio = audioRef.current;
    waveSurferRef.current.on("audioprocess", () => {
      audio.currentTime = waveSurferRef.current.getCurrentTime();
    });

    waveSurferRef.current.on("seek", (progress) => {
      const newTime = progress * waveSurferRef.current.getDuration();
      audio.currentTime = newTime;
    });

    audio.addEventListener("ended", () => {
      setIsPlaying(false);
      waveSurferRef.current.seekTo(0);
    });

    return () => {
      waveSurferRef.current.destroy();
    };
  }, [src, myMessageTheme]);

  function togglePlay() {
    const audio = audioRef.current;
    if (audio.paused) {
      audio.play();
      waveSurferRef.current.play();
      setIsPlaying(true);
    } else {
      audio.pause();
      waveSurferRef.current.pause();
      setIsPlaying(false);
    }
  }

  return (
    <div className="flex items-center gap-3 dark:bg-gray-800 p-3 bg-white rounded-full">
      <audio ref={audioRef} src={src} preload="metadata" />
      <button onClick={togglePlay} className="text-gray-800 dark:text-white">
        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
      </button>
      <div
        ref={waveformRef}
        className="w-40 h-5 cursor-pointer relative overflow-hidden"
      />
      <h2 className="text-gray-800 dark:text-white">
        {formatVoiceDuration(duration)}
      </h2>
    </div>
  );
}
