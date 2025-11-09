import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Download, Globe, Loader2, CheckCircle2, AlertCircle, Zap, Shield, Server } from "lucide-react";

const ConnectSite = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [connectedSites, setConnectedSites] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    siteName: "",
    siteUrl: "",
    domain: "",
  });

  useEffect(() => {
    fetchConnectedSites();
  }, []);

  const fetchConnectedSites = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("wordpress_sites")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;
      setConnectedSites(data || []);
    } catch (error) {
      console.error("Erro ao buscar sites:", error);
    }
  };

  const handleDownloadPlugin = () => {
    // Criar o conteúdo do plugin
    const pluginContent = generatePluginCode();
    const blob = new Blob([pluginContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "invictus-automatik.php";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Plugin baixado com sucesso!");
  };

  const generatePluginCode = () => {
    return `<?php
/**
 * Plugin Name: Invictus Automatik
 * Plugin URI: https://invictus-automatik.com
 * Description: Plugin de integração com a plataforma Invictus Automatik para criação automática de conteúdo WordPress
 * Version: 1.0.0
 * Author: Invictus Automatik
 * Author URI: https://invictus-automatik.com
 * License: GPL v2 or later
 * Text Domain: invictus-automatik
 */

if (!defined('ABSPATH')) {
    exit;
}

class Invictus_Automatik {
    private $api_key;
    
    public function __construct() {
        add_action('rest_api_init', array($this, 'register_routes'));
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_init', array($this, 'register_settings'));
        
        $this->api_key = get_option('invictus_api_key');
    }
    
    public function register_routes() {
        // Endpoint de status
        register_rest_route('invictus/v1', '/status', array(
            'methods' => 'GET',
            'callback' => array($this, 'check_status'),
            'permission_callback' => array($this, 'verify_api_key')
        ));
        
        // Endpoint para criar artigo
        register_rest_route('invictus/v1', '/create-article', array(
            'methods' => 'POST',
            'callback' => array($this, 'create_article'),
            'permission_callback' => array($this, 'verify_api_key')
        ));
        
        // Endpoint para criar categoria
        register_rest_route('invictus/v1', '/create-category', array(
            'methods' => 'POST',
            'callback' => array($this, 'create_category'),
            'permission_callback' => array($this, 'verify_api_key')
        ));
        
        // Endpoint para criar página
        register_rest_route('invictus/v1', '/create-page', array(
            'methods' => 'POST',
            'callback' => array($this, 'create_page'),
            'permission_callback' => array($this, 'verify_api_key')
        ));
        
        // Endpoint para upload de imagem
        register_rest_route('invictus/v1', '/upload-image', array(
            'methods' => 'POST',
            'callback' => array($this, 'upload_image'),
            'permission_callback' => array($this, 'verify_api_key')
        ));
    }
    
    public function verify_api_key($request) {
        $provided_key = $request->get_header('X-Invictus-API-Key');
        return $provided_key === $this->api_key;
    }
    
    public function check_status($request) {
        $status = array(
            'plugin_active' => true,
            'wordpress_version' => get_bloginfo('version'),
            'site_url' => get_site_url(),
            'plugins' => array(
                'rank_math' => is_plugin_active('seo-by-rank-math/rank-math.php'),
                'ad_inserter' => is_plugin_active('ad-inserter/ad-inserter.php')
            )
        );
        
        return rest_ensure_response($status);
    }
    
    public function create_article($request) {
        $params = $request->get_json_params();
        
        $post_data = array(
            'post_title' => sanitize_text_field($params['title']),
            'post_content' => wp_kses_post($params['content']),
            'post_status' => isset($params['status']) ? $params['status'] : 'draft',
            'post_author' => get_current_user_id(),
            'post_type' => 'post'
        );
        
        if (isset($params['category_id'])) {
            $post_data['post_category'] = array((int)$params['category_id']);
        }
        
        $post_id = wp_insert_post($post_data);
        
        if (is_wp_error($post_id)) {
            return new WP_Error('post_creation_failed', $post_id->get_error_message(), array('status' => 500));
        }
        
        // SEO com Rank Math
        if (isset($params['seo_title'])) {
            update_post_meta($post_id, 'rank_math_title', sanitize_text_field($params['seo_title']));
        }
        
        if (isset($params['seo_description'])) {
            update_post_meta($post_id, 'rank_math_description', sanitize_text_field($params['seo_description']));
        }
        
        if (isset($params['focus_keyword'])) {
            update_post_meta($post_id, 'rank_math_focus_keyword', sanitize_text_field($params['focus_keyword']));
        }
        
        // Imagem destacada
        if (isset($params['featured_image_id'])) {
            set_post_thumbnail($post_id, (int)$params['featured_image_id']);
        }
        
        return rest_ensure_response(array(
            'success' => true,
            'post_id' => $post_id,
            'post_url' => get_permalink($post_id)
        ));
    }
    
    public function create_category($request) {
        $params = $request->get_json_params();
        
        $category = wp_insert_term(
            sanitize_text_field($params['name']),
            'category',
            array(
                'slug' => sanitize_title($params['slug']),
                'description' => isset($params['description']) ? sanitize_text_field($params['description']) : ''
            )
        );
        
        if (is_wp_error($category)) {
            return new WP_Error('category_creation_failed', $category->get_error_message(), array('status' => 500));
        }
        
        return rest_ensure_response(array(
            'success' => true,
            'category_id' => $category['term_id']
        ));
    }
    
    public function create_page($request) {
        $params = $request->get_json_params();
        
        $page_data = array(
            'post_title' => sanitize_text_field($params['title']),
            'post_content' => wp_kses_post($params['content']),
            'post_status' => 'publish',
            'post_type' => 'page',
            'post_author' => get_current_user_id()
        );
        
        $page_id = wp_insert_post($page_data);
        
        if (is_wp_error($page_id)) {
            return new WP_Error('page_creation_failed', $page_id->get_error_message(), array('status' => 500));
        }
        
        return rest_ensure_response(array(
            'success' => true,
            'page_id' => $page_id,
            'page_url' => get_permalink($page_id)
        ));
    }
    
    public function upload_image($request) {
        $params = $request->get_json_params();
        
        require_once(ABSPATH . 'wp-admin/includes/image.php');
        require_once(ABSPATH . 'wp-admin/includes/file.php');
        require_once(ABSPATH . 'wp-admin/includes/media.php');
        
        if (isset($params['image_url'])) {
            $image_url = esc_url_raw($params['image_url']);
            $image_data = file_get_contents($image_url);
            
            $upload = wp_upload_bits(
                sanitize_file_name($params['filename'] ?? 'image-' . time() . '.jpg'),
                null,
                $image_data
            );
            
            if ($upload['error']) {
                return new WP_Error('upload_failed', $upload['error'], array('status' => 500));
            }
            
            $attachment = array(
                'post_mime_type' => 'image/jpeg',
                'post_title' => sanitize_text_field($params['title'] ?? 'Image'),
                'post_content' => '',
                'post_status' => 'inherit'
            );
            
            $attachment_id = wp_insert_attachment($attachment, $upload['file']);
            $attachment_data = wp_generate_attachment_metadata($attachment_id, $upload['file']);
            wp_update_attachment_metadata($attachment_id, $attachment_data);
            
            return rest_ensure_response(array(
                'success' => true,
                'attachment_id' => $attachment_id,
                'url' => wp_get_attachment_url($attachment_id)
            ));
        }
        
        return new WP_Error('invalid_request', 'Image URL required', array('status' => 400));
    }
    
    public function add_admin_menu() {
        add_menu_page(
            'Invictus Automatik',
            'Invictus',
            'manage_options',
            'invictus-automatik',
            array($this, 'admin_page'),
            'dashicons-cloud',
            30
        );
    }
    
    public function register_settings() {
        register_setting('invictus_settings', 'invictus_api_key');
    }
    
    public function admin_page() {
        ?>
        <div class="wrap">
            <h1>Invictus Automatik</h1>
            <form method="post" action="options.php">
                <?php settings_fields('invictus_settings'); ?>
                <table class="form-table">
                    <tr>
                        <th scope="row"><label for="invictus_api_key">API Key</label></th>
                        <td>
                            <input type="text" id="invictus_api_key" name="invictus_api_key" 
                                   value="<?php echo esc_attr(get_option('invictus_api_key')); ?>" 
                                   class="regular-text" />
                            <p class="description">Insira a API Key fornecida pela plataforma Invictus Automatik</p>
                        </td>
                    </tr>
                </table>
                <?php submit_button(); ?>
            </form>
        </div>
        <?php
    }
}

new Invictus_Automatik();
`;
  };

  const handleConnect = async () => {
    if (!formData.siteName || !formData.siteUrl || !formData.domain) {
      toast.error("Preencha todos os campos");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Usuário não autenticado");
        navigate("/auth");
        return;
      }

      const { error } = await supabase
        .from("wordpress_sites")
        .insert({
          user_id: user.id,
          site_name: formData.siteName,
          site_url: formData.siteUrl,
          domain: formData.domain,
          plugin_active: false,
        });

      if (error) throw error;

      toast.success("Site conectado com sucesso!");
      setFormData({ siteName: "", siteUrl: "", domain: "" });
      fetchConnectedSites();
    } catch (error: any) {
      console.error("Erro ao conectar site:", error);
      toast.error("Erro ao conectar site");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Gradient Mesh Background */}
      <div className="fixed inset-0 bg-gradient-mesh opacity-30 pointer-events-none" />
      
      <div className="container max-w-7xl mx-auto px-4 py-8 relative z-10">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-6 hover:text-primary"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar ao Dashboard
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="glass-effect border-2 border-border/50 hover-lift relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-secondary" />
              
              <CardHeader className="border-b border-border/50 bg-gradient-card">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-glow">
                    <Globe className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-3xl font-display">Conectar Site WordPress</CardTitle>
                    <CardDescription className="text-base mt-1">
                      Integre seu site com a plataforma Invictus
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-8 space-y-6">
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="siteName" className="text-base font-semibold">Nome do Site</Label>
                    <Input
                      id="siteName"
                      placeholder="Meu Blog Incrível"
                      value={formData.siteName}
                      onChange={(e) =>
                        setFormData({ ...formData, siteName: e.target.value })
                      }
                      className="h-12 text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="domain" className="text-base font-semibold">Domínio</Label>
                    <Input
                      id="domain"
                      placeholder="meusite.com"
                      value={formData.domain}
                      onChange={(e) =>
                        setFormData({ ...formData, domain: e.target.value })
                      }
                      className="h-12 text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="siteUrl" className="text-base font-semibold">URL do WordPress</Label>
                    <Input
                      id="siteUrl"
                      type="url"
                      placeholder="https://meusite.com"
                      value={formData.siteUrl}
                      onChange={(e) =>
                        setFormData({ ...formData, siteUrl: e.target.value })
                      }
                      className="h-12 text-base"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleConnect}
                  disabled={loading}
                  className="w-full h-14 text-lg bg-gradient-primary hover:opacity-90 shadow-glow text-white font-bold group relative overflow-hidden"
                  size="lg"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Conectando...
                    </>
                  ) : (
                    <>
                      <Globe className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                      Conectar Site
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Connected Sites */}
            {connectedSites.length > 0 && (
              <Card className="glass-effect border-2 border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    Sites Conectados ({connectedSites.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {connectedSites.map((site) => (
                      <div
                        key={site.id}
                        className="glass-effect p-4 rounded-xl border border-border/50 hover:border-primary/50 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">{site.site_name}</h3>
                            <p className="text-sm text-muted-foreground">{site.domain}</p>
                          </div>
                          <div className={`flex items-center gap-2 ${site.plugin_active ? "text-green-500" : "text-orange-500"}`}>
                            {site.plugin_active ? (
                              <>
                                <CheckCircle2 className="w-4 h-4" />
                                <span className="text-sm font-medium">Ativo</span>
                              </>
                            ) : (
                              <>
                                <AlertCircle className="w-4 h-4" />
                                <span className="text-sm font-medium">Plugin inativo</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Plugin Download Section */}
          <div className="space-y-6">
            <Card className="glass-effect border-2 border-border/50 hover-lift sticky top-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secondary via-primary to-accent" />
              
              <CardHeader className="bg-gradient-card border-b border-border/50">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-gradient-secondary rounded-xl flex items-center justify-center shadow-glow-secondary">
                    <Download className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Plugin WordPress</CardTitle>
                    <CardDescription>Versão 1.0.0</CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <Zap className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Integração Completa</h4>
                      <p className="text-sm text-muted-foreground">
                        Endpoints REST API personalizados para comunicação segura
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <Shield className="w-4 h-4 text-secondary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Autenticação Segura</h4>
                      <p className="text-sm text-muted-foreground">
                        Sistema de API Key para proteger seus dados
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <Server className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Automação Total</h4>
                      <p className="text-sm text-muted-foreground">
                        Criação de posts, categorias e upload de imagens
                      </p>
                    </div>
                  </div>
                </div>

                <div className="glass-effect p-4 rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    Funcionalidades
                  </h4>
                  <ul className="text-sm space-y-1.5 text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                      Publicação automática de artigos
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                      SEO otimizado com Rank Math
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                      Upload e gerenciamento de imagens
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                      Criação de categorias e páginas
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                      Verificação de status do plugin
                    </li>
                  </ul>
                </div>

                <Button
                  onClick={handleDownloadPlugin}
                  className="w-full h-12 bg-gradient-to-r from-secondary to-primary hover:opacity-90 shadow-glow-secondary text-white font-bold group relative overflow-hidden"
                  size="lg"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                  <Download className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  Baixar Plugin
                </Button>

                <div className="pt-4 border-t border-border/50">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <strong>Instalação:</strong> Faça upload do plugin no seu WordPress 
                    (Plugins → Adicionar novo → Enviar plugin), ative-o e configure 
                    a API Key na página de configurações do plugin.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectSite;