import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { Student } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { addStudent, uploadFaceImages } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, Upload, CheckCircle, Camera, Trash2, X } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  roll: z.string().min(1, "Roll number is required"),
  class: z.string().min(1, "Class is required"),
  section: z.string().min(1, "Section is required"),
  reg_no: z.string().min(1, "Registration number is required"),
});

const AddStudent = () => {
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [streamActive, setStreamActive] = useState(false);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      roll: "",
      class: "",
      section: "",
      reg_no: "",
    },
  });

  useEffect(() => {
    return () => {
      stopCamera();
      // Cleanup captured image URLs
      capturedImages.forEach(url => URL.revokeObjectURL(url));
    };
  }, [capturedImages]);

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

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext("2d");

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      if (!blob) {
        toast.error("Failed to capture image");
        return;
      }

      const file = new File([blob], `capture-${Date.now()}.jpg`, { type: "image/jpeg" });
      setImages(prev => [...prev, file]);
      
      const imageUrl = URL.createObjectURL(blob);
      setCapturedImages(prev => [...prev, imageUrl]);
      
      toast.success("Image captured successfully!");
    }, "image/jpeg");
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileList = Array.from(e.target.files);
      setImages(prev => [...prev, ...fileList]);
      
      // Create preview URLs for uploaded files
      const newUrls = fileList.map(file => URL.createObjectURL(file));
      setCapturedImages(prev => [...prev, ...newUrls]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setCapturedImages(prev => {
      const newUrls = prev.filter((_, i) => i !== index);
      URL.revokeObjectURL(prev[index]);
      return newUrls;
    });
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (images.length === 0) {
      toast.error("Please upload at least one face image");
      return;
    }

    setIsSubmitting(true);
    setSuccess(false);

    try {
      // First add the student
      await addStudent(values as Student);
      
      // Then upload face images
      await uploadFaceImages(values.name, images);

      toast.success("Student added successfully!");
      setSuccess(true);
      form.reset();
      setImages([]);
      capturedImages.forEach(url => URL.revokeObjectURL(url));
      setCapturedImages([]);
      stopCamera();
    } catch (error) {
      toast.error("Failed to add student. Please try again.");
      console.error("Error adding student:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Add New Student</h1>
        <p className="text-muted-foreground">Register a new student with their details and face images</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Student Information</CardTitle>
            <CardDescription>Enter the student's details below</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="roll"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Roll Number</FormLabel>
                        <FormControl>
                          <Input placeholder="001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="reg_no"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Registration Number</FormLabel>
                        <FormControl>
                          <Input placeholder="REG2025001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="class"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Class</FormLabel>
                        <FormControl>
                          <Input placeholder="10" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="section"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Section</FormLabel>
                        <FormControl>
                          <Input placeholder="A" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button type="submit" disabled={isSubmitting || images.length === 0} className="w-full">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Adding Student...
                    </>
                  ) : success ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Student Added!
                    </>
                  ) : (
                    "Add Student"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-primary" />
              Capture Face Images
            </CardTitle>
            <CardDescription>Capture or upload 5-10 clear face photos for recognition</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              {!streamActive && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                  <p className="text-muted-foreground">Camera not started</p>
                </div>
              )}
            </div>
            <canvas ref={canvasRef} className="hidden" />
            
            <div className="grid grid-cols-2 gap-2">
              {!streamActive ? (
                <Button onClick={startCamera} variant="outline" className="col-span-2">
                  <Camera className="w-4 h-4 mr-2" />
                  Start Camera
                </Button>
              ) : (
                <>
                  <Button onClick={captureImage} disabled={!streamActive}>
                    <Camera className="w-4 h-4 mr-2" />
                    Capture Photo
                  </Button>
                  <Button onClick={stopCamera} variant="outline">
                    <X className="w-4 h-4 mr-2" />
                    Stop Camera
                  </Button>
                </>
              )}
            </div>

            <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary/50 transition-colors">
              <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <p className="text-sm text-muted-foreground mb-1">
                  Or upload from device
                </p>
                <p className="text-xs text-muted-foreground">
                  Select multiple images
                </p>
              </label>
            </div>

            {images.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-secondary" />
                  {images.length} image(s) captured/uploaded
                </p>
                <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                  {capturedImages.map((url, index) => (
                    <div key={index} className="relative group aspect-square">
                      <img 
                        src={url} 
                        alt={`Capture ${index + 1}`}
                        className="w-full h-full object-cover rounded border border-border"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        type="button"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddStudent;
