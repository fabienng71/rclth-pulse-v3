
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { TodoSection } from '@/types/shipmentTodo';
import { useAuthStore } from '@/stores/authStore';
import { useChecklistTemplates } from './useChecklistTemplates';

export const useCreateShipmentTodo = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();
  const { templates } = useChecklistTemplates();

  const createTodoForShipment = async (shipmentId: string, vendorName: string) => {
    if (!user) {
      toast.error('User not authenticated');
      return false;
    }

    try {
      setLoading(true);

      // Get the default template
      const defaultTemplate = templates.find(t => t.is_default);
      
      let templateData: TodoSection[];
      let templateId: string | null = null;

      if (defaultTemplate) {
        // Use the default template data
        templateData = defaultTemplate.template_data.map(section => ({
          ...section,
          items: section.items.map(item => {
            // Replace vendor placeholder in the confirm-supplier task
            if (item.id === 'confirm-supplier') {
              return {
                ...item,
                label: `Confirm with ${vendorName} that all items were shipped`
              };
            }
            return item;
          })
        }));
        templateId = defaultTemplate.id;
      } else {
        // Fallback to hardcoded template data
        templateData = [
          {
            id: "documentation",
            title: "Documentation & Compliance",
            items: [
              {id: "health-cert", label: "Health Certificate received & verified", completed: false, priority: "high"},
              {id: "packing-list", label: "Packing List matches PO", completed: false, priority: "high"},
              {id: "import-license", label: "Import License or Permit ready", completed: false, priority: "high"},
              {id: "invoice-docs", label: "Invoice / Commercial Document attached", completed: false, priority: "medium"},
              {id: "bill-lading", label: "Bill of Lading / Air Waybill obtained", completed: false, priority: "high"},
              {id: "customs-declaration", label: "Customs Declaration prepared", completed: false, priority: "medium"},
              {id: "certificate-origin", label: "Certificate of Origin (if applicable)", completed: false, priority: "low"}
            ]
          },
          {
            id: "cold-chain",
            title: "Cold Chain & Storage",
            items: [
              {id: "storage-capacity", label: "Confirm warehouse storage capacity (fridge/freezer/dry)", completed: false, priority: "high"},
              {id: "temperature-control", label: "Verify temperature control requirements", completed: false, priority: "high"},
              {id: "notify-warehouse", label: "Notify warehouse team of incoming ETA", completed: false, priority: "medium"},
              {id: "map-locations", label: "Map pallet/shelf locations for storage", completed: false, priority: "medium"}
            ]
          },
          {
            id: "logistics",
            title: "Logistics Coordination",
            items: [
              {id: "notify-logistics", label: "Notify logistics team for pickup", completed: false, priority: "high"},
              {id: "customs-clearance", label: "Schedule customs clearance slot", completed: false, priority: "high"},
              {id: "transport-arrangement", label: "Arrange truck or reefer transport (if needed)", completed: false, priority: "medium"},
              {id: "customs-broker", label: "Inform customs broker with documents & ETA", completed: false, priority: "high"},
              {id: "warehouse-transfer", label: "Coordinate transfer to main warehouse (if applicable)", completed: false, priority: "medium"}
            ]
          },
          {
            id: "internal",
            title: "Internal Coordination",
            items: [
              {id: "notify-purchasing", label: "Notify purchasing team", completed: false, priority: "medium"},
              {id: "notify-sales", label: "Notify sales team if restocking key items", completed: false, priority: "medium"},
              {id: "update-erp", label: "Update ERP/shipment records", completed: false, priority: "medium"},
              {id: "qa-inspection", label: "Schedule QA inspection on arrival", completed: false, priority: "high"},
              {id: "confirm-supplier", label: `Confirm with ${vendorName} that all items were shipped`, completed: false, priority: "medium"}
            ]
          }
        ];
      }

      // Calculate total tasks
      const totalTasks = templateData.reduce((total, section) => 
        total + section.items.length, 0
      );

      const { error } = await supabase
        .from('shipment_todos')
        .insert({
          shipment_id: shipmentId,
          checklist_data: templateData as any, // Cast to any for Json compatibility
          completion_stats: { total: totalTasks, completed: 0 } as any, // Cast to any for Json compatibility
          task_history: [] as any, // Cast to any for Json compatibility
          all_tasks_completed: false,
          last_modified_by: user.id,
          template_id: templateId
        });

      if (error) {
        throw error;
      }

      console.log('Created todo for shipment:', shipmentId, 'using template:', templateId || 'fallback');
      return true;

    } catch (error) {
      console.error('Error creating shipment todo:', error);
      toast.error('Failed to create todo list');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { createTodoForShipment, loading };
};
