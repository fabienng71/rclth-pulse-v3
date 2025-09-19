
import Navigation from "@/components/Navigation";
import { ContactForm } from "@/components/crm/ContactForm";
import { useParams, useLocation } from "react-router-dom";
import { UniversalBackButton, UniversalBreadcrumb } from "@/components/common/navigation";

const CreateContact = () => {
  const { id } = useParams();
  const location = useLocation();
  
  const isViewMode = id && !location.pathname.endsWith('/edit');
  const isEditing = !!id && !isViewMode;

  const getPageTitle = () => {
    if (isViewMode) return "Contact Details";
    if (isEditing) return "Edit Contact";
    return "Create New Contact";
  };

  const getPageDescription = () => {
    if (isViewMode) return "View and manage contact information";
    if (isEditing) return "Update contact information";
    return "Add a new contact to your network";
  };

  return (
    <>
      <Navigation />
      <main className="container py-10 max-w-6xl mx-auto px-4 sm:px-6">
        <UniversalBreadcrumb />
        
        <div className="flex items-center gap-4 mb-8">
          <UniversalBackButton />
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight">{getPageTitle()}</h1>
            <p className="text-muted-foreground mt-1">{getPageDescription()}</p>
          </div>
        </div>

        <ContactForm />
      </main>
    </>
  );
};

export default CreateContact;
