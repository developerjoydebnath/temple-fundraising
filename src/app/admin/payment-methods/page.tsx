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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import api from '@/lib/api';
import { CreditCard, Edit, Loader2, Plus, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import useSWR from 'swr';

interface IPaymentMethod {
  _id: string;
  name: string;
  accountNumber: string;
  type: string;
  isActive: boolean;
}

const fetcher = (url: string) => api.get(url).then((res) => res.data);

export default function PaymentMethodsPage() {
  const { data: methods, mutate, isLoading } = useSWR<IPaymentMethod[]>('/admin/payment-methods', fetcher);
  const { data: user } = useSWR('/auth/me', fetcher);
  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<IPaymentMethod | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    accountNumber: '',
    type: 'Mobile Banking',
    isActive: true,
  });

  const handleOpenDialog = (method: IPaymentMethod | null = null) => {
    if (method) {
      setEditingMethod(method);
      setFormData({
        name: method.name,
        accountNumber: method.accountNumber,
        type: method.type,
        isActive: method.isActive,
      });
    } else {
      setEditingMethod(null);
      setFormData({
        name: '',
        accountNumber: '',
        type: 'Mobile Banking',
        isActive: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingMethod) {
        await api.put(`/admin/payment-methods/${editingMethod._id}`, formData);
        toast.success('Payment method updated');
      } else {
        await api.post('/admin/payment-methods', formData);
        toast.success('Payment method added');
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
      await api.delete(`/admin/payment-methods/${id}`);
      toast.success('Payment method deleted');
      mutate();
    } catch (error: any) {
      toast.error(error.message || 'Delete failed');
    }
  };

  const toggleStatus = async (method: IPaymentMethod) => {
    try {
      await api.put(`/admin/payment-methods/${method._id}`, {
        ...method,
        isActive: !method.isActive,
      });
      toast.success(`Method ${!method.isActive ? 'activated' : 'deactivated'}`);
      mutate();
    } catch {
      toast.error('Failed to change status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Payment Methods</h2>
          <p className="text-slate-500">Manage payment options shown on the landing page</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-600 hover:bg-orange-700" onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" /> Add Method
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingMethod ? 'Edit Payment Method' : 'Add New Payment Method'}</DialogTitle>
                <DialogDescription>
                  Enter the details for the payment method. Only active methods appear on the landing page.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name (e.g., Bkash, Dutch Bangla Bank)</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="accountNumber">Account/Card Number</Label>
                  <Input
                    id="accountNumber"
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mobile Banking">Mobile Banking</SelectItem>
                      <SelectItem value="Bank">Bank</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="bg-orange-600" disabled={submitting}>
                  {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save Changes'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-none shadow-sm py-0">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50">
                <TableHead>Method Name</TableHead>
                <TableHead>Account Number</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
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
              ) : methods && methods.length > 0 ? (
                methods.map((method: IPaymentMethod) => (
                  <TableRow key={method._id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="font-medium flex items-center gap-3">
                      <div className="h-8 w-8 rounded bg-orange-100 flex items-center justify-center text-orange-600">
                        <CreditCard className="h-4 w-4" />
                      </div>
                      {method.name}
                    </TableCell>
                    <TableCell className="font-mono text-slate-600">{method.accountNumber}</TableCell>
                    <TableCell>
                      <span className="text-xs px-2 py-1 rounded bg-slate-100 text-slate-600 uppercase tracking-tight">
                        {method.type}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={method.isActive}
                          onCheckedChange={() => toggleStatus(method)}
                          disabled={!isAdmin}
                        />
                        <span className={`text-xs ${method.isActive ? 'text-green-600' : 'text-slate-400'}`}>
                          {method.isActive ? 'Active' : 'Hidden'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(method)}
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
                                  This will permanently delete this payment method. It will no longer be available for recording donations.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDelete(method._id)}
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
                    No payment methods found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
