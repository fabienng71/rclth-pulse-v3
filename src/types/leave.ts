export type LeaveType = 'Annual' | 'Sick Leave' | 'Business Leave';

export type LeaveStatus = 'Pending' | 'Approved' | 'Denied';

export interface LeaveRequest {
  id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  leave_type: LeaveType;
  reason: string;
  status: LeaveStatus;
  denial_reason?: string;
  approved_by?: string;
  duration_days: number;
  created_at: string;
  updated_at: string;
  
  // Joined data
  user_profile?: {
    full_name: string;
    email: string;
    al_credit: number;
    sl_credit: number;
    bl_credit: number;
    leave_balance: number;
  };
  approver_profile?: {
    full_name: string;
    email: string;
  };
}

export interface LeaveBalance {
  al_credit: number;
  sl_credit: number;
  bl_credit: number;
  leave_balance: number;
}

export interface LeaveFormData {
  start_date: string;
  end_date: string;
  leave_type: LeaveType;
  reason: string;
}

export interface LeaveApprovalData {
  request_id: string;
  action: 'approve' | 'deny';
  denial_reason?: string;
}

export interface LeaveStats {
  total_requests: number;
  pending_requests: number;
  approved_requests: number;
  denied_requests: number;
  total_days_requested: number;
  total_days_approved: number;
}

export interface LeaveRequestFilters {
  status?: LeaveStatus;
  leave_type?: LeaveType;
  start_date?: string;
  end_date?: string;
  user_id?: string;
  search?: string;
}