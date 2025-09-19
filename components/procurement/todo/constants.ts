
import { TodoSection } from './types';

export const DEFAULT_CHECKLIST_TEMPLATE: TodoSection[] = [
  {
    id: 'documentation',
    title: 'Documentation & Compliance',
    items: [
      { id: 'health-cert', label: 'Health Certificate received & verified', completed: false, priority: 'high' },
      { id: 'packing-list', label: 'Packing List matches PO', completed: false, priority: 'high' },
      { id: 'import-license', label: 'Import License or Permit ready', completed: false, priority: 'high' },
      { id: 'invoice-docs', label: 'Invoice / Commercial Document attached', completed: false, priority: 'medium' },
      { id: 'bill-lading', label: 'Bill of Lading / Air Waybill obtained', completed: false, priority: 'high' },
      { id: 'customs-declaration', label: 'Customs Declaration prepared', completed: false, priority: 'medium' },
      { id: 'certificate-origin', label: 'Certificate of Origin (if applicable)', completed: false, priority: 'low' }
    ]
  },
  {
    id: 'cold-chain',
    title: 'Cold Chain & Storage',
    items: [
      { id: 'storage-capacity', label: 'Confirm warehouse storage capacity (fridge/freezer/dry)', completed: false, priority: 'high' },
      { id: 'temperature-control', label: 'Verify temperature control requirements', completed: false, priority: 'high' },
      { id: 'notify-warehouse', label: 'Notify warehouse team of incoming ETA', completed: false, priority: 'medium' },
      { id: 'map-locations', label: 'Map pallet/shelf locations for storage', completed: false, priority: 'medium' }
    ]
  },
  {
    id: 'logistics',
    title: 'Logistics Coordination',
    items: [
      { id: 'notify-logistics', label: 'Notify logistics team for pickup', completed: false, priority: 'high' },
      { id: 'customs-clearance', label: 'Schedule customs clearance slot', completed: false, priority: 'high' },
      { id: 'transport-arrangement', label: 'Arrange truck or reefer transport (if needed)', completed: false, priority: 'medium' },
      { id: 'customs-broker', label: 'Inform customs broker with documents & ETA', completed: false, priority: 'high' },
      { id: 'warehouse-transfer', label: 'Coordinate transfer to main warehouse (if applicable)', completed: false, priority: 'medium' }
    ]
  },
  {
    id: 'internal',
    title: 'Internal Coordination',
    items: [
      { id: 'notify-purchasing', label: 'Notify purchasing team', completed: false, priority: 'medium' },
      { id: 'notify-sales', label: 'Notify sales team if restocking key items', completed: false, priority: 'medium' },
      { id: 'update-erp', label: 'Update ERP/shipment records', completed: false, priority: 'medium' },
      { id: 'qa-inspection', label: 'Schedule QA inspection on arrival', completed: false, priority: 'high' },
      { id: 'confirm-supplier', label: 'Confirm with supplier that all items were shipped', completed: false, priority: 'medium' }
    ]
  }
];

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
