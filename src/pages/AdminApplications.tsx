import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, Eye } from "lucide-react";
import apiService from "@/services/api";
import { Application } from "@/types/scholarship";

const AdminApplications = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [selectedApplication, setSelectedApplication] = useState<Application & { scholarshipName: string } | null>(null);
  const [reviewerNotes, setReviewerNotes] = useState("");

  const { data: applications, isLoading, error } = useQuery({
    queryKey: ["admin-applications"],
    queryFn: () => apiService.getApplications(),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, reviewerNotes }: { id: string; status: string; reviewerNotes?: string }) =>
      apiService.updateApplicationStatus(id, status, reviewerNotes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-applications"] });
      setSelectedApplication(null);
      setReviewerNotes("");
    },
  });

  const handleStatusUpdate = (id: string, status: string) => {
    updateStatusMutation.mutate({ id, status, reviewerNotes });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading applications...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error loading applications: {error.message}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard - Applications</h1>
        <p className="text-muted-foreground">Review and manage scholarship applications</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Applications ({applications?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead>Scholarship</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications?.map((application) => (
                <TableRow key={application.id}>
                  <TableCell className="font-medium">{application.studentName}</TableCell>
                  <TableCell>{application.scholarshipName}</TableCell>
                  <TableCell>{application.email}</TableCell>
                  <TableCell>{getStatusBadge(application.status)}</TableCell>
                  <TableCell>{new Date(application.submittedAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/admin/application/${application.id}`)}
                      >
                        View More Details
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminApplications;
