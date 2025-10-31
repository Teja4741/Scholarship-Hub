import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import apiService from '@/services/api';
import { Application } from '@/types/scholarship';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, CheckCircle, Clock, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const MyApplications = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [applications, setApplications] = useState<(Application & { scholarshipName: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const data = await apiService.getApplications();
        setApplications(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch applications:', err);
        setError('Failed to load applications. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'rejected':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">My Applications</h1>
              <p className="text-muted-foreground">Track the status of your scholarship applications</p>
            </div>
            {user?.role === 'admin' && (
              <Button
                onClick={() => navigate('/admin')}
                className="flex items-center gap-2"
              >
                <Shield className="h-4 w-4" />
                Admin Dashboard
              </Button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="grid gap-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <Card key={index}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-destructive text-lg mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Try Again
            </button>
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No applications found</p>
            <p className="text-sm text-muted-foreground mt-2">
              You haven't submitted any applications yet.
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {applications.map((application) => (
              <Card key={application.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{application.scholarshipName}</CardTitle>
                    <Badge className={getStatusColor(application.status)}>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(application.status)}
                        {application.status}
                      </div>
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Application ID: {application.id}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Personal Information</h4>
                      <div className="space-y-1 text-sm">
                        <p><span className="font-medium">Name:</span> {application.studentName}</p>
                        <p><span className="font-medium">Email:</span> {application.email}</p>
                        <p><span className="font-medium">Phone:</span> {application.phone}</p>
                        <p><span className="font-medium">Date of Birth:</span> {new Date(application.dateOfBirth).toLocaleDateString()}</p>
                        {application.address && <p><span className="font-medium">Address:</span> {application.address}</p>}
                        {application.nationality && <p><span className="font-medium">Nationality:</span> {application.nationality}</p>}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Academic Information</h4>
                      <div className="space-y-1 text-sm">
                        <p><span className="font-medium">Category:</span> {application.category}</p>
                        <p><span className="font-medium">Marks:</span> {application.marks}%</p>
                        {application.gpa && <p><span className="font-medium">GPA:</span> {application.gpa}</p>}
                        <p><span className="font-medium">Family Income:</span> ₹{application.familyIncome.toLocaleString()}</p>
                        <p><span className="font-medium">Course:</span> {application.course}</p>
                        {application.degree && <p><span className="font-medium">Degree:</span> {application.degree}</p>}
                        {application.yearOfStudy && <p><span className="font-medium">Year of Study:</span> {application.yearOfStudy}</p>}
                        {application.fieldOfStudy && <p><span className="font-medium">Field of Study:</span> {application.fieldOfStudy}</p>}
                        {application.graduationDate && <p><span className="font-medium">Graduation Date:</span> {new Date(application.graduationDate).toLocaleDateString()}</p>}
                        <p><span className="font-medium">Institution:</span> {application.institution}</p>
                        {application.scholarshipAmount && <p><span className="font-medium">Scholarship Amount:</span> ₹{application.scholarshipAmount.toLocaleString()}</p>}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      Submitted on: {new Date(application.submittedAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyApplications;
