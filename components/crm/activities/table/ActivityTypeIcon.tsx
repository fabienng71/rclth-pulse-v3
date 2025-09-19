
import React from "react";
import {
  Users,
  Phone,
  Mail,
  MessageSquare,
} from "lucide-react";

interface ActivityTypeIconProps {
  type?: string | null;
}

export const ActivityTypeIcon: React.FC<ActivityTypeIconProps> = ({ type }) => {
  switch (type?.toLowerCase()) {
    case "meeting":
      return <Users className="h-4 w-4" />;
    case "phone call":
      return <Phone className="h-4 w-4" />;
    case "email":
      return <Mail className="h-4 w-4" />;
    case "walk-in":
      return <MessageSquare className="h-4 w-4" />;
    default:
      return <MessageSquare className="h-4 w-4" />;
  }
};
