import axios from "axios";
import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";

function About() {
  const webcamRef = useRef<Webcam>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [recognitionResult, setRecognitionResult] = useState<{
    faces: Array<{
      name: string;
      confidence: number;
      bbox: number[];
    }>;
    count: number;
    detected_people: Array<{
      name: string;
      confidence: number;
    }>;
  } | null>(null);
  const [processingFrame, setProcessingFrame] = useState(false);

  useEffect(() => {
    let captureInterval: NodeJS.Timeout;

    if (isCapturing && !processingFrame) {
      captureInterval = setInterval(() => {
        captureAndProcessFrame();
      }, 1000);
    }

    return () => {
      if (captureInterval) {
        clearInterval(captureInterval);
      }
    };
  }, [isCapturing, processingFrame]);

  const captureAndProcessFrame = async () => {
    if (webcamRef.current && !processingFrame) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        try {
          setProcessingFrame(true);

          // Convert base64 image to blob
          const response = await fetch(imageSrc);
          const blob = await response.blob();

          // Create form data
          const formData = new FormData();
          formData.append("image", blob, "webcam.jpg");

          // Send to backend for processing
          const result = await axios.post(
            "http://127.0.0.1:5000/process-frame",
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );

          setRecognitionResult(result.data);
        } catch (error) {
          console.error("Error processing frame:", error);
        } finally {
          setProcessingFrame(false);
        }
      }
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Face Recognition Attendance</h1>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="relative">
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            className="w-full rounded-lg"
            videoConstraints={{
              width: 640,
              height: 480,
              facingMode: "user",
            }}
          />
          {processingFrame && (
            <div className="absolute top-2 right-2 bg-yellow-500 text-white px-3 py-1 rounded">
              Processing...
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <button
          onClick={() => setIsCapturing(!isCapturing)}
          className={`px-6 py-3 rounded-lg font-semibold text-white transition-colors ${
            isCapturing
              ? "bg-red-500 hover:bg-red-600"
              : "bg-green-500 hover:bg-green-600"
          }`}
        >
          {isCapturing ? "Stop Recognition" : "Start Recognition"}
        </button>

        {recognitionResult && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 shadow">
              <h2 className="text-xl font-semibold mb-2">
                Detected People: {recognitionResult.count}
              </h2>

              {/* Show detected people with highest confidence */}
              <div className="space-y-2">
                {recognitionResult.detected_people.map((person, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg ${
                      person.confidence > 80
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    <p className="font-semibold">Name: {person.name}</p>
                    <p>Confidence: {person.confidence.toFixed(2)}%</p>
                  </div>
                ))}
              </div>

              {/* Show all detected faces */}
              <div className="mt-4">
                <h3 className="font-semibold mb-2">All Detected Faces:</h3>
                <div className="space-y-2">
                  {recognitionResult.faces.map((face, index) => (
                    <div key={index} className="p-2 bg-gray-50 rounded border">
                      <p>Name: {face.name}</p>
                      <p>Confidence: {face.confidence.toFixed(2)}%</p>
                      <p className="text-sm text-gray-500">
                        Position: {face.bbox.join(", ")}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default About;
