import React from "react";
import "./loading.css";
export default function SpecialLoader() {
  return (
    <div className="spinner-container">
      <div className="spinner-special"></div>
      <div className="small-ball">
        <div className="spinner-small"></div>
      </div>
    </div>
  );
}
