import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { adminAPI } from "@/services/api";
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  FileText,
  Globe,
  Calendar,
  Lock,
  Unlock
} from "lucide-react";

interface Page {
  id: number;
  title: string;
  slug: string;
  content?: string;
  pageType: 'static' | 'dynamic' | 'system';
  isPublished: boolean;
  isPublic: boolean;
  requiresAuth: boolean;
  languageCode: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

const AdminPages = () => {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<Page | null>(null);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    content: "",
    pageType: "static",
    isPublished: true as boolean,
    isPublic: true as boolean,
    requiresAuth: false as boolean,
    languageCode: "en",
    sortOrder: 0 as number,
  });

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const params = {
        page: 1,
        limit: 50,
        search: searchTerm,
        type: typeFilter !== 'all' ? typeFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined
      };
      
      const response = await adminAPI.getPages(params);
      setPages(response.data.pages);
    } catch (error) {
      console.error('Error fetching pages:', error);
      setPages([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredPages = pages.filter(page => {
    const matchesSearch = 
      page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      page.slug.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === "all" || page.pageType === typeFilter;
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "published" && page.isPublished) ||
      (statusFilter === "draft" && !page.isPublished);
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const getTypeBadge = (type: string) => {
    const variants = {
      static: "default",
      dynamic: "secondary",
      system: "outline"
    } as const;
    
    return <Badge variant={variants[type as keyof typeof variants]}>{type}</Badge>;
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Pages Management</h2>
          <p className="text-muted-foreground">Manage website pages and content</p>
        </div>
        <Dialog open={open} onOpenChange={(o)=>{ setOpen(o); if (!o) { setSelected(null); setForm({ title: "", slug: "", pageType: "static", isPublished: true, isPublic: true, requiresAuth: false, languageCode: "en", sortOrder: 0 }); } }}>
          <DialogTrigger asChild>
            <Button onClick={()=>{ setSelected(null); setForm({ title: "", slug: "", pageType: "static", isPublished: true, isPublic: true, requiresAuth: false, languageCode: "en", sortOrder: 0 }); }}>
              <Plus className="w-4 h-4 mr-2" />
              Create Page
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{selected ? 'Edit Page' : 'Create Page'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Title</Label>
                <Input value={form.title} onChange={(e)=> setForm({ ...form, title: e.target.value })} />
              </div>
              <div>
                <Label>Slug</Label>
                <Input value={form.slug} onChange={(e)=> setForm({ ...form, slug: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Type</Label>
                  <Select value={form.pageType} onValueChange={(v)=> setForm({ ...form, pageType: v as any })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="static">Static</SelectItem>
                      <SelectItem value="dynamic">Dynamic</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Language</Label>
                  <Input value={form.languageCode} onChange={(e)=> setForm({ ...form, languageCode: e.target.value })} />
                </div>
              </div>
              <div>
                <Label>Content</Label>
                <Textarea rows={6} value={form.content} onChange={(e)=> setForm({ ...form, content: e.target.value })} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>Published</Label>
                  <Select value={form.isPublished ? 'yes' : 'no'} onValueChange={(v)=> setForm({ ...form, isPublished: v==='yes' })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Public</Label>
                  <Select value={form.isPublic ? 'yes' : 'no'} onValueChange={(v)=> setForm({ ...form, isPublic: v==='yes' })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Requires Auth</Label>
                  <Select value={form.requiresAuth ? 'yes' : 'no'} onValueChange={(v)=> setForm({ ...form, requiresAuth: v==='yes' })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Sort order</Label>
                <Input type="number" value={String(form.sortOrder)} onChange={(e)=> setForm({ ...form, sortOrder: parseInt(e.target.value || '0') })} />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={()=> setOpen(false)}>Cancel</Button>
                <Button disabled={saving} onClick={async ()=>{
                  setSaving(true);
                  try{
                    if(selected){
                      await adminAPI.updatePage(selected.id, form);
                    }else{
                      await adminAPI.createPage(form);
                    }
                    await fetchPages();
                    setOpen(false);
                  }catch(e){
                    console.error('Save page failed', e);
                  }finally{
                    setSaving(false);
                  }
                }}>{saving ? 'Saving...' : 'Save'}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search pages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="static">Static</SelectItem>
                <SelectItem value="dynamic">Dynamic</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Pages Table */}
      <Card>
        <CardHeader>
          <CardTitle>Pages ({filteredPages.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Access</TableHead>
                <TableHead>Language</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPages.map((page) => (
                <TableRow key={page.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{page.title}</div>
                        <div className="text-sm text-muted-foreground">
                          /{page.slug}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{page.slug}</TableCell>
                  <TableCell>{getTypeBadge(page.pageType)}</TableCell>
                  <TableCell>
                    <Badge variant={page.isPublished ? "default" : "secondary"}>
                      {page.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {page.isPublic ? (
                        <Unlock className="w-4 h-4 text-green-500" />
                      ) : (
                        <Lock className="w-4 h-4 text-red-500" />
                      )}
                      <span className="text-sm">
                        {page.isPublic ? "Public" : "Private"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-muted-foreground" />
                      <Badge variant="outline">{page.languageCode.toUpperCase()}</Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      {new Date(page.updatedAt).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      
                      <Button variant="ghost" size="sm" onClick={()=>{ setSelected(page); setForm({ title: page.title, slug: page.slug, content: page.content || "", pageType: page.pageType, isPublished: page.isPublished, isPublic: page.isPublic, requiresAuth: page.requiresAuth, languageCode: page.languageCode, sortOrder: page.sortOrder }); setOpen(true); }}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      
                      {page.pageType !== 'system' && (
                        <Button variant="ghost" size="sm" className="text-destructive" onClick={async ()=>{ try{ await adminAPI.deletePage(page.id); setPages(pages.filter(p=>p.id!==page.id)); }catch(e){ console.error('Delete page failed', e); } }}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPages; 