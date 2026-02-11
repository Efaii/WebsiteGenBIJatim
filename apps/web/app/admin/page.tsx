'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/Button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/Card";
import Link from 'next/link';
import Image from 'next/image';
import { ScaleIn } from "@/components/MotionWrapper";

export default function AdminPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Mock login logic
        if (email === 'admin@genbijatim.id' && password === 'admin') {
            alert("Login Berhasil! (Mock)");
            // In a real app, you'd redirect to /admin/dashboard
        } else {
            alert("Email atau password salah. (Gunakan admin@genbijatim.id / admin)");
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-blue-900 px-4 relative overflow-hidden">
            {/* Background Orbs */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

            <ScaleIn className="w-full max-w-md relative z-10">
                <Card className="w-full shadow-2xl border-white/10 bg-white/5 backdrop-blur-xl transition-all duration-500 hover:shadow-cyan-500/10">
                    <CardHeader className="space-y-2 text-center pb-6 border-b border-white/10 bg-white/5">
                        <div className="mx-auto mb-4 flex justify-center">
                            <Image
                                src="/assets/logos/genbiJatim.svg"
                                alt="GenBI Jatim Logo"
                                width={140}
                                height={50}
                                className="h-12 w-auto object-contain brightness-0 invert drop-shadow-md"
                            />
                        </div>
                        <CardTitle className="text-2xl font-bold text-white">Admin Portal</CardTitle>
                        <p className="text-sm text-blue-200/60 font-medium">Masuk untuk mengelola data GenBI Jatim</p>
                    </CardHeader>
                    <CardContent className="pt-8">
                        <form onSubmit={handleLogin} className="space-y-5">
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-semibold text-blue-100 ml-1">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="admin@genbijatim.id"
                                    className="flex h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-cyan-400/50 transition-all font-medium"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between ml-1">
                                    <label htmlFor="password" className="text-sm font-semibold text-blue-100">
                                        Password
                                    </label>
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    className="flex h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-cyan-400/50 transition-all font-medium"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full h-12 text-base font-bold bg-white/10 hover:bg-white/20 border border-white/20 text-white shadow-lg shadow-cyan-500/10 backdrop-blur-md transition-all">
                                Masuk Dashboard
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="justify-center border-t border-white/10 pt-5 bg-white/5 rounded-b-2xl">
                        <p className="text-sm text-blue-200/60">
                            Kembali ke <Link href="/" className="text-cyan-200 font-bold hover:text-white hover:underline decoration-2 underline-offset-4 transition-colors">Beranda</Link>
                        </p>
                    </CardFooter>
                </Card>
            </ScaleIn>
        </div>
    );
}
