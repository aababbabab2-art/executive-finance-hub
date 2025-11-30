import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Loader2, Lock, ArrowRight, TrendingUp, Layers } from "lucide-react";
import { cn } from "@/lib/utils"; // Import cn untuk styling konsisten

const API_BASE_URL = "https://vexacreative.net/projekmagank/accurate-integration-project/Api";

export function LoginPage() {
    const { toast } = useToast();
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(`${API_BASE_URL}/Login/Auth.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const json = await res.json();

            if (json.s) {
                // Simpan sesi ke LocalStorage
                localStorage.setItem("acc_user", JSON.stringify(json.d));
                localStorage.setItem("acc_token", "logged_in"); // Simple flag
                
                toast({ title: "Login Berhasil", description: `Selamat datang, ${json.d.name}`, className: "bg-green-600 text-white" });
                navigate("/"); // Redirect ke Dashboard
            } else {
                toast({ title: "Login Gagal", description: json.message, variant: "destructive" });
            }
        } catch (error) {
            toast({ title: "Error", description: "Gagal terhubung ke server", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background">
            
            {/* Kolom Kiri: Login Form (Visible on all screens) */}
            <div className="flex items-center justify-center p-8 lg:p-12 order-2 lg:order-1">
                <Card className="w-full max-w-md shadow-2xl border-none">
                    <CardHeader className="text-center pb-6">
                        <div className="mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-4 bg-primary/10">
                            <Lock className="h-7 w-7 text-primary" />
                        </div>
                        <CardTitle className="text-3xl font-extrabold text-foreground tracking-tight">
                            Masuk ke Sistem
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Integrasi Akuntansi & Manajemen
                        </p>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="username">Username</Label>
                                <div className="relative">
                                    <Input 
                                        id="username"
                                        type="text" 
                                        placeholder="Masukkan username" 
                                        value={username} 
                                        onChange={(e) => setUsername(e.target.value)} 
                                        className="input-floating"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Input 
                                        id="password"
                                        type="password" 
                                        placeholder="Masukkan password" 
                                        value={password} 
                                        onChange={(e) => setPassword(e.target.value)} 
                                        className="input-floating"
                                        required
                                    />
                                </div>
                            </div>
                            <Button 
                                type="submit" 
                                className="w-full btn-gradient min-h-[44px] text-lg font-bold" 
                                disabled={loading}
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin mr-2 h-5 w-5" />
                                ) : (
                                    <ArrowRight className="mr-2 h-5 w-5" />
                                )}
                                {loading ? "Memproses..." : "LOGIN"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>

            {/* Kolom Kanan: Visual & Informasi (Background Gradient) */}
            <div className="hidden lg:flex items-center justify-center p-12 order-1 bg-primary/10 gradient-maroon shadow-inner">
                <div className="text-center text-primary-foreground space-y-6 max-w-lg">
                    <h2 className="text-4xl font-extrabold tracking-wide drop-shadow-md">
                        Sistem Integrasi Akurat
                    </h2>
                    <p className="text-lg opacity-90 leading-relaxed">
                        Akses ke Dashboard Eksekutif, Transaksi Harian, dan Laporan Keuangan real-time.
                    </p>
                    <div className="grid grid-cols-3 gap-6 pt-4">
                        <div className="p-4 bg-primary/70 rounded-xl shadow-lg border border-primary/50">
                            <TrendingUp className="w-8 h-8 mx-auto mb-2" />
                            <p className="font-semibold">Laba Rugi</p>
                        </div>
                        <div className="p-4 bg-primary/70 rounded-xl shadow-lg border border-primary/50">
                            <Layers className="w-8 h-8 mx-auto mb-2" />
                            <p className="font-semibold">Manajemen Proyek</p>
                        </div>
                        <div className="p-4 bg-primary/70 rounded-xl shadow-lg border border-primary/50">
                            <Lock className="w-8 h-8 mx-auto mb-2" />
                            <p className="font-semibold">Keamanan Data</p>
                        </div>
                    </div>
                </div>
            </div>
            
        </div>
    );
}