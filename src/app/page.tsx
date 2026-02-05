'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import axios from 'axios';
import { Code, ExternalLink, Facebook, MessageCircle, RefreshCcw, Sparkles, Phone as WhatsApp } from 'lucide-react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import useSWR from 'swr';

const RecentDonations = dynamic(() => import('@/components/RecentDonations'), {
  loading: () => <div className="flex items-center justify-center h-screen"><RefreshCcw className="animate-spin" /></div>,
  ssr: false,
});

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export default function LandingPage() {
  const { data: methods, error, isLoading } = useSWR('/api/payment-methods', fetcher);

  const scrollToDonation = () => {
    document.getElementById('donations')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Hero Section */}
      <section className="relative h-[100vh] flex items-center justify-center overflow-hidden">
        <Image
          src="/hero.png"
          alt="Hindu Temple Hero"
          fill
          className="object-cover brightness-50"
          priority
        />
        <div className="relative z-10 text-center text-white px-4 max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight drop-shadow-lg">
            Preserve Our Heritage: Help Us Build the New Temple
          </h1>
          <p className="text-lg md:text-xl mb-8 opacity-90 drop-shadow-md">
            Join our community in constructing a beautiful sanctuary of peace, spirituality, and culture in the heart of Bangladesh.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={scrollToDonation}
              className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-6 px-8 rounded-full shadow-xl transition-all hover:scale-105"
            >
              Donate Now
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-white/10 backdrop-blur-md border-white/30 text-white hover:bg-white/20 py-6 px-8 rounded-full shadow-xl"
              asChild
            >
              <Link prefetch={false} href="https://facebook.com/groups/shanto-fundraising" target="_blank" rel="noreferrer">
                <Facebook className="mr-2 h-5 w-5" />
                Facebook Group
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Corporate Sponsorship Banner */}
      <section className='px-6'>
      <div className="w-full max-w-7xl mx-auto mt-16 rounded-4xl py-12 relative overflow-hidden bg-slate-900 flex items-center">
        <div className="absolute inset-0 bg-linear-to-r from-blue-600/20 via-transparent to-purple-600/20 pointer-events-none" />
        <div className="max-w-7xl px-10 w-full relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex items-center justify-center shadow-2xl">
              <Code className="h-8 w-8 text-blue-400" />
            </div>
            <div className="text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
                <Sparkles className="h-3 w-3" />
                Official IT Partner
              </div>
              <h3 className="text-2xl md:text-2xl font-bold text-white tracking-tight">
                Crafted by <span className="text-blue-400">StackRover Agency</span>
              </h3>
              <p className="text-slate-400 text-sm hidden md:block">
                Technical excellence contributed for free to preserve our heritage.
              </p>
            </div>
          </div>
          
          <div className="flex flex-col items-center md:items-end gap-2">
            <p className="text-slate-300 text-xs font-medium mb-1">Need a professional digital solution?</p>
            <Button 
              size="lg" 
              className="bg-white text-slate-900 hover:bg-slate-100 font-bold rounded-xl px-8 transition-all hover:scale-105 shadow-lg h-12 cursor-pointer"
              asChild
            >
              <Link prefetch={false} href="https://stackrover.com" target="_blank" rel="noreferrer">
                Visit Agency
                <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
      </section>

      {/* Donation Methods Section */}
      <section id="donations" className="py-20 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Donation Methods</h2>
          <p className="text-slate-600">Choose your preferred method to contribute to the temple construction.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            [1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col space-y-3">
                <Skeleton className="h-[200px] w-full rounded-xl" />
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            ))
          ) : error ? (
            <div className="col-span-full text-center text-red-500">
              Failed to load donation methods. Please try again later.
            </div>
          ) : methods?.length > 0 ? (
            methods.map((method: any) => (
              <Card key={method._id} className="border-none shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1 overflow-hidden group pt-0">
                <div className={`h-12 w-full ${method.type === 'Bank' ? 'bg-blue-500' : 'bg-orange-500'}`} />
                <CardHeader>
                  <CardTitle className="flex justify-between items-center group-hover:text-orange-600 transition-colors">
                    {method.name}
                    <span className="text-xs font-normal bg-slate-100 px-2 py-1 rounded text-slate-500 uppercase tracking-wider">
                      {method.type}
                    </span>
                  </CardTitle>
                  <CardDescription>Official Fundraising Account</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex items-center justify-between">
                    <span className="text-xl font-mono font-bold text-slate-800 tracking-wider">
                      {method.accountNumber}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(method.accountNumber);
                        toast.success('Account number copied!');
                      }}
                      className="text-slate-400 hover:text-slate-900"
                    >
                      Copy
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center text-slate-500 py-10">
              No active donation methods found. Please contact admin.
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-slate-900 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-6">After donation, please confirm with admin</h2>
          <p className="text-xl text-slate-400 mb-10">
            To ensure your contribution is properly recorded, please send a message with your transaction details.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-7 px-10 w-full flex-1 rounded-2xl shadow-xl transition-all hover:scale-105"
              asChild
            >
              <Link prefetch={false} href="https://wa.me/8801234567890" target="_blank" rel="noreferrer">
                <WhatsApp className="h-6 w-6" />
                WhatsApp Us
              </Link>
            </Button>
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-7 px-10 w-full rounded-2xl shadow-xl transition-all flex-1 hover:scale-105"
              asChild
            >
              <Link prefetch={false} href="https://m.me/shanto" target="_blank" rel="noreferrer">
                <MessageCircle className="h-6 w-6" />
                Messenger
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Gallery Section - Normal Grid */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Temple Vision</h2>
            <p className="text-slate-600">A glimpse into the architectural majesty we are building together.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative group overflow-hidden rounded-3xl aspect-4/3">
              <Image src="/gallery/facade.png" alt="Main Facade" fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-8">
                <p className="text-white font-medium text-lg">Main Architectural Facade</p>
              </div>
            </div>
            <div className="relative group overflow-hidden rounded-3xl aspect-4/3">
              <Image src="/gallery/dome.png" alt="Interior Dome" fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <p className="text-white font-medium">Celestial Dome Details</p>
              </div>
            </div>
            <div className="relative group overflow-hidden rounded-3xl aspect-4/3">
              <Image src="/gallery/ritual.png" alt="Ritual Space" fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <p className="text-white font-medium">Sacred Offerings</p>
              </div>
            </div>
            <div className="relative group overflow-hidden rounded-3xl aspect-4/3">
              <Image src="/gallery/night.png" alt="Night View" fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                <p className="text-white font-medium text-lg">Illuminated Sanctuary</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Donations Section */}
      <RecentDonations />




      {/* Sponsorship Section */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 border border-slate-800 shadow-2xl group">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-blue-500/20 transition-colors duration-700" />
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-purple-500/20 transition-colors duration-700" />
            
            <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center gap-10">
              <div className="flex-1 space-y-6 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-blue-400 text-sm font-medium">
                  <Sparkles className="h-4 w-4" />
                  Official IT Partner
                </div>
                
                <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                  Powered by <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-purple-400">StackRover Agency</span>
                </h2>
                
                <p className="text-slate-400 text-lg leading-relaxed">
                  StackRover Agency built this platform with devotion, contributing their technical excellence for free to support our sacred mission.
                </p>
                
                <p className="text-slate-300 font-medium">
                  Need IT support or a digital solution? Our partners are ready to help you or your network with state-of-the-art tech.
                </p>
                
                <div className="pt-4 flex flex-wrap gap-4 justify-center md:justify-start">
                  <Button 
                    size="lg" 
                    className="bg-white text-slate-900 hover:bg-slate-100 font-bold rounded-2xl px-8 h-14 group/btn transition-all cursor-pointer"
                    asChild
                  >
                    <Link prefetch={false} href="https://stackrover.com" target="_blank" rel="noreferrer">
                      Visit Agency
                      <ExternalLink className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                    </Link>
                  </Button>
                </div>
              </div>
              
              <div className="relative w-48 h-48 md:w-64 md:h-64 flex items-center justify-center">
                 <div className="absolute inset-0 bg-linear-to-br from-blue-500/20 to-purple-500/20 rounded-3xl rotate-6 animate-pulse" />
                 <div className="absolute inset-0 bg-slate-800 rounded-3xl border border-white/10 flex flex-col items-center justify-center p-6 text-center shadow-2xl">
                    <div className="w-16 h-16 bg-linear-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg ring-4 ring-white/5">
                      <Code className="h-8 w-8 text-white" />
                    </div>
                    <div className="text-white font-bold text-xl mb-1 tracking-tight">StackRover</div>
                    <div className="text-slate-400 text-[10px] uppercase tracking-[0.2em] font-bold">IT Solutions</div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-10 border-t border-slate-200 text-center text-slate-500">
          <p>© {new Date().getFullYear()} Hindu Temple Fundraising Bangladesh. All rights reserved.</p>
      </footer>
    </div>
  );
}
