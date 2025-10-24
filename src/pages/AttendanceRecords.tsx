import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAttendanceRecords, downloadCSV, type AttendanceRecord } from "@/lib/api";
import { toast } from "sonner";
import { Download, Loader2, Calendar, Filter } from "lucide-react";

const AttendanceRecords = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("all");

  const periods = [
    { value: "all", label: "All Time" },
    { value: "daily", label: "Today" },
    { value: "weekly", label: "This Week" },
    { value: "monthly", label: "This Month" },
  ];

  useEffect(() => {
    fetchRecords(selectedPeriod);
  }, [selectedPeriod]);

  const fetchRecords = async (period: string) => {
    setLoading(true);
    try {
      const data = await getAttendanceRecords(period === "all" ? undefined : period);
      setRecords(data);
    } catch (error) {
      toast.error("Failed to fetch attendance records");
      console.error("Error fetching records:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = () => {
    try {
      downloadCSV();
      toast.success("CSV download started");
    } catch (error) {
      toast.error("Failed to download CSV");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Attendance Records</h1>
          <p className="text-muted-foreground">View and manage attendance history</p>
        </div>
        <Button onClick={handleDownloadCSV} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Download CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Attendance History
              </CardTitle>
              <CardDescription>Filter records by time period</CardDescription>
            </div>
            <div className="flex gap-2">
              {periods.map((period) => (
                <Button
                  key={period.value}
                  variant={selectedPeriod === period.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedPeriod(period.value)}
                >
                  {period.label}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Filter className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No attendance records found for the selected period</p>
            </div>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Confidence</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.id}</TableCell>
                      <TableCell>{record.name}</TableCell>
                      <TableCell>
                        {new Date(record.timestamp).toLocaleString('en-US', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </TableCell>
                      <TableCell>
                        {record.confidence ? (
                          <span className="inline-block bg-primary/10 text-primary px-2 py-1 rounded text-xs font-medium">
                            {(record.confidence * 100).toFixed(1)}%
                          </span>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceRecords;
