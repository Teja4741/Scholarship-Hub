import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import apiService from '@/services/api';
import { Scholarship } from '@/types/scholarship';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Send } from 'lucide-react';

const ApplicationForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [scholarship, setScholarship] = useState<Scholarship | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    studentName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    nationality: '',
    category: '',
    marks: '',
    gpa: '',
    familyIncome: '',
    course: '',
    degree: '',
    yearOfStudy: '',
    fieldOfStudy: '',
    graduationDate: '',
    institution: '',
  });



  useEffect(() => {
    const fetchScholarship = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const data = await apiService.getScholarshipById(id);
        setScholarship(data);
      } catch (err) {
        console.error('Failed to fetch scholarship:', err);
        toast({
          title: 'Error',
          description: 'Failed to load scholarship details. Please try again.',
          variant: 'destructive',
        });
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchScholarship();
  }, [id, navigate, toast]);



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!scholarship) return;

    // Basic validation
    if (parseInt(formData.marks) < scholarship.eligibility.minimumMarks) {
      toast({
        title: 'Eligibility Error',
        description: `Minimum ${scholarship.eligibility.minimumMarks}% marks required`,
        variant: 'destructive',
      });
      return;
    }

    if (parseInt(formData.familyIncome) > scholarship.eligibility.maximumIncome) {
      toast({
        title: 'Eligibility Error',
        description: `Family income must be below ₹${(scholarship.eligibility.maximumIncome / 100000).toFixed(1)}L`,
        variant: 'destructive',
      });
      return;
    }



    try {
      setSubmitting(true);
      
      // Submit form data as JSON
      await apiService.submitApplication({ ...formData, scholarshipId: scholarship.id });

      toast({
        title: 'Application Submitted!',
        description: 'Your scholarship application has been received. We will review it within 2-3 weeks.',
      });

      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      console.error('Failed to submit application:', err);
      toast({
        title: 'Submission Failed',
        description: 'There was an error submitting your application. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen bg-background py-12">
          <div className="container mx-auto px-4 max-w-3xl">
            <Skeleton className="h-10 w-48 mb-6" />
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Skeleton className="h-6 w-40" />
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-4">
                  <Skeleton className="h-6 w-40" />
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-4">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-10 w-full" />
                </div>

                <div className="flex gap-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </>
    );
  }

  if (!scholarship) {
    return (
      <>
        <Navigation />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold mb-4">Scholarship Not Found</h1>
          <Button onClick={() => navigate('/')}>Return to Home</Button>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <Button
            variant="ghost"
            onClick={() => navigate(`/scholarship/${id}`)}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Details
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Application Form</CardTitle>
              <CardDescription>
                Apply for {scholarship.name}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Personal Information</h3>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="studentName">Full Name *</Label>
                      <Input
                        id="studentName"
                        required
                        value={formData.studentName}
                        onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        required
                        value={formData.dateOfBirth}
                        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="your.email@example.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 1234567890"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Enter your full address"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nationality">Nationality</Label>
                    <Input
                      id="nationality"
                      value={formData.nationality}
                      onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                      placeholder="e.g., Indian"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="obc">OBC</SelectItem>
                        <SelectItem value="sc">SC</SelectItem>
                        <SelectItem value="st">ST</SelectItem>
                        <SelectItem value="ews">EWS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Academic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Academic Information</h3>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="marks">Percentage *</Label>
                      <Input
                        id="marks"
                        type="number"
                        required
                        min="0"
                        max="100"
                        value={formData.marks}
                        onChange={(e) => setFormData({ ...formData, marks: e.target.value })}
                        placeholder="Enter your marks %"
                      />
                      <p className="text-xs text-muted-foreground">
                        Minimum required: {scholarship.eligibility.minimumMarks}%
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gpa">GPA (Optional)</Label>
                      <Input
                        id="gpa"
                        type="number"
                        min="0"
                        max="4"
                        step="0.01"
                        value={formData.gpa}
                        onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
                        placeholder="e.g., 3.5"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="course">Course/Program *</Label>
                      <Input
                        id="course"
                        required
                        value={formData.course}
                        onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                        placeholder="e.g., B.Tech, MBBS"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="degree">Degree</Label>
                      <Input
                        id="degree"
                        value={formData.degree}
                        onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                        placeholder="e.g., Bachelor of Technology"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="yearOfStudy">Year of Study</Label>
                      <Input
                        id="yearOfStudy"
                        value={formData.yearOfStudy}
                        onChange={(e) => setFormData({ ...formData, yearOfStudy: e.target.value })}
                        placeholder="e.g., 2nd Year"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fieldOfStudy">Field of Study</Label>
                      <Input
                        id="fieldOfStudy"
                        value={formData.fieldOfStudy}
                        onChange={(e) => setFormData({ ...formData, fieldOfStudy: e.target.value })}
                        placeholder="e.g., Computer Science"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="graduationDate">Expected Graduation Date</Label>
                    <Input
                      id="graduationDate"
                      type="date"
                      value={formData.graduationDate}
                      onChange={(e) => setFormData({ ...formData, graduationDate: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="institution">Institution Name *</Label>
                    <Input
                      id="institution"
                      required
                      value={formData.institution}
                      onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                      placeholder="Enter your college/university name"
                    />
                  </div>
                </div>

                {/* Financial Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Financial Information</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="familyIncome">Annual Family Income (₹) *</Label>
                    <Input
                      id="familyIncome"
                      type="number"
                      required
                      value={formData.familyIncome}
                      onChange={(e) => setFormData({ ...formData, familyIncome: e.target.value })}
                      placeholder="Enter annual family income"
                    />
                    <p className="text-xs text-muted-foreground">
                      Maximum allowed: ₹{(scholarship.eligibility.maximumIncome / 100000).toFixed(1)} Lakhs per year
                    </p>
                  </div>
                </div>



                {/* Documents Note (This is just a reminder) */}
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2 text-foreground">Reminder: Required Documents</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Ensure all required documents listed for this scholarship are ready:
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {scholarship.documentsRequired.slice(0, 4).map((doc, index) => (
                      <li key={index}>• {doc}</li>
                    ))}
                  </ul>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(`/scholarship/${id}`)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-primary hover:bg-primary/90"
                    disabled={submitting}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    {submitting ? 'Submitting...' : 'Submit Application'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
};

export default ApplicationForm;