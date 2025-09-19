
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '../stores/authStore';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';

const Index = () => {
  console.log('=== INDEX: Index component rendering ===');
  
  const { user, isLoading } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('=== INDEX: useEffect for navigation, user:', !!user, 'isLoading:', isLoading);
    if (user && !isLoading) {
      console.log('=== INDEX: User authenticated, navigating to dashboard ===');
      navigate('/dashboard');
    }
  }, [user, isLoading, navigate]);

  console.log('=== INDEX: Rendering with state - isLoading:', isLoading);

  if (isLoading) {
    console.log('=== INDEX: Showing loading state ===');
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="text-2xl mb-4">⏳</div>
          <p className="text-lg text-muted-foreground">Loading application...</p>
        </div>
      </div>
    );
  }

  console.log('=== INDEX: Rendering main landing page ===');
  return (
    <>
      <Navigation />
      
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                    Repertoire Culinaire
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Business Intelligence for Culinary Excellence
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg">
                    <Link to="/login">Sign In</Link>
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative w-full h-full max-w-md overflow-hidden rounded-lg border bg-gradient-to-b from-primary/20 to-accent p-8 shadow-xl">
                  <div className="space-y-4">
                    <div className="h-6 w-20 rounded-md bg-primary/50"></div>
                    <div className="h-4 w-full rounded-md bg-primary/30"></div>
                    <div className="h-4 w-3/4 rounded-md bg-primary/30"></div>
                    <div className="h-12 w-full rounded-md bg-white/90"></div>
                    <div className="h-12 w-full rounded-md bg-white/90"></div>
                    <div className="h-12 w-full rounded-md bg-primary/90"></div>
                    <div className="flex justify-between">
                      <div className="h-4 w-1/4 rounded-md bg-primary/30"></div>
                      <div className="h-4 w-1/4 rounded-md bg-primary/30"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="border-t py-6 md:py-8">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex flex-col items-center gap-2 md:flex-row md:gap-4">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} UserVerse. All rights reserved.
            </p>
          </div>
          <div className="flex gap-4">
            <Link
              to="#"
              className="text-sm text-muted-foreground underline-offset-4 hover:underline"
            >
              Privacy Policy
            </Link>
            <Link
              to="#"
              className="text-sm text-muted-foreground underline-offset-4 hover:underline"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Index;
