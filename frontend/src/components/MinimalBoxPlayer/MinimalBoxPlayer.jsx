import { useRef, useState, useEffect } from "react";
import { Play, Pause } from "lucide-react";
import { useSettingStore } from "../../store/useSettingsStore";
import getContrastingTextColor from "../../helpers/GetContrast";

export default function MinimalBoxPlayer({ src, name }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const { myMessageTheme } = useSettingStore();
  useEffect(() => {}, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }

    setIsPlaying(!isPlaying);
  };

  return (
    <div className="bg-neutral-900 rounded-2xl p-4 shadow-lg text-white flex flex-col items-center gap-4 px-5 justify-center">
      <button
        onClick={togglePlay}
        className="p-2 rounded-xl hover:bg-neutral-700 transitio"
        style={{
          background: myMessageTheme,
          color: getContrastingTextColor(myMessageTheme),
        }}
      >
        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
      </button>
      <div className="text-start flex flex-col">
        <h2 className="text-md text-gray-300">{name}</h2>
      </div>
      <audio ref={audioRef} src={src} onEnded={() => setIsPlaying(false)} />
    </div>
  );
}
