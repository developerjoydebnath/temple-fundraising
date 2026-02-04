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
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
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
import { Briefcase, Edit, Loader2, Plus, Search, Trash2, User } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import useSWR from 'swr';

interface IDonor {
  _id: string;
  name: string;
  email?: string;
  phone: string;
  address?: string;
  occupation?: string;
  totalDonation: number;
}

interface DonorsResponse {
  donors: IDonor[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

const fetcher = (url: string) => api.get(url).then((res) => res.data);

export default function DonorsPage() {
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

  const { data, mutate, isLoading } = useSWR<DonorsResponse>(`/admin/donors?search=${debouncedSearch}&page=${page}`, fetcher);
  const { data: user } = useSWR('/auth/me', fetcher);
  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDonor, setEditingDonor] = useState<IDonor | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    occupation: '',
  });

  const handleOpenDialog = (donor: IDonor | null = null) => {
    if (donor) {
      setEditingDonor(donor);
      setFormData({
        name: donor.name,
        email: donor.email || '',
        phone: donor.phone,
        address: donor.address || '',
        occupation: donor.occupation || '',
      });
    } else {
      setEditingDonor(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        occupation: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingDonor) {
        await api.put(`/admin/donors/${editingDonor._id}`, formData);
        toast.success('Donor updated');
      } else {
        await api.post('/admin/donors', formData);
        toast.success('Donor added');
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
      await api.delete(`/admin/donors/${id}`);
      toast.success('Donor deleted');
      mutate();
    } catch (error: any) {
      toast.error(error.message || 'Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Donors</h2>
          <p className="text-slate-500">Manage your community of donors</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by name, phone..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-orange-600 hover:bg-orange-700" onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" /> Add Donor
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>{editingDonor ? 'Edit Donor' : 'Add New Donor'}</DialogTitle>
                  <DialogDescription>
                    Enter the donor&apos;s contact information. Phone number must be unique.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email (Optional)</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="address">Address (Optional)</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="occupation">Occupation (Optional)</Label>
                    <Input
                      id="occupation"
                      placeholder="e.g. Teacher, Engineer"
                      value={formData.occupation}
                      onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" className="bg-orange-600" disabled={submitting}>
                    {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save Donor'}
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
                <TableHead>Donor Info</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Occupation</TableHead>
                <TableHead>Total Donation</TableHead>
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
              ) : data?.donors && data.donors.length > 0 ? (
                data.donors.map((donor) => (
                  <TableRow key={donor._id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                          <User className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{donor.name}</p>
                          <p className="text-xs text-slate-500">{donor.email || 'No email'}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600">{donor.phone}</TableCell>
                    <TableCell className="text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                        {donor.occupation || '-'}
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-slate-900 text-lg">৳ {donor.totalDonation.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(donor)}
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
                                  This action cannot be undone. This will permanently delete the donor
                                  and all their donation records.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDelete(donor._id)}
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
                    No donors found matching your search.
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
                               href="#" 
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
