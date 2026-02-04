'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import api from '@/lib/api';
import { format } from 'date-fns';
import { Clock, Info, Search, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import useSWR from 'swr';

interface IActivityLog {
  _id: string;
  adminId: {
    _id: string;
    name: string;
  };
  action: string;
  target: string;
  details: string;
  timestamp: string;
}

interface HistoryResponse {
  logs: IActivityLog[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

const fetcher = (url: string) => api.get(url).then((res) => res.data);

export default function HistoryPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const { data: user } = useSWR('/auth/me', fetcher);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading } = useSWR<HistoryResponse>(`/admin/activity-logs?search=${debouncedSearch}&page=${page}`, fetcher);

  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';

  if (!isLoading && !isAdmin && user) {
    return <p className="text-center text-lg text-red-500 mt-10">You are not authorized to view this page.</p>;
  }

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create': return 'bg-green-100 text-green-700 border-green-200';
      case 'update': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'delete': return 'bg-red-100 text-red-700 border-red-200';
      case 'login': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'logout': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Activity History</h2>
          <p className="text-slate-500">Audit trail of all administrator actions</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search logs..."
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card className="border-none shadow-sm py-0">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50">
                <TableHead>Time</TableHead>
                <TableHead>Admin</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-10 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-10 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-10 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-10 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-10 w-full" /></TableCell>
                  </TableRow>
                ))
              ) : data?.logs && data.logs.length > 0 ? (
                data.logs.map((log) => (
                  <TableRow key={log._id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="text-slate-500 text-sm whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {format(new Date(log.timestamp), 'MMM d, HH:mm:ss')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center">
                          <User className="h-4 w-4 text-slate-600" />
                        </div>
                        <span className="font-medium text-slate-900">{log.adminId?.name || 'System'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getActionColor(log.action)}>
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium text-slate-700">{log.target}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-slate-600 max-w-[300px] truncate" title={log.details}>
                        <Info className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        {log.details}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-slate-500">
                    No activity logs found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination Simple */}
      {data?.pagination && data.pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
           <Button 
             variant="outline" 
             size="sm" 
             onClick={() => setPage(p => Math.max(1, p - 1))}
             disabled={page === 1}
           >
             Previous
           </Button>
           <div className="flex items-center px-4 text-sm font-medium">
             Page {data.pagination.page} of {data.pagination.pages}
           </div>
           <Button 
             variant="outline" 
             size="sm" 
             onClick={() => setPage(p => Math.min(data.pagination.pages, p + 1))}
             disabled={page === data.pagination.pages}
           >
             Next
           </Button>
        </div>
      )}
    </div>
  );
}
