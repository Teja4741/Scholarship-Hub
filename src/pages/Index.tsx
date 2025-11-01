import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import ScholarshipCard from '@/components/ScholarshipCard';
import apiService from '@/services/api';
import { Scholarship } from '@/types/scholarship';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedType, setSelectedType] = useState<string>('All');
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const types = ['All', 'Medical', 'Engineering', 'Degree', 'Diploma', 'ITI'];

  useEffect(() => {
    const fetchScholarships = async () => {
      try {
        setLoading(true);
        const data = await apiService.getScholarships();
        setScholarships(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch scholarships:', err);
        setError('Failed to load scholarships. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchScholarships();
  }, []);

  const filteredScholarships = selectedType === 'All'
    ? scholarships
    : scholarships.filter(s => s.type === selectedType);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Hero />

      {/* Scholarships Section */}
      <section id="scholarships" className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-foreground">
              Available Scholarship Programs
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore various scholarship opportunities across different educational streams
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex justify-center mb-10">
            <Tabs value={selectedType} onValueChange={setSelectedType} className="w-full max-w-4xl">
              <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 h-auto">
                {types.map((type) => (
                  <TabsTrigger 
                    key={type} 
                    value={type}
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    {type}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* Scholarship Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {loading ? (
              // Loading skeletons
              Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="space-y-4">
                  <Skeleton className="h-48 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))
            ) : error ? (
              <div className="col-span-full text-center py-12">
                <p className="text-destructive text-lg mb-4">{error}</p>
                <Button onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </div>
            ) : (
              filteredScholarships.map((scholarship) => (
                <ScholarshipCard key={scholarship.id} scholarship={scholarship} />
              ))
            )}
          </div>

          {!loading && !error && filteredScholarships.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No scholarships found in this category</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary to-secondary text-white py-16 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Need Help with Your Application?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Our support team is here to guide you through the application process
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user?.role === 'admin' && (
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-white/90 font-semibold"
                onClick={() => navigate('/admin')}
              >
                Admin Dashboard
              </Button>
            )}
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-white/90 font-semibold"
            >
              Contact Support
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary font-semibold"
            >
              FAQs
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8 px-4">
        <div className="container mx-auto text-center text-muted-foreground">
          <p className="mb-2">© 2025 ScholarHub - Government Scholarship Portal</p>
          <p className="text-sm">Empowering students through quality education</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
