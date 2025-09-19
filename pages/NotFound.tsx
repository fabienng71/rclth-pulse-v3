
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  // Check path to provide direct links back to sections
  const isQuotationsPath = location.pathname.includes('quotations');
  const isFormsPath = location.pathname.includes('forms');
  const isCrmPath = location.pathname.includes('crm');
  const isProcurementPath = location.pathname.includes('procurement');
  const isMarketingPath = location.pathname.includes('marketing');
  const isReportsPath = location.pathname.includes('reports');

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-primary">
      <div className="text-center p-8 bg-card rounded-lg shadow-md">
        <h1 className="text-4xl font-bold mb-4 text-red-500">404</h1>
        <p className="text-xl text-muted-foreground mb-6">Oops! Page not found</p>
        <p className="text-sm text-muted-foreground mb-8">
          The page you are looking for does not exist or has been moved.
        </p>
        
        <div className="space-y-4">
          {isQuotationsPath && (
            <Button asChild variant="outline" className="mr-4">
              <Link to="/quotations">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Quotations
              </Link>
            </Button>
          )}
          
          {isFormsPath && (
            <Button asChild variant="outline" className="mr-4">
              <Link to="/forms">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Forms
              </Link>
            </Button>
          )}
          
          {isCrmPath && (
            <Button asChild variant="outline" className="mr-4">
              <Link to="/crm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to CRM
              </Link>
            </Button>
          )}
          
          {isProcurementPath && (
            <Button asChild variant="outline" className="mr-4">
              <Link to="/procurement">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Procurement
              </Link>
            </Button>
          )}
          
          {isMarketingPath && (
            <Button asChild variant="outline" className="mr-4">
              <Link to="/marketing">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Marketing
              </Link>
            </Button>
          )}
          
          {isReportsPath && (
            <Button asChild variant="outline" className="mr-4">
              <Link to="/reports">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Reports
              </Link>
            </Button>
          )}
          
          <Button asChild>
            <Link to="/">Go to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
