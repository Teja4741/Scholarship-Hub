import { Link, useLocation, useNavigate } from 'react-router-dom';
import { GraduationCap, Home, FileText, BookOpen, Search, User, LogOut, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NotificationBell from './NotificationBell';
import { useAuth } from '../contexts/AuthContext';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-card border-b border-border backdrop-blur-sm bg-card/95">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 bg-gradient-to-br from-primary to-secondary rounded-lg group-hover:scale-110 transition-transform">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="font-bold text-lg text-foreground">ScholarHub</div>
              <div className="text-xs text-muted-foreground">Government Portal</div>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-2">
            <Link to="/">
              <Button
                variant={isActive('/') ? 'default' : 'ghost'}
                className="gap-2"
              >
                <Home className="h-4 w-4" />
                Home
              </Button>
            </Link>

            <Link to="/#scholarships">
              <Button variant="ghost" className="gap-2">
                <BookOpen className="h-4 w-4" />
                Scholarships
              </Button>
            </Link>

            {user && (
              <>
                {user.role === 'admin' && (
                  <Link to="/admin">
                    <Button variant="ghost" className="gap-2">
                      <Shield className="h-4 w-4" />
                      Admin Dashboard
                    </Button>
                  </Link>
                )}

                <Link to="/applications">
                  <Button variant="ghost" className="gap-2">
                    <FileText className="h-4 w-4" />
                    My Applications
                  </Button>
                </Link>

                <Button
                  variant="ghost"
                  className="gap-2"
                  onClick={() => navigate('/search')}
                >
                  <Search className="h-4 w-4" />
                  Advanced Search
                </Button>
              </>
            )}
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <NotificationBell />
                <div className="hidden md:flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Welcome, {user.firstName}
                  </span>
                  <Button variant="ghost" size="sm" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Icon */}
            <div className="md:hidden">
              <Button variant="ghost" size="icon">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
