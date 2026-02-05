'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, Edit, HandCoins, Loader2, Plus, Search, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import useSWR from 'swr';

interface IDonation {
  _id: string;
  donorId: {
    _id: string;
    name: string;
    phone: string;
  } | any;
  amount: number;
  paymentMethodId: {
    _id: string;
    name: string;
  } | any;
  date: string;
  transactionId?: string;
  notes?: string;
}

const fetcher = (url: string) => api.get(url).then((res) => res.data);

export default function DonationsPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, mutate, isLoading } = useSWR<{ donations: IDonation[], pagination: any }>(`/admin/donations?search=${debouncedSearch}&page=${page}`, fetcher);
  const { data: user } = useSWR('/auth/me', fetcher);
  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';
  const { data: donors } = useSWR('/admin/donors/all', fetcher);
  const { data: methods } = useSWR('/admin/payment-methods', fetcher);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDonation, setEditingDonation] = useState<IDonation | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    donorId: '',
    amount: '',
    paymentMethodId: '',
    date: new Date(),
    transactionId: '',
    notes: '',
  });

  const handleOpenDialog = (donation: IDonation | null = null) => {
    if (donation) {
      setEditingDonation(donation);
      setFormData({
        donorId: donation.donorId?._id || donation.donorId,
        amount: donation.amount.toString(),
        paymentMethodId: donation.paymentMethodId?._id || donation.paymentMethodId,
        date: new Date(donation.date),
        transactionId: donation.transactionId || '',
        notes: donation.notes || '',
      });
    } else {
      setEditingDonation(null);
      setFormData({
        donorId: '',
        amount: '',
        paymentMethodId: '',
        date: new Date(),
        transactionId: '',
        notes: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingDonation) {
        await api.put(`/admin/donations/${editingDonation._id}`, formData);
        toast.success('Donation updated');
      } else {
        await api.post('/admin/donations', formData);
        toast.success('Donation recorded');
      }
      mutate();
      setIsDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/admin/donations/${id}`);
      toast.success('Donation deleted');
      mutate();
    } catch (error: any) {
      toast.error(error.message || 'Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Donations</h2>
          <p className="text-slate-500">Track and manage all temple contributions</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search donations..."
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-orange-600 hover:bg-orange-700" onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" /> Add Donation
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>{editingDonation ? 'Edit Donation' : 'Record New Donation'}</DialogTitle>
                  <DialogDescription>
                    Fill in the donation details below. All fields are tracked for history.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="donor">Donor</Label>
                    <Select
                      value={formData.donorId}
                      onValueChange={(value) => setFormData({ ...formData, donorId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select donor" />
                      </SelectTrigger>
                      <SelectContent>
                        {donors?.map((donor: any) => (
                          <SelectItem key={donor._id} value={donor._id}>{donor.name} ({donor.phone})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="amount">Amount (৳)</Label>
                      <Input
                        id="amount"
                        type="number"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        placeholder="500"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !formData.date && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.date ? format(formData.date, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={formData.date}
                            onSelect={(date) => date && setFormData({ ...formData, date })}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="method">Payment Method</Label>
                    <Select
                      value={formData.paymentMethodId}
                      onValueChange={(value) => setFormData({ ...formData, paymentMethodId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        {methods?.map((method: any) => (
                          <SelectItem key={method._id} value={method._id}>{method.name} ({method.accountNumber})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="transactionId">Transaction ID / Reference (Optional)</Label>
                    <Input
                      id="transactionId"
                      value={formData.transactionId}
                      onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                      placeholder="TRX12345678"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" className="bg-orange-600" disabled={submitting}>
                    {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save Donation'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="border-none shadow-sm py-0">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50">
                <TableHead>Date</TableHead>
                <TableHead>Donor</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-10 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-10 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-10 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-10 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-10 w-full" /></TableCell>
                  </TableRow>
                ))
              ) : data && data.donations.length > 0 ? (
                data.donations.map((donation: any) => (
                  <TableRow key={donation._id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="text-slate-500 text-sm">
                      {format(new Date(donation.date), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                          <HandCoins className="h-4 w-4" />
                        </div>
                        <div className="font-semibold text-slate-900">{donation.donorId?.name || 'Unknown'}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-slate-900">৳{donation.amount}</TableCell>
                    <TableCell>
                      <span className="text-xs px-2 py-1 rounded bg-slate-100 text-slate-600">
                        {donation.paymentMethodId?.name || 'Manual'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(donation)}
                          className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {isAdmin && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete this donation record. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDelete(donation._id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-slate-500">
                    No donations found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {data && data.pagination.pages > 1 && (
        <div className="mt-4 flex justify-center">
            <Pagination>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious 
                           href="#" 
                           onClick={(e) => { e.preventDefault(); if (page > 1) setPage(page - 1); }}
                           className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                    </PaginationItem>
                    {Array.from({ length: data.pagination.pages }).map((_, i) => (
                        <PaginationItem key={i}>
                            <PaginationLink
                               isActive={page === i + 1}
                               onClick={(e) => { e.preventDefault(); setPage(i + 1); }}
                               className="cursor-pointer"
                            >
                                {i + 1}
                            </PaginationLink>
                        </PaginationItem>
                    ))}
                    <PaginationItem>
                        <PaginationNext 
                           href="#" 
                           onClick={(e) => { e.preventDefault(); if (page < (data?.pagination?.pages || 0)) setPage(page + 1); }}
                           className={page === data.pagination.pages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
      )}
    </div>
  );
}
