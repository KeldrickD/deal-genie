import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface CreateTablesNoticeProps {
  tableName: string;
  onRetry?: () => void;
}

export default function CreateTablesNotice({ tableName, onRetry }: CreateTablesNoticeProps) {
  return (
    <Card className="mb-4 border-amber-300 bg-amber-50 dark:bg-amber-950/20">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-amber-500" />
          <CardTitle className="text-amber-700 dark:text-amber-400">Database Setup Required</CardTitle>
        </div>
        <CardDescription className="text-amber-700 dark:text-amber-400">
          The <code className="bg-amber-100 dark:bg-amber-800/50 px-1 rounded">{tableName}</code> table hasn't been created yet
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-amber-700 dark:text-amber-400">
          To fix this issue, please run the database migrations script to create the necessary tables:
        </p>
        <ol className="mt-2 space-y-1 text-sm text-amber-700 dark:text-amber-400 list-decimal list-inside">
          <li>Open a terminal in your project directory</li>
          <li>Run <code className="bg-amber-100 dark:bg-amber-800/50 px-1 rounded">./run-migrations.ps1</code> (Windows) or <code className="bg-amber-100 dark:bg-amber-800/50 px-1 rounded">./run-migrations.sh</code> (Mac/Linux)</li>
          <li>Refresh the page when complete</li>
        </ol>
      </CardContent>
      {onRetry && (
        <CardFooter>
          <Button 
            variant="outline" 
            className="border-amber-300 bg-amber-100 hover:bg-amber-200 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
            onClick={onRetry}
          >
            Retry Now
          </Button>
        </CardFooter>
      )}
    </Card>
  );
} 