import { Plus, Send, X, Mic, Play } from "lucide-react";
import SendLoader from "../../Spinner/SendLoader";
import MinimalAudioPlayer from "../../CustomAudioPlayer/CustomAudioPlayer";
import { useTextColor } from "../../../helpers/Colors";
import useChatinputLogic from "../../../Funcs/ChatInputFunc";
import onEscapeKeyPress from "../../../Events/onEscapeKeyPress";
export default function Chatinput() {
  const textColor = useTextColor();
  const {
    text,
    setText,
    fileInput,
    textareaRef,
    isSending,
    handleSend,
    mediaPreview,
    mediaType,
    handleMediaUpload,
    removeMedia,
    imageBase64,
    videoBase64,
    startRecording,
    stopRecording,
    isRecording,
    audioUrl,
    sendVoiceMessage,
    setAudioBlob,
    setAudioUrl,
    myMessageTheme,
    setVideoBase64,
    setImageBase64,
    setMediaType,
    adjustTextareaHeight
  } = useChatinputLogic();
  onEscapeKeyPress();
  return (
    <div className="p-2 w-full">
      {mediaPreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            {mediaType === "video" && (
              <div
                className="absolute z-1 cursor-pointer w-7 h-7 rounded-full top-1/2 left-1/2 -translate-x-1/2 
            -translate-y-1/2 flex items-center justify-center"
                style={{ backgroundColor: myMessageTheme }}
              >
                <Play className="size-4" style={{ color: textColor }} />
              </div>
            )}
            {mediaType === "image" ? (
              <img
                src={mediaPreview}
                alt="Preview"
                className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
              />
            ) : (
              <video
                src={mediaPreview}
                className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
              />
            )}
            <button
              onClick={removeMedia}
              className="absolute -top-1.5 cursor-pointer -right-1.5 w-5 h-5 rounded-full bg-base-300 flex items-center justify-center"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}
      {audioUrl && (
        <div className="mb-3 flex justify-center w-full flex-row items-center gap-2">
          <MinimalAudioPlayer src={audioUrl} />
          <button
            onClick={sendVoiceMessage}
            className="btn rounded-lg bg-main-shiny  transition-all"
            disabled={isSending}
          >
            {isSending ? (
              <SendLoader color={myMessageTheme} />
            ) : (
              <Send size={20} style={{ color: textColor }} />
            )}
          </button>
          <button
            onClick={() => {
              setAudioUrl("");
              setAudioBlob(null);
            }}
            className="btn rounded-lg bg-caution transition-all"
          >
            <X size={20} />
          </button>
        </div>
      )}
      {!audioUrl && (
        <form className="flex items-center gap-2" onSubmit={handleSend}>
          <div className="flex-1 flex gap-2">
            <button
              type="button"
              className={`btn bg-transparent p-2 border-0 ring-0 ${
                mediaPreview ? "text-main" : "text-zinc-500"
              }`}
              onClick={() => fileInput.current?.click()}
              disabled={isRecording || isSending}
            >
              <Plus size={20} />
            </button>
            <button
              type="button"
              className="btn bg-transparent p-2 border-0 ring-0 text-zinc-500"
              onClick={() => {
                isRecording ? stopRecording() : startRecording();
                null;
                setMediaType(null);
                setImageBase64(null);
                setVideoBase64(null);
                setText("");
              }}
            >
              <Mic size={20} className={isRecording ? "text-caution" : ""} />
            </button>
            <textarea
              ref={textareaRef}
              rows={1}
              id="ChatInput"
              className="w-full resize-none overflow-y-auto border bg-transparent rounded-lg focus:ring-2 focus:outline-none transition-all p-1.5 px-2"
              style={{
                borderColor: myMessageTheme,
              }}
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                adjustTextareaHeight();
              }}
              placeholder="Type a message"
              onFocus={(e) => {
                e.target.style.borderColor = myMessageTheme;
                e.target.style.boxShadow = `0 0 0 2px ${myMessageTheme}`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = myMessageTheme;
                e.target.style.boxShadow = "none";
              }}
              disabled={isRecording || isSending}
            />
            <input
              type="file"
              accept="image/*,video/*"
              className="hidden"
              ref={fileInput}
              onChange={(e) => handleMediaUpload(e.target.files[0])}
              disabled={isRecording || isSending}
            />
            <button
              type="submit"
              className="btn rounded-lg bg-transparent transition-all hover:scale-105"
              disabled={
                (!text.trim() && !imageBase64 && !videoBase64) || isSending
              }
              style={{
                backgroundColor: myMessageTheme,
                color: textColor,
                opacity:
                  (!text.trim() && !imageBase64 && !videoBase64) || isSending
                    ? 0.5
                    : 1,
                cursor:
                  (!text.trim() && !imageBase64 && !videoBase64) || isSending
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              {isSending ? (
                <SendLoader color={myMessageTheme} />
              ) : (
                <Send size={20} />
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
