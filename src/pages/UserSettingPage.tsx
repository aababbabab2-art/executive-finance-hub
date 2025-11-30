import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UserPlus } from "lucide-react";

const API_BASE_URL = "https://vexacreative.net/projekmagank/accurate-integration-project/Api";

export function UserSettingPage() {
    const { toast } = useToast();
    const [formData, setFormData] = useState({ username: "", password: "", name: "", role: "user" });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(`${API_BASE_URL}/Register/AuthRegister.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const json = await res.json();

            if (json.s) {
                toast({ title: "Sukses", description: "User baru berhasil ditambahkan", className: "bg-green-600 text-white" });
                setFormData({ username: "", password: "", name: "", role: "user" }); // Reset form
            } else {
                toast({ title: "Gagal", description: json.message, variant: "destructive" });
            }
        } catch (error) {
            toast({ title: "Error", description: "Koneksi gagal", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background py-8 px-4">
            <div className="mx-auto max-w-2xl">
                <Card className="shadow-lg border-border">
                    
                    {/* Updated Card Header with Gradient Theme */}
                    <div className="card-header-gradient">
                        <CardTitle className="flex items-center gap-2 text-xl text-primary-foreground font-bold">
                            <UserPlus className="h-5 w-5" /> Manajemen User
                        </CardTitle>
                    </div>
                    
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-foreground">Nama Lengkap</Label>
                                    <Input 
                                        value={formData.name} 
                                        onChange={e => setFormData({...formData, name: e.target.value})} 
                                        placeholder="Nama Karyawan" 
                                        className="input-floating"
                                        required 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-foreground">Role</Label>
                                    <Select onValueChange={(val) => setFormData({...formData, role: val})} defaultValue={formData.role}>
                                        <SelectTrigger className="input-floating">
                                            <SelectValue placeholder="Pilih Role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="user">User / Staff</SelectItem>
                                            <SelectItem value="admin">Administrator</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <Label className="text-foreground">Username</Label>
                                <Input 
                                    value={formData.username} 
                                    onChange={e => setFormData({...formData, username: e.target.value})} 
                                    placeholder="Username untuk login" 
                                    className="input-floating"
                                    required 
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <Label className="text-foreground">Password</Label>
                                <Input 
                                    type="password" 
                                    value={formData.password} 
                                    onChange={e => setFormData({...formData, password: e.target.value})} 
                                    placeholder="Password" 
                                    className="input-floating"
                                    required 
                                />
                            </div>

                            <Button type="submit" className="w-full btn-gradient min-h-[40px]" disabled={loading}>
                                {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <UserPlus className="h-4 w-4 mr-2"/>}
                                {loading ? "PROCESSING..." : "TAMBAH USER"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}