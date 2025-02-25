import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./MindfulVideo.css";
import { BalanceContext } from "../../context/BalanceContext";

console.log("API Key:", process.env.REACT_APP_YOUTUBE_API_KEY);
const YOUTUBE_API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY;

const MindfulVideo = () => {
  const navigate = useNavigate();
  const { balance, setBalance } = useContext(BalanceContext);
  const [videoId, setVideoId] = useState(null);
  const [videoFinished, setVideoFinished] = useState(false);

  useEffect(() => {
    fetchRandomVideo();
  }, []);

  const fetchRandomVideo = async () => {
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=mindful+gambling+awareness&type=video&maxResults=10&key=${YOUTUBE_API_KEY}`
      );
      const data = await response.json();
      if (data.items.length > 0) {
        const randomVideo = data.items[Math.floor(Math.random() * data.items.length)];
        setVideoId(randomVideo.id.videoId);
      }
    } catch (error) {
      console.error("Error fetching video:", error);
      alert("Failed to load video. Please try again.");
    }
  };

  const handleVideoCompletion = () => {
    setVideoFinished(true);
    const newBalance = balance + 50;
    setBalance(newBalance);
    localStorage.setItem("balance", newBalance);
    alert("✅ You finished the video! Earned 50 Conscious Cash!");
    navigate("/");
  };

  return (
    <div className="video-page">
      <h2>🎥 Watch This Mindful Gambling Awareness Video</h2>

      {videoId ? (
        <iframe
          width="800"
          height="450"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&controls=0&enablejsapi=1`}
          frameBorder="0"
          allow="autoplay; encrypted-media"
          allowFullScreen
        ></iframe>
      ) : (
        <p>Loading video...</p>
      )}

      <p>⏳ You must finish the video to receive Conscious Cash.</p>
      <button className="video-done" onClick={handleVideoCompletion} disabled={!videoId}>
        ✅ I Finished the Video
      </button>
    </div>
  );
};

export default MindfulVideo;
