import React from "react";

export default function Video() {
  const containerStyle = {
    width: "100vw",
    height: "100vh",
    margin: 0,
    padding: 0,
    overflow: "hidden",
    backgroundColor: "black",
  };

  const videoStyle = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  };

  return (
    <div style={containerStyle}>
      <video
        style={videoStyle}
        src="/videos/video" // coloque seu vídeo em public/videos/
        autoPlay
        loop
        muted
        playsInline
      />
    </div>
  );
}
