import axios from "axios";
import { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Webcam from "react-webcam";

function FaceRegistration() {
  const location = useLocation();
  const navigate = useNavigate();
  const webcamRef = useRef<Webcam>(null);
  const [error, setError] = useState("");
  const [currentPose, setCurrentPose] = useState(0);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);

  const formData = location.state;

  const poses = [
    "Look straight at the camera",
    "Turn your head left",
    "Turn your head right",
    "Tilt your head up",
    "Tilt your head down",
    "Tilt your head up and left",
    "Tilt your head down and left",
    "Tilt your head up and right",
    "Tilt your head down and right",
    "Smile at the camera",
  ];

  const captureImage = async () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        const jpgImage = imageSrc.replace("data:image/jpeg;base64,", "");
        const newImages = [...capturedImages, jpgImage];
        setCapturedImages(newImages);

        if (currentPose < poses.length - 1) {
          setCurrentPose(currentPose + 1);
        } else {
          try {
            // Register student with face images in one request
            const response = await axios.post(
              "http://localhost:5000/students/register",
              {
                ...formData,
                images: newImages,
              }
            );

            if (!response.data.success) {
              throw new Error(response.data.message || "Registration failed");
            }

            // Show success message
            alert(
              `Registration successful! Your Student ID is: ${response.data.student.studentID}`
            );

            // Force navigation to home page
            window.location.href = "/";
            // Or alternatively:
            // navigate('/', { replace: true });
          } catch (err: any) {
            setError(err.message || "Registration process failed");
            setCapturedImages([]);
            setCurrentPose(0);
          }
        }
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#EEE4FF] p-4">
      <h2 className="text-2xl font-bold mb-4">Face Registration</h2>
      <p className="mb-4 text-lg">{poses[currentPose]}</p>
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}
      <div className="relative">
        <Webcam
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          className="rounded-lg"
        />
      </div>
      <div className="flex gap-4">
        <button
          onClick={captureImage}
          className="mt-4 !bg-[#7E57C2] text-white font-semibold py-2 px-4 rounded"
        >
          Capture ({currentPose + 1}/{poses.length})
        </button>
        <button
          onClick={() => navigate("/")}
          className="mt-4 !bg-gray-500 text-white font-semibold py-2 px-4 rounded"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}

export default FaceRegistration;
