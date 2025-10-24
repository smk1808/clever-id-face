import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { startTraining, getTrainingStatus } from "@/lib/api";
import { toast } from "sonner";
import { Brain, Loader2 } from "lucide-react";

const TrainingProgress = () => {
  const [isTraining, setIsTraining] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isTraining) {
      interval = setInterval(async () => {
        try {
          const statusData = await getTrainingStatus();
          setStatus(statusData.message || statusData.status);
          
          if (statusData.progress !== undefined) {
            setProgress(statusData.progress);
          }

          if (statusData.status === "completed") {
            setIsTraining(false);
            toast.success("Model training completed successfully!");
          } else if (statusData.status === "error") {
            setIsTraining(false);
            toast.error("Training failed. Please try again.");
          }
        } catch (error) {
          console.error("Failed to fetch training status:", error);
        }
      }, 2000);
    }

    return () => clearInterval(interval);
  }, [isTraining]);

  const handleStartTraining = async () => {
    try {
      setIsTraining(true);
      setProgress(0);
      await startTraining();
      toast.info("Training started...");
    } catch (error) {
      setIsTraining(false);
      toast.error("Failed to start training");
      console.error("Training error:", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          Model Training
        </CardTitle>
        <CardDescription>Train the face recognition model with new student data</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isTraining && (
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              {status || "Training in progress..."}
            </p>
          </div>
        )}
        <Button 
          onClick={handleStartTraining} 
          disabled={isTraining}
          className="w-full"
        >
          {isTraining ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Training...
            </>
          ) : (
            "Start Training"
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default TrainingProgress;
