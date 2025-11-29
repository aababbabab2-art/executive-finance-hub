import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Loader2, Lock } from "lucide-react";

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
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <Card className="w-full max-w-md shadow-lg border-t-4 border-t-red-800">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-red-100 w-12 h-12 rounded-full flex items-center justify-center mb-2">
                        <Lock className="h-6 w-6 text-red-800" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-800">Accurate System</CardTitle>
                    <p className="text-sm text-gray-500">Silahkan login untuk melanjutkan</p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Username</Label>
                            <Input 
                                type="text" 
                                placeholder="Masukkan username" 
                                value={username} 
                                onChange={(e) => setUsername(e.target.value)} 
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Password</Label>
                            <Input 
                                type="password" 
                                placeholder="Masukkan password" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                            />
                        </div>
                        <Button type="submit" className="w-full bg-red-800 hover:bg-red-900" disabled={loading}>
                            {loading ? <Loader2 className="animate-spin mr-2" /> : "LOGIN"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}