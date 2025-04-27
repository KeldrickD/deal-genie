import { CrmLeadsList } from '@/components/crm/CrmLeadsList';
import { PageHeader } from '@/components/ui/page-header';

export const metadata = {
  title: 'CRM | Lead Genie',
  description: 'View and manage all your saved leads'
};

export default function CrmPage() {
  return (
    <div className="container py-8">
      <PageHeader 
        title="CRM Dashboard"
        description="Manage all your saved leads in one place"
      />
      
      <div className="mt-8">
        <CrmLeadsList />
      </div>
    </div>
  );
} 