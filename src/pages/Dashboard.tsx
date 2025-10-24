import { Link } from "react-router-dom";
import { UserPlus, Camera, FileText, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AttendanceChart from "@/components/AttendanceChart";
import TrainingProgress from "@/components/TrainingProgress";

const Dashboard = () => {
  const quickActions = [
    {
      title: "Add Student",
      description: "Register new student with face data",
      icon: UserPlus,
      path: "/add-student",
      color: "primary",
    },
    {
      title: "Mark Attendance",
      description: "Capture and recognize student faces",
      icon: Camera,
      path: "/mark-attendance",
      color: "secondary",
    },
    {
      title: "View Records",
      description: "Browse attendance history",
      icon: FileText,
      path: "/records",
      color: "accent",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to the Digital Face-Recognition Attendance System</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.path} to={action.path}>
              <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer border-2 hover:border-primary/50">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg bg-${action.color}/10 flex items-center justify-center mb-2`}>
                    <Icon className={`w-6 h-6 text-${action.color}`} />
                  </div>
                  <CardTitle>{action.title}</CardTitle>
                  <CardDescription>{action.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant={action.color === "primary" ? "default" : "outline"} className="w-full">
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AttendanceChart />
        <TrainingProgress />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            System Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-primary/5 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Total Students</p>
              <p className="text-2xl font-bold text-primary">-</p>
            </div>
            <div className="bg-secondary/5 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Today's Attendance</p>
              <p className="text-2xl font-bold text-secondary">-</p>
            </div>
            <div className="bg-accent/5 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">This Week</p>
              <p className="text-2xl font-bold text-accent">-</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
