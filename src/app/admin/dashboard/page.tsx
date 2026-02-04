'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import api from '@/lib/api';
import {
  ArrowUpRight,
  Clock,
  DollarSign,
  TrendingUp,
  Trophy,
  Users
} from 'lucide-react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import useSWR from 'swr';

const fetcher = (url: string) => api.get(url).then((res) => res.data);

export default function DashboardPage() {
  const { data, error, isLoading } = useSWR('/admin/dashboard', fetcher);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    );
  }

  const { stats, recentDonations, chartData } = data;

  return (
    <div className="space-y-8 pb-10">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Funds Collected</CardTitle>
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
              <DollarSign className="h-6 w-6" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">৳ {stats.totalFunds.toLocaleString()}</div>
            <p className="text-xs text-slate-500 mt-1 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" /> +12.5% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Donors</CardTitle>
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <Users className="h-6 w-6" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.totalDonors}</div>
            <p className="text-xs text-slate-500 mt-1 flex items-center">
              <ArrowUpRight className="h-3 w-3 mr-1 text-blue-500" /> 8 new this week
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Best Donor</CardTitle>
            <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
              <Trophy className="h-6 w-6" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-slate-900 truncate">
               {stats.bestDonor ? stats.bestDonor.name : 'N/A'}
            </div>
            <p className="text-xs text-slate-500 mt-1">
               {stats.bestDonor ? `৳ ${stats.bestDonor.totalDonation.toLocaleString()} total` : 'No donations yet'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Monthly Donation Chart */}
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Donation Overview</CardTitle>
            <CardDescription>Monthly contribution trends for the last 12 months</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    tickFormatter={(value) => `৳${value}`}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#ea580c" 
                    strokeWidth={3} 
                    dot={{ fill: '#ea580c', r: 4 }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">
                No data available to display chart
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Donations */}
        <Card className="border-none shadow-sm py-0">
          <CardHeader>
            <CardTitle className="text-lg">Recent Donations</CardTitle>
            <CardDescription>Latest contributions received</CardDescription>
          </CardHeader>
          <CardContent className="px-0">
             {recentDonations.length > 0 ? (
               <div className="divide-y divide-slate-100">
                  {recentDonations.map((donation: any) => (
                    <div key={donation._id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                          <Clock className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{donation.donorId.name}</p>
                          <p className="text-xs text-slate-500">{new Date(donation.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-sm font-bold text-slate-900">
                        ৳ {donation.amount.toLocaleString()}
                      </div>
                    </div>
                  ))}
               </div>
             ) : (
               <div className="px-6 py-10 text-center text-slate-400">
                 No recent donations found
               </div>
             )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
