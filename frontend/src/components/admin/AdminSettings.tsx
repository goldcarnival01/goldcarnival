import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { adminAPI } from "@/services/api";
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Settings,
  Globe,
  Calendar,
  Eye,
  EyeOff,
  Lock,
  Unlock
} from "lucide-react";

interface Setting {
  id: number;
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'json' | 'file';
  category: string;
  description?: string;
  isPublic: boolean;
  isEditable: boolean;
  languageCode: string;
  group?: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

const AdminSettings = () => {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [groupFilter, setGroupFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<Setting | null>(null);
  const [form, setForm] = useState({
    key: "",
    value: "",
    type: "string",
    category: "general",
    description: "",
    isPublic: true as boolean,
    languageCode: "en",
    group: "",
    sortOrder: 0 as number,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const params = {
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        group: groupFilter !== 'all' ? groupFilter : undefined
      };
      
      const response = await adminAPI.getSettings(params);
      setSettings(response.data.settings);
    } catch (error) {
      console.error('Error fetching settings:', error);
      setSettings([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredSettings = settings.filter(setting => {
    const matchesSearch = 
      setting.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      setting.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
      setting.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || setting.category === categoryFilter;
    const matchesGroup = groupFilter === "all" || setting.group === groupFilter;
    
    return matchesSearch && matchesCategory && matchesGroup;
  });

  const getTypeBadge = (type: string) => {
    const variants = {
      string: "default",
      number: "secondary",
      boolean: "outline",
      json: "destructive",
      file: "secondary"
    } as const;
    
    return <Badge variant={variants[type as keyof typeof variants]}>{type}</Badge>;
  };

  const getValueDisplay = (setting: Setting) => {
    if (setting.type === 'boolean') {
      return setting.value === 'true' ? 'Yes' : 'No';
    }
    if (setting.type === 'json') {
      try {
        const parsed = JSON.parse(setting.value);
        return JSON.stringify(parsed, null, 2).substring(0, 50) + '...';
      } catch {
        return setting.value;
      }
    }
    return setting.value.length > 50 ? setting.value.substring(0, 50) + '...' : setting.value;
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Settings Management</h2>
          <p className="text-muted-foreground">Configure system settings and preferences</p>
        </div>
        <Dialog open={open} onOpenChange={(o)=>{ setOpen(o); if (!o){ setSelected(null); setForm({ key: "", value: "", type: "string", category: "general", description: "", isPublic: true, languageCode: "en", group: "", sortOrder: 0 }); } }}>
          <DialogTrigger asChild>
            <Button onClick={()=>{ setSelected(null); setForm({ key: "", value: "", type: "string", category: "general", description: "", isPublic: true, languageCode: "en", group: "", sortOrder: 0 }); }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Setting
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{selected ? 'Edit Setting' : 'Add Setting'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              {!selected && (
                <div>
                  <Label>Key</Label>
                  <Input value={form.key} onChange={(e)=> setForm({ ...form, key: e.target.value })} />
                </div>
              )}
              <div>
                <Label>Value</Label>
                <Input value={form.value} onChange={(e)=> setForm({ ...form, value: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Type</Label>
                  <Select value={form.type} onValueChange={(v)=> setForm({ ...form, type: v as any })}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="string">string</SelectItem>
                      <SelectItem value="number">number</SelectItem>
                      <SelectItem value="boolean">boolean</SelectItem>
                      <SelectItem value="json">json</SelectItem>
                      <SelectItem value="file">file</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Category</Label>
                  <Input value={form.category} onChange={(e)=> setForm({ ...form, category: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Language</Label>
                  <Input value={form.languageCode} onChange={(e)=> setForm({ ...form, languageCode: e.target.value })} />
                </div>
                <div>
                  <Label>Group</Label>
                  <Input value={form.group} onChange={(e)=> setForm({ ...form, group: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Public</Label>
                  <Select value={form.isPublic ? 'yes' : 'no'} onValueChange={(v)=> setForm({ ...form, isPublic: v==='yes' })}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Sort order</Label>
                  <Input type="number" value={String(form.sortOrder)} onChange={(e)=> setForm({ ...form, sortOrder: parseInt(e.target.value || '0') })} />
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Input value={form.description} onChange={(e)=> setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={()=> setOpen(false)}>Cancel</Button>
                <Button disabled={saving} onClick={async ()=>{
                  setSaving(true);
                  try{
                    if(selected){
                      await adminAPI.updateSetting(selected.key, form.value);
                    }else{
                      await adminAPI.createSetting(form);
                    }
                    await fetchSettings();
                    setOpen(false);
                  }catch(e){
                    console.error('Save setting failed', e);
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
                placeholder="Search settings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="system">System</SelectItem>
                <SelectItem value="contact">Contact</SelectItem>
                <SelectItem value="payment">Payment</SelectItem>
              </SelectContent>
            </Select>
            <Select value={groupFilter} onValueChange={setGroupFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Groups</SelectItem>
                <SelectItem value="branding">Branding</SelectItem>
                <SelectItem value="contact">Contact</SelectItem>
                <SelectItem value="system">System</SelectItem>
                <SelectItem value="payment">Payment</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Settings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Settings ({filteredSettings.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Key</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Access</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSettings.map((setting) => (
                <TableRow key={setting.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Settings className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{setting.key}</div>
                        {setting.description && (
                          <div className="text-sm text-muted-foreground">
                            {setting.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      <code className="text-sm bg-muted px-2 py-1 rounded">
                        {getValueDisplay(setting)}
                      </code>
                    </div>
                  </TableCell>
                  <TableCell>{getTypeBadge(setting.type)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{setting.category}</Badge>
                      {setting.group && (
                        <Badge variant="secondary">{setting.group}</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {setting.isPublic ? (
                        <Unlock className="w-4 h-4 text-green-500" />
                      ) : (
                        <Lock className="w-4 h-4 text-red-500" />
                      )}
                      <span className="text-sm">
                        {setting.isPublic ? "Public" : "Private"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      {new Date(setting.updatedAt).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={()=>{ setSelected(setting); setForm({ key: setting.key, value: setting.value, type: setting.type, category: setting.category, description: setting.description || "", isPublic: setting.isPublic, languageCode: setting.languageCode, group: setting.group || "", sortOrder: setting.sortOrder }); setOpen(true) }}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      
                      {setting.isEditable && (
                        <Button variant="ghost" size="sm" className="text-destructive" onClick={async ()=>{ try{ await adminAPI.deleteSetting(setting.key); setSettings(settings.filter(s=>s.id!==setting.id)); }catch(e){ console.error('Delete setting failed', e); } }}>
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Settings</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{settings.length}</div>
            <p className="text-xs text-muted-foreground">
              Configured settings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Public Settings</CardTitle>
            <Unlock className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {settings.filter(s => s.isPublic).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Publicly accessible
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(settings.map(s => s.category)).size}
            </div>
            <p className="text-xs text-muted-foreground">
              Different categories
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminSettings; 