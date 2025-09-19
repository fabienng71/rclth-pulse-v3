
import { useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { sendReturnRequestEmail } from '@/services/returnRequestService';
import { useNavigate } from 'react-router-dom';

export const useReturnEmailHandler = () => {
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();

  const handleEmailNotification = async (id: string) => {
    const emailResult = await sendReturnRequestEmail(id);
    
    if (emailResult.success) {
      setEmailSent(true);
      toast({
        title: "Return request sent",
        description: `Your return request has been successfully sent and an email notification has been delivered to the team.${emailResult.id ? ` (Email ID: ${emailResult.id})` : ''}`,
      });
      
      setTimeout(() => {
        navigate('/forms/return');
      }, 1500);
      return true;
    } else if (emailResult.isDomainError) {
      handleDomainError();
      return false;
    } else {
      handleEmailError();
      return false;
    }
  };

  const handleDomainError = () => {
    toast({
      title: "Return request sent but email delivery needs attention",
      description: "Your return request has been sent, but the email notification couldn't be delivered because the domain needs to be verified in Resend. The development team has been notified.",
      variant: "default",
    });
    
    setTimeout(() => {
      toast({
        title: "Email domain verification required",
        description: "To enable email notifications, please verify the 'repertoire.co.th' domain in Resend at https://resend.com/domains",
        variant: "default",
      });
    }, 1000);
    
    setTimeout(() => {
      navigate('/forms/return');
    }, 3000);
  };

  const handleEmailError = () => {
    toast({
      title: "Return request sent",
      description: "Your return request has been sent, but there was an issue sending the email notification. The team has been notified of this issue.",
      variant: "default",
    });
    
    setTimeout(() => {
      navigate('/forms/return');
    }, 1500);
  };

  return {
    emailSent,
    handleEmailNotification
  };
};
