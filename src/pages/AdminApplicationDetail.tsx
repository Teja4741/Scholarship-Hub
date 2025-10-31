import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import apiService from "@/services/api";
import { Application, Scholarship } from "@/types/scholarship";

const AdminApplicationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [reviewerNotes, setReviewerNotes] = useState("");

  const { data: application, isLoading: appLoading, error: appError } = useQuery({
    queryKey: ["application", id],
    queryFn: () => apiService.getApplicationById(id!),
    enabled: !!id,
  });

  const { data: scholarship, isLoading: schLoading, error: schError } = useQuery({
    queryKey: ["scholarship", application?.scholarshipId],
    queryFn: () => apiService.getScholarshipById(application!.scholarshipId),
    enabled: !!application?.scholarshipId,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ status, reviewerNotes }: { status: string; reviewerNotes?: string }) =>
      apiService.updateApplicationStatus(id!, status, reviewerNotes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-applications"] });
      navigate("/admin/dashboard");
    },
  });

  const handleStatusUpdate = (status: string) => {
    updateStatusMutation.mutate({ status, reviewerNotes });
  };

  if (appLoading || schLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (appError || schError || !application || !scholarship) {
    return <div className="text-red-500">Error loading data</div>;
  }

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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate("/admin/dashboard")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Applications
        </Button>
        <h1 className="text-3xl font-bold">Application Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Student Details */}
        <Card>
          <CardHeader>
            <CardTitle>Student Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Name</Label>
                <p>{application.studentName}</p>
              </div>
              <div>
                <Label>Email</Label>
                <p>{application.email}</p>
              </div>
              <div>
                <Label>Phone</Label>
                <p>{application.phone}</p>
              </div>
              <div>
                <Label>Date of Birth</Label>
                <p>{application.dateOfBirth}</p>
              </div>
              <div>
                <Label>Address</Label>
                <p>{application.address}</p>
              </div>
              <div>
                <Label>Nationality</Label>
                <p>{application.nationality}</p>
              </div>
              <div>
                <Label>Category</Label>
                <p>{application.category}</p>
              </div>
              <div>
                <Label>Marks</Label>
                <p>{application.marks}%</p>
              </div>
              <div>
                <Label>GPA</Label>
                <p>{application.gpa}</p>
              </div>
              <div>
                <Label>Family Income</Label>
                <p>₹{application.familyIncome}</p>
              </div>
              <div>
                <Label>Course</Label>
                <p>{application.course}</p>
              </div>
              <div>
                <Label>Degree</Label>
                <p>{application.degree}</p>
              </div>
              <div>
                <Label>Year of Study</Label>
                <p>{application.yearOfStudy}</p>
              </div>
              <div>
                <Label>Field of Study</Label>
                <p>{application.fieldOfStudy}</p>
              </div>
              <div>
                <Label>Graduation Date</Label>
                <p>{application.graduationDate}</p>
              </div>
              <div>
                <Label>Institution</Label>
                <p>{application.institution}</p>
              </div>
              <div>
                <Label>Status</Label>
                {getStatusBadge(application.status)}
              </div>
              <div>
                <Label>Submitted At</Label>
                <p>{new Date(application.submittedAt).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scholarship Details */}
        <Card>
          <CardHeader>
            <CardTitle>Scholarship Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Name</Label>
              <p className="font-semibold">{scholarship.name}</p>
            </div>
            <div>
              <Label>Type</Label>
              <p>{scholarship.type}</p>
            </div>
            <div>
              <Label>Description</Label>
              <p>{scholarship.description}</p>
            </div>
            <div>
              <Label>Amount</Label>
              <p>₹{scholarship.amount}</p>
            </div>
            <div>
              <Label>Eligibility</Label>
              <ul className="list-disc list-inside text-sm">
                <li>Minimum Marks: {scholarship.eligibility.minimumMarks}%</li>
                <li>Maximum Income: ₹{scholarship.eligibility.maximumIncome}</li>
                <li>Age Limit: {scholarship.eligibility.ageLimit} years</li>
                <li>Course Year: {scholarship.eligibility.courseYear}</li>
              </ul>
            </div>
            <div>
              <Label>Benefits</Label>
              <ul className="list-disc list-inside text-sm">
                {scholarship.benefits.map((benefit, index) => (
                  <li key={index}>{benefit}</li>
                ))}
              </ul>
            </div>
            <div>
              <Label>Deadline</Label>
              <p>{new Date(scholarship.deadline).toLocaleDateString()}</p>
            </div>
            <div>
              <Label>Documents Required</Label>
              <ul className="list-disc list-inside text-sm">
                {scholarship.documentsRequired.map((doc, index) => (
                  <li key={index}>{doc}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Section */}
      {application.status === "pending" && (
        <Card>
          <CardHeader>
            <CardTitle>Review Decision</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="notes">Reviewer Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={reviewerNotes}
                onChange={(e) => setReviewerNotes(e.target.value)}
                placeholder="Add any notes for the decision..."
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => handleStatusUpdate("approved")}
                className="bg-green-600 hover:bg-green-700"
                disabled={updateStatusMutation.isPending}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
              <Button
                onClick={() => handleStatusUpdate("rejected")}
                variant="destructive"
                disabled={updateStatusMutation.isPending}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminApplicationDetail;
