import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import apiService from '@/services/api';
import { Scholarship } from '@/types/scholarship';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft,
  IndianRupee,
  Calendar,
  TrendingUp,
  Users,
  FileText,
  CheckCircle2,
  Clock
} from 'lucide-react';
import medicalIcon from '@/assets/medical-icon.png';
import engineeringIcon from '@/assets/engineering-icon.png';
import degreeIcon from '@/assets/degree-icon.png';

const ScholarshipDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [scholarship, setScholarship] = useState<Scholarship | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchScholarship = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const data = await apiService.getScholarshipById(id);
        setScholarship(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch scholarship:', err);
        setError('Failed to load scholarship details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchScholarship();
  }, [id]);

  if (loading) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen bg-background">
          <section className="bg-gradient-to-r from-primary to-secondary text-white py-12">
            <div className="container mx-auto px-4">
              <Skeleton className="h-10 w-48 mb-6 bg-white/20" />
              <div className="flex flex-col md:flex-row items-start gap-6">
                <Skeleton className="w-24 h-24 bg-white/20 rounded-2xl" />
                <div className="flex-1">
                  <Skeleton className="h-6 w-32 mb-3 bg-white/20" />
                  <Skeleton className="h-10 w-full mb-3 bg-white/20" />
                  <Skeleton className="h-6 w-3/4 bg-white/20" />
                </div>
                <Skeleton className="w-48 h-24 bg-white/20 rounded-xl" />
              </div>
            </div>
          </section>
          <section className="container mx-auto px-4 py-12">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-6">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-40 w-full" />
              </div>
              <div className="space-y-6">
                <Skeleton className="h-80 w-full" />
              </div>
            </div>
          </section>
        </main>
      </>
    );
  }

  if (error || !scholarship) {
    return (
      <>
        <Navigation />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold mb-4">
            {error ? 'Error Loading Scholarship' : 'Scholarship Not Found'}
          </h1>
          <p className="text-muted-foreground mb-6">
            {error || 'The scholarship you are looking for does not exist.'}
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => navigate('/')}>Return to Home</Button>
            {error && (
              <Button variant="outline" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            )}
          </div>
        </div>
      </>
    );
  }

  const getIcon = () => {
    switch (scholarship.type) {
      case 'Medical':
        return medicalIcon;
      case 'Engineering':
        return engineeringIcon;
      default:
        return degreeIcon;
    }
  };

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background">
        {/* Header */}
        <section className="bg-gradient-to-r from-primary to-secondary text-white py-12">
          <div className="container mx-auto px-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="mb-6 text-white hover:bg-white/20"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Scholarships
            </Button>

            <div className="flex flex-col md:flex-row items-start gap-6">
              <img 
                src={getIcon()} 
                alt={scholarship.type}
                className="w-24 h-24 bg-white/10 backdrop-blur-sm rounded-2xl p-4"
              />
              
              <div className="flex-1">
                <Badge className="mb-3 bg-white/20 text-white border-white/30">
                  {scholarship.type}
                </Badge>
                <h1 className="text-4xl font-bold mb-3">{scholarship.name}</h1>
                <p className="text-lg text-white/90">{scholarship.description}</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="text-3xl font-bold mb-1">₹{scholarship.amount.toLocaleString()}</div>
                <div className="text-white/80 text-sm">Annual Scholarship</div>
              </div>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="md:col-span-2 space-y-6">
              {/* Eligibility Criteria */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Eligibility Criteria
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">Minimum Marks</div>
                      <div className="text-2xl font-bold text-primary">{scholarship.eligibility.minimumMarks}%</div>
                    </div>
                    
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">Maximum Family Income</div>
                      <div className="text-2xl font-bold text-primary">₹{(scholarship.eligibility.maximumIncome / 100000).toFixed(1)}L</div>
                    </div>

                    {scholarship.eligibility.ageLimit && (
                      <div className="p-4 bg-muted rounded-lg">
                        <div className="text-sm text-muted-foreground mb-1">Age Limit</div>
                        <div className="text-2xl font-bold text-primary">{scholarship.eligibility.ageLimit} years</div>
                      </div>
                    )}

                    {scholarship.eligibility.courseYear && (
                      <div className="p-4 bg-muted rounded-lg">
                        <div className="text-sm text-muted-foreground mb-1">Course Year</div>
                        <div className="text-2xl font-bold text-primary">{scholarship.eligibility.courseYear}</div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Benefits */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-secondary" />
                    Scholarship Benefits
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {scholarship.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Documents Required */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-accent" />
                    Required Documents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {scholarship.documentsRequired.map((doc, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{doc}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Info */}
              <Card className="sticky top-20">
                <CardHeader>
                  <CardTitle className="text-lg">Application Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div>
                      <div className="text-xs text-muted-foreground">Deadline</div>
                      <div className="font-semibold">
                        {new Date(scholarship.deadline).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <IndianRupee className="h-5 w-5 text-accent" />
                    <div>
                      <div className="text-xs text-muted-foreground">Scholarship Amount</div>
                      <div className="font-semibold">₹{scholarship.amount.toLocaleString()}/year</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <Clock className="h-5 w-5 text-secondary" />
                    <div>
                      <div className="text-xs text-muted-foreground">Processing Time</div>
                      <div className="font-semibold">2-3 weeks</div>
                    </div>
                  </div>

                  <Button 
                    className="w-full mt-4 bg-primary hover:bg-primary/90"
                    size="lg"
                    onClick={() => navigate(`/apply/${scholarship.id}`)}
                  >
                    Apply Now
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    Make sure you have all required documents ready
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default ScholarshipDetail;
