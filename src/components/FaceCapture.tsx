import axios from "axios";
import * as faceapi from "face-api.js";
import React, { useEffect, useRef, useState } from "react";

const FaceCapture: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const instructions = [
    "Face forward and look straight",
    "Turn your head slightly to the left",
    "Turn your head slightly to the right",
    "Look slightly up",
    "Look slightly down",
  ];

  useEffect(() => {
    let stream: MediaStream | null = null;

    (async () => {
      await loadModels();
      stream = await startVideo();
    })();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startVideo = async (): Promise<MediaStream | null> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      return stream;
    } catch (error) {
      console.error(" Error accessing webcam:", error);
      setError("Error accessing webcam. Please check camera permissions.");
      return null;
    }
  };

  const loadModels = async () => {
    try {
      console.log("Loading models...");
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
        faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
        faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
      ]);
      console.log("Face-api.js models loaded successfully!");
    } catch (error) {
      setError("Failed to load face models.");
      console.error(error);
    }
  };

  const ensureVideoSize = (): Promise<void> => {
    return new Promise((resolve) => {
      if (videoRef.current && videoRef.current.videoWidth > 0) {
        resolve();
      } else {
        videoRef.current?.addEventListener("loadedmetadata", () => resolve(), {
          once: true,
        });
      }
    });
  };

  const captureFace = async () => {
    setError(""); // Reset error before capturing
    if (!videoRef.current || !canvasRef.current) return;

    await ensureVideoSize(); // ✅ Ensures video metadata is loaded before proceeding

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (context) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      console.log("🔍 Detecting face...");

      const detections = await faceapi
        .detectSingleFace(
          canvas,
          new faceapi.TinyFaceDetectorOptions({
            inputSize: 512,
            scoreThreshold: 0.4,
          })
        )
        .withFaceLandmarks();

      if (!detections) {
        setError("No face detected! Adjust position and try again.");
        return;
      }

      console.log("✅ Face detected:", detections);

      const dataUrl = canvas.toDataURL("image/png");
      setCapturedImages((prevImages) => [...prevImages, dataUrl]);
      setCurrentStep((prevStep) => prevStep + 1);
    }
  };

  const sendFaceData = async () => {
    if (capturedImages.length < instructions.length) {
      setError("❌ Capture all face angles before submitting.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const formData = new FormData();
      formData.append("studentID", "123456");
      formData.append("name", "John Doe");
      formData.append("email", "johndoe@example.com");
      formData.append("educationLevel", "Degree"); // Updated
      formData.append("yearOfStudy", "2");

      // Convert Data URLs to Blobs and append as files
      for (let index = 0; index < capturedImages.length; index++) {
        const response = await fetch(capturedImages[index]);
        const blob = await response.blob();
        formData.append("face", blob, `face_${index}.png`);
      }

      console.log("FormData Entries:", Array.from(formData.entries()));

      const response = await axios.post(
        "http://localhost:5000/register",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      console.log("✅ Server Response:", response.data);
      alert("✅ Face data submitted successfully!");

      setCapturedImages(() => {
        setCurrentStep(0);
        return [];
      });
    } catch (error) {
      console.error("❌ Error sending face data:", error);
      setError("❌ Error submitting face data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <h2 className="text-lg font-semibold">{instructions[currentStep]}</h2>
      {error && <p className="text-red-500">{error}</p>}
      <div className="relative">
        <video
          ref={videoRef}
          autoPlay
          className="w-80 h-60 border rounded-lg shadow-md"
        ></video>
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
        ></canvas>
      </div>
      <div className="flex space-x-4">
        {currentStep < instructions.length && (
          <button
            onClick={captureFace}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700 transition"
          >
            Capture {currentStep + 1} / {instructions.length}
          </button>
        )}
        {capturedImages.length === instructions.length && (
          <button
            onClick={sendFaceData}
            className={`px-4 py-2 text-white rounded-md transition ${
              loading ? "bg-gray-400" : "bg-green-500 hover:bg-green-700"
            }`}
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        )}
      </div>
      <div className="flex space-x-2 mt-4">
        {capturedImages.map((img, index) => (
          <img
            key={index}
            src={img}
            alt={`Captured Face ${index + 1}`}
            className="w-20 h-20 rounded-full border shadow-lg"
          />
        ))}
      </div>
    </div>
  );
};

export default FaceCapture;
