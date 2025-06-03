import { useRef, useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { useSettingStore } from "../store/useSettingsStore";
import { useAuthStore } from "../store/useAuthStore";
import { ErrorToast } from "../components/Toast/Toasters";
export default function useChatinputLogic() {
  const [text, setText] = useState("");
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
  const { myMessageTheme } = useSettingStore();
  const fileInput = useRef(null);
  const textareaRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunks = useRef([]);
  const blobToBase64 = (blob) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imageBase64 && !videoBase64) {
      return ErrorToast(
        "Cannot send empty message, no image, or no video selected."
      );
    }

    if (!SelectedUser?._id || !authUser?.user?._id) {
      ErrorToast("Cannot send message: No user selected");
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
        emitStopTyping({
          senderId: authUser.user._id,
          receiverId: SelectedUser._id,
        });
      }
    } catch (error) {
      ErrorToast(error?.response?.data?.error || "Failed to send message.");
    } finally {
      setIsSending(false);
    }
  };

  const handleMediaUpload = async (file) => {
    if (!file) return ErrorToast("No file selected.");
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result;
      setMediaPreview(result);
      if (file.type.startsWith("image/")) {
        setMediaType("image");
        setImageBase64(result);
        setVideoBase64(null);
      } else if (file.type.startsWith("video/")) {
        if (file.size > 20 * 1024 * 1024) {
          ErrorToast("Video size exceeds 20MB limit.");
          removeMedia();
          return;
        }
        setMediaType("video");
        setVideoBase64(result.split(",")[1]);
        setImageBase64(null);
      }
    };

    reader.onerror = () => {
      ErrorToast("Failed to read the file.");
    };

    reader.readAsDataURL(file);
  };

  const removeMedia = () => {
    setMediaPreview(null);
    setMediaType(null);
    setImageBase64(null);
    setVideoBase64(null);
    if (fileInput.current) fileInput.current.value = "";
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (e) =>
        chunks.current.push(e.data);
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunks.current, { type: "audio/webm" });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        chunks.current = [];
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      ErrorToast("Failed to access microphone.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setIsRecording(false);
  };

  const sendVoiceMessage = async () => {
    if (!audioBlob) return;
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
      ErrorToast(
        error?.response?.data?.error || "Failed to send voice message."
      );
    } finally {
      setIsSending(false);
    }
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const maxHeight = 6 * 24;
      textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
    }
  };

  useEffect(() => {
    if (!SelectedUser?._id || !authUser?.user?._id) return;
    if (!useAuthStore.getState().socket?.connected) return;

    let typingTimeout;
    if (text && !isTyping) {
      setIsTyping(true);
      emitTyping({ senderId: authUser.user._id, receiverId: SelectedUser._id });
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

    return () => typingTimeout && clearTimeout(typingTimeout);
  }, [text]);

  useEffect(() => {
    adjustTextareaHeight();
  }, [text]);

  return {
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
    setMediaPreview,adjustTextareaHeight
  };
}
