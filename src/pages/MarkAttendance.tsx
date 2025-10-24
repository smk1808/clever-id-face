import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { recognizeFace } from "@/lib/api";
import { toast } from "sonner";
import { Camera, Loader2, CheckCircle2, XCircle } from "lucide-react";

const MarkAttendance = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [recognitionResult, setRecognitionResult] = useState<{
    name: string;
    confidence: number;
    message: string;
  } | null>(null);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [streamActive, setStreamActive] = useState(false);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setStreamActive(true);
      }
    } catch (error) {
      toast.error("Unable to access camera. Please check permissions.");
      console.error("Camera error:", error);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
      setStreamActive(false);
    }
  };

  const captureAndRecognize = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsCapturing(true);
    setIsRecognizing(true);
    setRecognitionResult(null);

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext("2d");

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    canvas.toBlob(async (blob) => {
      if (!blob) {
        toast.error("Failed to capture image");
        setIsRecognizing(false);
        return;
      }

      try {
        const result = await recognizeFace(blob);
        setRecognitionResult(result);
        
        if (result.name !== "Unknown") {
          toast.success(`Attendance marked for ${result.name}`);
        } else {
          toast.error("Face not recognized. Please try again.");
        }
      } catch (error) {
        toast.error("Recognition failed. Please try again.");
        console.error("Recognition error:", error);
      } finally {
        setIsRecognizing(false);
        setIsCapturing(false);
      }
    }, "image/jpeg");
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Mark Attendance</h1>
        <p className="text-muted-foreground">Position your face in front of the camera to mark attendance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-primary" />
              Live Camera Feed
            </CardTitle>
            <CardDescription>Ensure your face is clearly visible and well-lit</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              {!streamActive && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                  <p className="text-muted-foreground">Initializing camera...</p>
                </div>
              )}
            </div>
            <canvas ref={canvasRef} className="hidden" />
            
            <Button
              onClick={captureAndRecognize}
              disabled={!streamActive || isRecognizing}
              className="w-full mt-4"
            >
              {isRecognizing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Recognizing...
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4 mr-2" />
                  Capture & Recognize
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recognition Result</CardTitle>
            <CardDescription>Student identification and attendance status</CardDescription>
          </CardHeader>
          <CardContent>
            {!recognitionResult && !isRecognizing && (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                <div className="text-center">
                  <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Capture an image to begin recognition</p>
                </div>
              </div>
            )}

            {isRecognizing && (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin text-primary" />
                  <p className="text-muted-foreground">Processing face recognition...</p>
                </div>
              </div>
            )}

            {recognitionResult && (
              <div className="space-y-6">
                <div className="text-center py-8">
                  {recognitionResult.name !== "Unknown" ? (
                    <CheckCircle2 className="w-20 h-20 mx-auto mb-4 text-secondary" />
                  ) : (
                    <XCircle className="w-20 h-20 mx-auto mb-4 text-destructive" />
                  )}
                  <h3 className="text-2xl font-bold mb-2">
                    {recognitionResult.name}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {recognitionResult.message}
                  </p>
                  {recognitionResult.confidence > 0 && (
                    <div className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-lg">
                      <span className="text-sm font-medium">
                        Confidence: {(recognitionResult.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
                
                <Button
                  onClick={() => setRecognitionResult(null)}
                  variant="outline"
                  className="w-full"
                >
                  Mark Another Attendance
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MarkAttendance;
