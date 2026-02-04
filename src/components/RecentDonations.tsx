'use client'

import axios from "axios";
import { format } from "date-fns";
import { Calendar, Coins, User } from "lucide-react";
import useSWR from "swr";

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export default function RecentDonations() {
    const { data: donations, isLoading } = useSWR('/api/public/donations', fetcher);
    
    if (isLoading) {
        return (
            <section className="py-20 bg-slate-50">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="h-8 w-48 bg-slate-200 animate-pulse rounded mb-8" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="h-32 bg-slate-200 animate-pulse rounded-3xl" />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (!donations || donations.length === 0) return null;

    return (
        <section className="py-20 bg-slate-50">
            <div className="max-w-6xl mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Recent Contributions</h2>
                    <p className="text-slate-600">Heartfelt thanks to our latest donors supporting the temple vision.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {donations.map((item: any) => (
                        <div 
                            key={item._id} 
                            className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow flex flex-col justify-between group"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                                        <User className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 leading-tight">{item.donorName}</p>
                                        <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                                            <Calendar className="h-3 w-3" />
                                            {format(new Date(item.date), 'MMM d, yyyy')}
                                        </div>
                                    </div>
                                </div>
                                <div className="h-8 w-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
                                    <Coins className="h-4 w-4" />
                                </div>
                            </div>
                            <div className="pt-2 border-t border-slate-50 flex justify-between items-center">
                                <span className="text-sm text-slate-500 font-medium">Contributed</span>
                                <span className="text-2xl font-black text-orange-600 tracking-tight">৳{item.amount.toLocaleString()}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
