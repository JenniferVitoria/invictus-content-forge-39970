import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Camera, Loader2, User, Mail, Lock, Save } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Profile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState({
    displayName: "",
    email: "",
    avatarUrl: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      setUser(user);
      setProfile(prev => ({ ...prev, email: user.email || "" }));

      const { data: profileData } = await supabase
        .from("user_profiles")
        .select("display_name, avatar_url")
        .eq("user_id", user.id)
        .single();

      if (profileData) {
        setProfile(prev => ({
          ...prev,
          displayName: profileData.display_name || "",
          avatarUrl: profileData.avatar_url || "",
        }));
      }
    } catch (error) {
      console.error("Erro ao buscar perfil:", error);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo e tamanho
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione uma imagem");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 2MB");
      return;
    }

    setUploading(true);
    try {
      // Converter para base64 e salvar no perfil
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        
        const { error } = await supabase
          .from("user_profiles")
          .update({ avatar_url: base64 })
          .eq("user_id", user.id);

        if (error) throw error;

        setProfile(prev => ({ ...prev, avatarUrl: base64 }));
        toast.success("Foto de perfil atualizada!");
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      toast.error("Erro ao atualizar foto de perfil");
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!profile.displayName.trim()) {
      toast.error("O nome não pode estar vazio");
      return;
    }

    setLoading(true);
    try {
      // Atualizar nome
      const { error: profileError } = await supabase
        .from("user_profiles")
        .update({ display_name: profile.displayName })
        .eq("user_id", user.id);

      if (profileError) throw profileError;

      // Atualizar email se mudou
      if (profile.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: profile.email,
        });

        if (emailError) throw emailError;
        toast.success("Email atualizado! Verifique seu novo email para confirmar.");
      }

      toast.success("Perfil atualizado com sucesso!");
    } catch (error: any) {
      console.error("Erro ao atualizar perfil:", error);
      toast.error(error.message || "Erro ao atualizar perfil");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error("Preencha todos os campos de senha");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });

      if (error) throw error;

      toast.success("Senha alterada com sucesso!");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      console.error("Erro ao alterar senha:", error);
      toast.error(error.message || "Erro ao alterar senha");
    } finally {
      setLoading(false);
    }
  };

  const getInitials = () => {
    if (profile.displayName) {
      return profile.displayName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    }
    return profile.email?.[0]?.toUpperCase() || "U";
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="fixed inset-0 bg-gradient-mesh opacity-30 pointer-events-none" />
      
      <div className="container max-w-4xl mx-auto px-4 py-8 relative z-10">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-6 hover:text-primary"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar ao Dashboard
        </Button>

        <div className="space-y-6">
          {/* Avatar Section */}
          <Card className="glass-effect border-2 border-border/50 hover-lift relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-secondary" />
            
            <CardHeader className="border-b border-border/50 bg-gradient-card">
              <CardTitle className="text-2xl font-display flex items-center gap-3">
                <User className="w-6 h-6 text-primary" />
                Meu Perfil
              </CardTitle>
              <CardDescription>Gerencie suas informações pessoais</CardDescription>
            </CardHeader>
            
            <CardContent className="p-8">
              <div className="flex flex-col items-center mb-8">
                <div className="relative group">
                  <Avatar className="w-32 h-32 border-4 border-primary/20 shadow-glow">
                    <AvatarImage src={profile.avatarUrl} alt={profile.displayName} />
                    <AvatarFallback className="text-3xl font-bold bg-gradient-primary text-white">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    onClick={handleAvatarClick}
                    disabled={uploading}
                    className="absolute bottom-0 right-0 w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center shadow-glow hover:scale-110 transition-transform cursor-pointer"
                  >
                    {uploading ? (
                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                    ) : (
                      <Camera className="w-5 h-5 text-white" />
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  Clique no ícone para alterar a foto
                </p>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="displayName" className="text-base font-semibold flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" />
                    Nome de Usuário
                  </Label>
                  <Input
                    id="displayName"
                    value={profile.displayName}
                    onChange={(e) => setProfile(prev => ({ ...prev, displayName: e.target.value }))}
                    placeholder="Seu nome"
                    className="h-12 text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-base font-semibold flex items-center gap-2">
                    <Mail className="w-4 h-4 text-primary" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="seu@email.com"
                    className="h-12 text-base"
                  />
                </div>

                <Button
                  onClick={handleUpdateProfile}
                  disabled={loading}
                  className="w-full h-12 bg-gradient-primary hover:opacity-90 shadow-glow text-white font-bold"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Password Section */}
          <Card className="glass-effect border-2 border-border/50 hover-lift relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secondary via-primary to-accent" />
            
            <CardHeader className="border-b border-border/50 bg-gradient-card">
              <CardTitle className="text-2xl font-display flex items-center gap-3">
                <Lock className="w-6 h-6 text-secondary" />
                Alterar Senha
              </CardTitle>
              <CardDescription>Mantenha sua conta segura</CardDescription>
            </CardHeader>
            
            <CardContent className="p-8">
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-base font-semibold">Nova Senha</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="••••••"
                    className="h-12 text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-base font-semibold">Confirmar Nova Senha</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="••••••"
                    className="h-12 text-base"
                  />
                </div>

                <Button
                  onClick={handleChangePassword}
                  disabled={loading}
                  className="w-full h-12 bg-gradient-secondary hover:opacity-90 text-white shadow-glow-secondary font-bold"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Alterando...
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5 mr-2" />
                      Alterar Senha
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;