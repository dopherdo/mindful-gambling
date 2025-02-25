import React, { useContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./MindfulVideo.css";
import { BalanceContext } from "../../context/BalanceContext";

const YOUTUBE_API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY;

const MindfulVideo = () => {
  const navigate = useNavigate();
  const { balance, setBalance } = useContext(BalanceContext);
  const [videoId, setVideoId] = useState(null);
  const [videoFinished, setVideoFinished] = useState(false);

  useEffect(() => {
    fetchRandomVideo();
  }, []);

  // Fetch a random mindful gambling video from YouTube
  const fetchRandomVideo = async () => {
    if (!YOUTUBE_API_KEY) {
      alert("Missing API Key! Check your .env file.");
      return;
    }

    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=mindful+gambling+awareness&type=video&maxResults=10&key=${YOUTUBE_API_KEY}`
      );
      const data = await response.json();
      if (data.items && data.items.length > 0) {
        const randomVideo =
          data.items[Math.floor(Math.random() * data.items.length)];
        setVideoId(randomVideo.id.videoId);
      } else {
        alert("No videos found. Try again later.");
      }
    } catch (error) {
      console.error("Error fetching video:", error);
      alert("Failed to load video. Please try again.");
    }
  };

  // Update balance when the video finishes
  const handleVideoCompletion = useCallback(() => {
    if (!videoFinished) {
      setVideoFinished(true);
      const newBalance = balance + 50;
      setBalance(newBalance);
      localStorage.setItem("balance", newBalance);
      navigate("/");
    }
  }, [videoFinished, balance, setBalance, navigate]); // No changes to dependencies

  // Detect when the video ends
  const checkVideoCompletion = useCallback(() => {
    const iframe = document.querySelector("iframe");
    if (!iframe) return;

    new window.YT.Player(iframe, {
      events: {
        onStateChange: (event) => {
          if (event.data === 0) {
            handleVideoCompletion();
          }
        },
      },
    });
  }, [handleVideoCompletion]); // No changes to dependencies

  // Load YouTube API safely
  const loadYouTubeAPI = useCallback(() => {
    if (!window.YT) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.onload = () => checkVideoCompletion();
      document.body.appendChild(script);
    } else {
      checkVideoCompletion();
    }
  }, [checkVideoCompletion]); // No changes to dependencies

  useEffect(() => {
    if (videoId) {
      loadYouTubeAPI();
    }
  }, [videoId, loadYouTubeAPI]);

  // Emergency button: Instantly rewards 50 Conscious Cash
  const handleEmergencyReward = () => {
    const newBalance = balance + 50;
    setBalance(newBalance);
    localStorage.setItem("balance", newBalance);
    navigate("/");
  };

  // Cancel button: Returns home without the reward
  const handleCancel = () => {
    navigate("/");
  };

  return (
    <div className="video-page">
      <h2> Watch This Mindful Gambling Awareness Video </h2>
      {/* Balance Section */}
      <div className="balance-section">
        <span className="conscious-cash">
          {" "}
          Conscious Cash: <span> ${balance} </span>
        </span>
      </div>

      {videoId ? (
        <iframe
          title="Mindful Gambling Video"
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

      <p>You must finish the video to receive your 50 Conscious Cash.</p>

      <div className="video-buttons">
        <button className="emergency-button" onClick={handleEmergencyReward}>
          DEMO: Grant Reward
        </button>
        <button className="cancel-button" onClick={handleCancel}>
          Cancel & Return Home
        </button>
      </div>
    </div>
  );
};

export default MindfulVideo;
