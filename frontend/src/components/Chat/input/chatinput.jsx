import React, { useRef, useState, useEffect } from "react";
import { useChatStore } from "../../../store/useChatStore";
import { useAuthStore } from "../../../store/useAuthStore";
import { ErrorToast } from "../../Toast/Toasters";
import { Plus, Send, X, Mic, Play } from "lucide-react";
import SendLoader from "../../Spinner/SendLoader";
import onEscapeKeyPress from "../../../Events/onEscapeKeyPress";
import { useSettingStore } from "../../../store/useSettingsStore";
import MinimalAudioPlayer from "../../CustomAudioPlayer/CustomAudioPlayer";
import { useTextColor } from "../../../helpers/Colors";

export default function Chatinput() {
  const [text, setText] = useState("");
  const textColor = useTextColor();

  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [videoBase64, setVideoBase64] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState("");
  const { SendMessage, SelectedUser, emitTyping, emitStopTyping } =
    useChatStore();
  const { authUser } = useAuthStore();
  const fileInput = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunks = useRef([]);
  const { myMessageTheme } = useSettingStore();
  useEffect(() => {
    if (!SelectedUser?._id || !authUser?.user?._id) {
      console.warn("Cannot emit typing: Missing SelectedUser or authUser");
      return;
    }
    if (!useAuthStore.getState().socket?.connected) {
      console.warn("Cannot emit typing: Socket not connected");
      return;
    }

    let typingTimeout;
    if (text && !isTyping) {
      setIsTyping(true);
      emitTyping({
        senderId: authUser.user._id,
        receiverId: SelectedUser._id,
      });
    } else if (!text && isTyping) {
      setIsTyping(false);
      emitStopTyping({
        senderId: authUser.user._id,
        receiverId: SelectedUser._id,
      });
    }

    if (text) {
      typingTimeout = setTimeout(() => {
        setIsTyping(false);
        emitStopTyping({
          senderId: authUser.user._id,
          receiverId: SelectedUser._id,
        });
      }, 2000);
    }

    return () => {
      if (typingTimeout) clearTimeout(typingTimeout);
    };
  }, [text, isTyping, authUser, SelectedUser, emitTyping, emitStopTyping]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (e) => {
        chunks.current.push(e.data);
      };
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunks.current, { type: "audio/webm" });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        chunks.current = [];
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      ErrorToast("Failed to access microphone.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setIsRecording(false);
  };

  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const sendVoiceMessage = async () => {
    if (!audioBlob) {
      console.error("No audioBlob to send");
      return;
    }
    try {
      setIsSending(true);
      const base64Audio = await blobToBase64(audioBlob);

      await SendMessage({
        text: "",
        image: null,
        video: null,
        voiceMessage: base64Audio,
      });

      setAudioBlob(null);
      setAudioUrl("");
    } catch (error) {
      console.error("Error sending voice message:", error);
      ErrorToast(
        error?.response?.data?.error || "Failed to send voice message."
      );
    } finally {
      setIsSending(false);
    }
  };

  async function handleMediaUpload(file) {
    try {
      if (!file) {
        ErrorToast("No file selected.");
        return;
      }
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result;
          setMediaPreview(result);
          setMediaType("image");
          setImageBase64(result);
          setVideoBase64(null);
        };
        reader.onerror = () => {
          ErrorToast("Failed to read the image file.");
        };
        reader.readAsDataURL(file);
      } else if (file.type.startsWith("video/")) {
        const maxSize = 20 * 1024 * 1024;
        if (file.size > maxSize) {
          ErrorToast("Video size exceeds 20MB limit.");
          return;
        }
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result;
          setMediaPreview(result);
          setMediaType("video");
          setVideoBase64(result.split(",")[1]);
          setImageBase64(null);
        };
        reader.onerror = () => {
          ErrorToast("Failed to read the video file.");
        };
        reader.readAsDataURL(file);
      } else {
        ErrorToast("Invalid file type. Please upload an image or video.");
        return;
      }
    } catch (error) {
      console.error("Error uploading media:", error);
      ErrorToast("Failed to upload media.");
    }
  }

  function removeMedia() {
    setMediaPreview(null);
    setMediaType(null);
    setImageBase64(null);
    setVideoBase64(null);
    if (fileInput.current) fileInput.current.value = "";
  }
  async function handleSend(e) {
    e.preventDefault();
    if (!text.trim() && !imageBase64 && !videoBase64) {
      ErrorToast("Cannot send empty message, no image, or no video selected.");
      return;
    }
    if (!SelectedUser?._id || !authUser?.user?._id) {
      ErrorToast("Cannot send message: No user selected");
      console.error("Send failed: Missing SelectedUser or authUser");
      return;
    }

    try {
      setIsSending(true);
      await SendMessage({
        text: text.trim(),
        image: imageBase64,
        video: videoBase64,
        voiceMessage: null,
      });
      setText("");
      removeMedia();
      if (isTyping) {
        setIsTyping(false);
        emitStopTyping({
          senderId: authUser.user._id,
          receiverId: SelectedUser._id,
        });
      }
    } catch (error) {
      console.error(error);
      ErrorToast(error?.response?.data?.error || "Failed to send message.");
    } finally {
      setIsSending(false);
    }
  }

  onEscapeKeyPress();
  const textareaRef = useRef(null);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const maxHeight = 6 * 24;
      textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
    }
  };
  useEffect(() => {
    adjustTextareaHeight();
  }, [text]);
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
                setMediaPreview(null);
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
