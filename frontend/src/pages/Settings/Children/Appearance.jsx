import React, { useState, useEffect, useRef } from "react";
import { Themes } from "../../../Data/Themes";
import { ReadyThemes } from "../../../Data/MsgThemes";
import { useSettingStore } from "../../../store/useSettingsStore";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import getContrastingTextColor from "../../../helpers/GetContrast";
import { Mic, Plus, Send, X } from "lucide-react";
import getRandomColor from "../../../helpers/GetRandomColor";
import Preview_Messages from "../../../Data/Preview_Messages";
import { defaultImage } from "../../../Data/Avatars";
import { useTextColor } from "../../../helpers/Colors";

export default function Appearance() {
  const textColor = useTextColor();

  const isValidHex = (hex) => /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex);
  const {
    theme,
    SetTheme,
    myMessageTheme,
    SetMyMessageTheme,
    mySenderTheme,
    SetMySenderTheme,
  } = useSettingStore();
  const toggleRef = useRef(null);
  const [messageColor, setMessageColor] = useState(myMessageTheme);
  const [senderColor, setSenderColor] = useState(mySenderTheme);
  const [messageColorInput, setMessageColorInput] = useState(myMessageTheme);
  const [senderColorInput, setSenderColorInput] = useState(mySenderTheme);
  const [isToggleOpen, setIsToggleOpen] = useState(false);
  const [Selectedcolor, setSelectedcolor] = useState("");
  useEffect(() => {
    setMessageColor(myMessageTheme);
    setMessageColorInput(myMessageTheme);
  }, [myMessageTheme]);

  useEffect(() => {
    setSenderColor(mySenderTheme);
    setSenderColorInput(mySenderTheme);
  }, [mySenderTheme]);

  const formRef = useRef(null);
  useGSAP(() => {
    gsap.fromTo(
      formRef.current,
      { opacity: 0, y: -10 },
      { opacity: 1, duration: 1, ease: "power4.out", y: 0 }
    );
  });
  useGSAP(
    () => {
      if (isToggleOpen) {
        toggleRef.current.style.display = "block";
        gsap.fromTo(
          toggleRef.current,
          { opacity: 0, scale: 0.8, y: -10 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.3,
            ease: "back.out(2.1)",
          }
        );
      } else {
        gsap.to(toggleRef.current, {
          opacity: 0,
          scale: 0.8,
          y: 10,
          duration: 0.2,
          ease: "power2.in",
          onComplete: () => {
            if (toggleRef.current) {
              toggleRef.current.style.display = "none";
            }
          },
        });
      }
    },
    { dependencies: [isToggleOpen] }
  );
  const myTextColor = textColor;
  const mySenderTextColor = getContrastingTextColor(mySenderTheme);

  return (
    <>
      <div
        className="container mx-auto px-4 max-w-5xl flex-1 space-y-2"
        ref={formRef}
      >
        <section className="space-y-2">
          <div>
            <h2 className="text-lg font-semibold">Theme</h2>
            <p className="text-sm text-base-content/70">Choose Your Theme</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-5 p-4 bg-main/25 rounded-xl">
            {Themes.map((t) => (
              <button
                key={t}
                className={`group flex flex-col items-center gap-1.5 p-2 rounded-lg transition-colors 
              ${theme === t ? "bg-main text-white" : "hover:bg-second/25"}`}
                onClick={() => SetTheme(t)}
              >
                <div
                  className="relative h-8 w-full min-w-20 rounded-md overflow-hidden"
                  data-theme={t}
                >
                  <div className="absolute inset-0 grid grid-cols-4 gap-px p-1">
                    <div className="rounded bg-root"></div>
                  </div>
                </div>
                <span className="text-[11px] font-medium truncate w-full text-center">
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </span>
              </button>
            ))}
          </div>
        </section>
        <section
          className="space-y-3 border border-main rounded-xl"
          style={{ borderColor: myMessageTheme }}
        >
          <div className="p-4 space-y-4 overflow-y-auto rounded-xl">
            <div className="flex items-center gap-3 border-b border-zinc-700 p-2">
              <div className="w-8 h-8 rounded-full relative bg-main flex items-center justify-center">
                <img src={defaultImage} alt="Logo" />
                <span className="absolute -bottom-0.5 left-5.5 w-2.5 h-2.5 bg-success rounded-full" />
              </div>
              <div>
                <h3 className="font-medium text-sm">Your Friend</h3>
                <p className="text-xs text-base-content/70">Online</p>
              </div>
            </div>
            {Preview_Messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.isSent ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  style={{
                    backgroundColor: message.isSent
                      ? myMessageTheme
                      : mySenderTheme,
                    color: message.isSent ? myTextColor : mySenderTextColor,
                  }}
                  className="max-w-[80%] rounded-xl p-3 mb-2 shadow-sm"
                >
                  <p className="text-sm">{message.content}</p>
                  <p className="text-[10px] mt-1.5 text-se/70">00:00</p>
                </div>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <div className="flex-1 flex gap-2">
                <button
                  className={`hidden sm:flex btn bg-transparent p-2 border-0 ring-0 text-zinc-500`}
                >
                  <Plus size={20} />
                </button>
                <button
                  className={`hidden sm:flex btn bg-transparent p-2 border-0 ring-0 text-zinc-500`}
                >
                  <Mic size={20} />
                </button>
                <input
                  className={`w-full input border bg-transparent rounded-lg focus:ring-2 transition-all focus:outline-none`}
                  placeholder="Type a message"
                  style={{ borderColor: messageColor }}
                  readOnly
                  onFocus={(e) => {
                    e.target.style.borderColor = messageColor;
                    e.target.style.boxShadow = `0 0 0 2px ${messageColor}`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = messageColor;
                    e.target.style.boxShadow = "none";
                  }}
                />
                <button
                  className="btn rounded-lg disabled:text-zinc-600 bg-transparent transition-all hover:scale-102"
                  style={{ backgroundColor: messageColor }}
                >
                  <Send
                    size={20}
                    style={{ color: getContrastingTextColor(messageColor) }}
                  />
                </button>
              </div>
            </div>
          </div>
        </section>
        <section className="space-y-2">
          <h3 className="text-lg font-semibold">
            Customize your message theme
          </h3>
          <div className="flex flex-wrap gap-6 max-md:flex-col items-center">
            <div className="flex-1 w-full">
              {" "}
              <div className="p-2">
                <label
                  htmlFor="message-color-picker"
                  className="text-sm mb-1 block"
                >
                  Message Color Picker
                </label>

                <input
                  type="text"
                  value={messageColorInput}
                  onChange={(e) => setMessageColorInput(e.target.value.trim())}
                  onBlur={() => {
                    let input = messageColorInput;
                    if (
                      !input.startsWith("#") &&
                      /^[0-9A-Fa-f]{3,6}$/.test(input)
                    ) {
                      input = "#" + input;
                    }
                    if (isValidHex(input)) {
                      setMessageColor(input);
                      SetMyMessageTheme(input);
                      setMessageColorInput(input);
                    } else {
                      setMessageColorInput(messageColor);
                    }
                  }}
                  className="input border-0 ring-0 mt-2 focus:outline-none w-full"
                  style={{
                    backgroundColor: isValidHex(messageColorInput)
                      ? messageColorInput
                      : messageColor,
                    color: getContrastingTextColor(
                      isValidHex(messageColorInput)
                        ? messageColorInput
                        : messageColor
                    ),
                    border: 0,
                  }}
                />
              </div>
              <div className="p-2">
                <label
                  htmlFor="sender-color-picker"
                  className="text-sm  mb-1 block"
                >
                  Sender Color Picker
                </label>
                <input
                  type="text"
                  value={senderColorInput}
                  onChange={(e) => setSenderColorInput(e.target.value.trim())}
                  onBlur={() => {
                    let input = senderColorInput;
                    if (
                      !input.startsWith("#") &&
                      /^[0-9A-Fa-f]{3,6}$/.test(input)
                    ) {
                      input = "#" + input;
                    }
                    if (isValidHex(input)) {
                      setSenderColor(input);
                      SetMySenderTheme(input);
                      setSenderColorInput(input);
                    } else {
                      setSenderColorInput(senderColor);
                      setSenderColor(input);
                    }
                  }}
                  className="input border-0 ring-0 mt-2 focus:outline-none w-full"
                  style={{
                    backgroundColor: isValidHex(senderColorInput)
                      ? senderColorInput
                      : senderColor,
                    color: getContrastingTextColor(
                      isValidHex(senderColorInput)
                        ? senderColorInput
                        : senderColor
                    ),
                  }}
                />
              </div>
              <div
                className="p-2 border-1 rounded-lg mt-3 flex flex-row gap-3 items-center justify-around"
                style={{ borderColor: messageColor }}
              >
                <button
                  className="btn"
                  onClick={() => {
                    SetMyMessageTheme(senderColor);
                    SetMySenderTheme(messageColor);
                  }}
                >
                  Switch
                </button>
                <button
                  className="btn"
                  onClick={() => {
                    SetMyMessageTheme("#645ee2");
                    SetMySenderTheme("#2d3135");
                  }}
                >
                  Reset
                </button>
                <button
                  className="btn"
                  onClick={() => {
                    SetMyMessageTheme(getRandomColor());
                    SetMySenderTheme(getRandomColor());
                  }}
                >
                  Random
                </button>
              </div>
            </div>
            <div className="bg-zinc-600 p-[0.1px] self-stretch" />
            <div className="flex-1 w-full">
              <label htmlFor="ready-colors" className="text-sm mb-1 block">
                Preset Colors
              </label>
              <div className="grid grid-cols-4 gap-3 relative space-y-2">
                {isToggleOpen && (
                  <div className="absolute bg-black/50 w-full h-full flex items-center justify-center transition-all">
                    <div
                      ref={toggleRef}
                      className="absolute mt-2 w-full bg-white max-md:w-1/2 shadow-lg rounded-lg py-2 z-10 overflow-hidden"
                      style={{ display: "block" }}
                    >
                      <div className="w-full  p-1">
                        <button
                          onClick={() => setIsToggleOpen(false)}
                          style={{ color: "black" }}
                          className="absolute right-3 top-3 cursor-pointer"
                        >
                          <X />
                        </button>
                      </div>
                      <div className="px-3 text-center">
                        <label className=" text-black-full ">
                          {Selectedcolor}
                        </label>
                        <div
                          className="h-12 w-full rounded-md"
                          style={{ backgroundColor: Selectedcolor }}
                        />
                      </div>
                      <div className="flex flex-row p-3 gap-3">
                        <button
                          onClick={() => {
                            SetMyMessageTheme(Selectedcolor);
                            setIsToggleOpen(false);
                            setMessageColorInput(Selectedcolor);
                            setMessageColor(Selectedcolor);
                          }}
                          className="flex btn ring-0  border-2 border-main transition-all items-center bg-transparent flex-1 px-4 py-2 text-sm text-main"
                        >
                          Set for me
                        </button>
                        <button
                          onClick={() => {
                            SetMySenderTheme(Selectedcolor);
                            setIsToggleOpen(false);
                            setSenderColorInput(Selectedcolor);
                            setSenderColor(Selectedcolor);
                          }}
                          className="flex btn ring-0 items-center flex-1 px-4 py-2 text-sm transition-all border-2 bg-transparent border-main-shiny text-main-shiny"
                        >
                          Set for sender
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                {ReadyThemes.map((readyColor) => (
                  <button
                    key={readyColor}
                    onClick={() => {
                      setIsToggleOpen(true);
                      setSelectedcolor(readyColor);
                    }}
                    className="rounded-lg transition-all hover:scale-105 px-1"
                  >
                    <div
                      className="h-12 w-full rounded-md cursor-pointer"
                      style={{ backgroundColor: readyColor }}
                    />
                    <span className="text-[11px] font-medium truncate w-full text-center block mt-1 select-none">
                      {readyColor}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
