
export const getFullLeaveName = (leaveType: string) => {
  const leaveTypeMap = {
    'AL': 'Annual Leave',
    'BL': 'Business Leave',
    'SL': 'Sick Leave',
    'Unpaid Leave': 'Unpaid Leave'
  };
  return leaveTypeMap[leaveType] || leaveType;
};

export const generateUserColors = (leaves: any[]) => {
  const colors = [
    '#9b87f5', // Primary Purple
    '#F97316', // Bright Orange
    '#0EA5E9', // Ocean Blue
    '#D946EF', // Magenta Pink
    '#8B5CF6', // Vivid Purple
    '#1EAEDB', // Bright Blue
    '#33C3F0', // Sky Blue
  ];
  
  const colorMap = new Map<string, string>();
  leaves.forEach((leave) => {
    if (leave.user_id && !colorMap.has(leave.user_id)) {
      colorMap.set(leave.user_id, colors[colorMap.size % colors.length]);
    }
  });
  return colorMap;
};
