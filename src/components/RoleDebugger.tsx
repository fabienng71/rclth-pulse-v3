
import { useAuthStore } from '../stores/authStore';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileDebugInfo } from './admin/ProfileDebugInfo';
import { FileUploadTab } from './admin/FileUploadTab';
import { UploadProgress } from './admin/UploadProgress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const RoleDebugger = () => {
  const { isAdmin, user } = useAuthStore();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [activeTab, setActiveTab] = useState<string>("sales-data");
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);

  // Check if the user has the specific email that's allowed to upload data
  const canUploadData = user?.email === 'fabien@repertoire.co.th';

  const handleUploadProgress = (progress: { current: number, total: number }) => {
    setUploadProgress(progress);
  };

  return (
    <div className="border p-4 rounded-md mb-4 bg-muted/50">
      <ProfileDebugInfo />
      
      {canUploadData && (
        <>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList>
              <TabsTrigger value="sales-data">Sales Data Upload</TabsTrigger>
              <TabsTrigger value="credit-memos">Credit Memos Upload</TabsTrigger>
              <TabsTrigger value="cogs-data">COGS Upload</TabsTrigger>
            </TabsList>
            
            <TabsContent value="sales-data">
              <FileUploadTab 
                title="Sales Data Upload"
                description="Upload sales data from Excel (.xlsx or .xls)"
                buttonText="Upload Sales Data"
                buttonColor="bg-blue-500 hover:bg-blue-600"
                isCreditmemo={false}
                isAdmin={isAdmin}
                isUploading={isUploading && activeTab === "sales-data"}
                setIsUploading={setIsUploading}
                onUploadProgress={handleUploadProgress}
                uploadProgress={uploadProgress}
              />
            </TabsContent>
            
            <TabsContent value="credit-memos">
              <FileUploadTab 
                title="Credit Memos Upload"
                description="Upload credit memos from Excel (.xlsx or .xls)"
                buttonText="Upload Credit Memos"
                buttonColor="bg-green-500 hover:bg-green-600"
                isCreditmemo={true}
                isAdmin={isAdmin}
                isUploading={isUploading && activeTab === "credit-memos"}
                setIsUploading={setIsUploading}
                onUploadProgress={handleUploadProgress}
                uploadProgress={uploadProgress}
              />
            </TabsContent>
            
            <TabsContent value="cogs-data">
              <div className="space-y-4">
                {/* Month/Year Selection for COGS Upload */}
                <div className="p-3 rounded-md bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <div className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-3">
                    📅 COGS Data Period Selection
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="year-select" className="text-xs font-medium">Year</Label>
                      <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                        <SelectTrigger id="year-select" className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i).map(year => (
                            <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="month-select" className="text-xs font-medium">Month</Label>
                      <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                        <SelectTrigger id="month-select" className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                            <SelectItem key={month} value={month.toString()}>
                              {new Date(2024, month - 1).toLocaleString('default', { month: 'long' })}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                    All uploaded COGS records will be assigned to {new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </p>
                </div>
                
                <FileUploadTab 
                  title="COGS Data Upload"
                  description="Upload COGS data from Excel (.xlsx or .xls). Calculates cogs_unit and margin automatically."
                  buttonText="Upload COGS Data"
                  buttonColor="bg-purple-500 hover:bg-purple-600"
                  isCreditmemo={false}
                  isCogs={true}
                  isAdmin={isAdmin}
                  isUploading={isUploading && activeTab === "cogs-data"}
                  setIsUploading={setIsUploading}
                  onUploadProgress={handleUploadProgress}
                  uploadProgress={uploadProgress}
                  selectedYear={selectedYear}
                  selectedMonth={selectedMonth}
                />
              </div>
            </TabsContent>
          </Tabs>
          
          <UploadProgress 
            current={uploadProgress.current}
            total={uploadProgress.total}
            isUploading={isUploading}
          />
        </>
      )}
    </div>
  );
};

export default RoleDebugger;
