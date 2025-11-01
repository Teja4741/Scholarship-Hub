import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Scholarship } from '@/types/scholarship';
import { Calendar, IndianRupee, TrendingUp, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import medicalIcon from '@/assets/medical-icon.png';
import engineeringIcon from '@/assets/engineering-icon.png';
import degreeIcon from '@/assets/degree-icon.png';

const ScholarshipCard = ({ scholarship }: { scholarship: Scholarship }) => {
  const navigate = useNavigate();
  
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

  const getTypeColor = () => {
    switch (scholarship.type) {
      case 'Medical':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'Engineering':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'Degree':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'Diploma':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'ITI':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
    }
  };

  return (
    <Card className="group hover:shadow-[var(--shadow-elevated)] transition-all duration-300 hover:-translate-y-1 bg-card border-border overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-primary to-secondary" />
      
      <CardHeader>
        <div className="flex items-start justify-between mb-4">
          <img 
            src={getIcon()} 
            alt={`${scholarship.type} icon`}
            className="w-16 h-16 object-contain"
          />
          <Badge className={getTypeColor()}>
            {scholarship.type}
          </Badge>
        </div>
        
        <CardTitle className="text-xl group-hover:text-primary transition-colors">
          {scholarship.name}
        </CardTitle>
        <CardDescription className="line-clamp-2">
          {scholarship.description}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-2 text-sm">
            <IndianRupee className="h-4 w-4 text-accent" />
            <span className="font-semibold text-accent">₹{scholarship.amount.toLocaleString()}</span>
            <span className="text-muted-foreground">per year</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            <span>Min. {scholarship.eligibility.minimumMarks}% marks required</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>Income limit: ₹{(scholarship.eligibility.maximumIncome / 100000).toFixed(1)}L/year</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Deadline: {new Date(scholarship.deadline).toLocaleDateString('en-IN', { 
              day: 'numeric', 
              month: 'short', 
              year: 'numeric' 
            })}</span>
          </div>
        </div>

        <Button 
          onClick={() => navigate(`/scholarship/${scholarship.id}`)}
          className="w-full bg-primary hover:bg-primary/90 transition-colors"
        >
          View Details & Apply
        </Button>
      </CardContent>
    </Card>
  );
};

export default ScholarshipCard;
