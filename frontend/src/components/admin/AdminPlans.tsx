import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { plansAPI } from '@/services/api.js';
import { useToast } from "@/hooks/use-toast";

const AdminPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    amount: '',
    monthlyIncome: '',
    bonusReward: '',
    category: 'EXCLUSIVE_PLAN',
    features: [],
    badge: '',
    isActive: true,
    sortOrder: 0
  });
  const [featureInput, setFeatureInput] = useState({ icon: '', text: '' });

  const { toast } = useToast();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await plansAPI.getAllAdmin();
      if (response.data.success) {
        setPlans(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast({
        title: "Error",
        description: "Failed to fetch plans",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const planData = {
        ...formData,
        amount: parseFloat(formData.amount),
        monthlyIncome: formData.monthlyIncome ? parseFloat(formData.monthlyIncome) : null,
        bonusReward: formData.bonusReward ? parseFloat(formData.bonusReward) : null,
        sortOrder: parseInt(formData.sortOrder) || 0
      };

      let response;
      if (editingPlan) {
        response = await plansAPI.update(editingPlan.id, planData);
      } else {
        response = await plansAPI.create(planData);
      }

      if (response.data.success) {
        toast({
          title: "Success",
          description: `Plan ${editingPlan ? 'updated' : 'created'} successfully`,
        });
        setIsDialogOpen(false);
        resetForm();
        fetchPlans();
      }
    } catch (error) {
      console.error('Error saving plan:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || 'Failed to save plan',
        variant: "destructive",
      });
    }
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      type: plan.type,
      amount: plan.amount.toString(),
      monthlyIncome: plan.monthlyIncome ? plan.monthlyIncome.toString() : '',
      bonusReward: plan.bonusReward ? plan.bonusReward.toString() : '',
      category: plan.category,
      features: plan.features || [],
      badge: plan.badge || '',
      isActive: plan.isActive,
      sortOrder: plan.sortOrder || 0
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (planId) => {
    if (!confirm('Are you sure you want to delete this plan?')) return;
    
    try {
      await plansAPI.delete(planId);
      toast({
        title: "Success",
        description: "Plan deleted successfully",
      });
      fetchPlans();
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast({
        title: "Error",
        description: "Failed to delete plan",
        variant: "destructive",
      });
    }
  };

  const handleToggle = async (planId) => {
    try {
      await plansAPI.toggle(planId);
      toast({
        title: "Success",
        description: "Plan status updated successfully",
      });
      fetchPlans();
    } catch (error) {
      console.error('Error toggling plan:', error);
      toast({
        title: "Error",
        description: "Failed to update plan status",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setEditingPlan(null);
    setFormData({
      name: '',
      type: '',
      amount: '',
      monthlyIncome: '',
      bonusReward: '',
      category: 'EXCLUSIVE_PLAN',
      features: [],
      badge: '',
      isActive: true,
      sortOrder: 0
    });
    setFeatureInput({ icon: '', text: '' });
  };

  const addFeature = () => {
    if (featureInput.icon && featureInput.text) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, { ...featureInput }]
      }));
      setFeatureInput({ icon: '', text: '' });
    }
  };

  const removeFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const exclusivePlans = plans.filter(plan => plan.category === 'EXCLUSIVE_PLAN');
  const premiumPlans = plans.filter(plan => plan.category === 'PREMIUM_PLAN');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Plans Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Add Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPlan ? 'Edit' : 'Add'} Plan</DialogTitle>
              <DialogDescription>
                {editingPlan ? 'Update the plan details below.' : 'Fill in the details to create a new plan.'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Plan Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Input
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({...prev, type: e.target.value}))}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount">Amount ($)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({...prev, amount: e.target.value}))}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="monthlyIncome">Monthly Income ($)</Label>
                  <Input
                    id="monthlyIncome"
                    type="number"
                    step="0.01"
                    value={formData.monthlyIncome}
                    onChange={(e) => setFormData(prev => ({...prev, monthlyIncome: e.target.value}))}
                  />
                </div>
                <div>
                  <Label htmlFor="bonusReward">Bonus Reward ($)</Label>
                  <Input
                    id="bonusReward"
                    type="number"
                    step="0.01"
                    value={formData.bonusReward}
                    onChange={(e) => setFormData(prev => ({...prev, bonusReward: e.target.value}))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({...prev, category: value}))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EXCLUSIVE_PLAN">Exclusive Plan</SelectItem>
                      <SelectItem value="PREMIUM_PLAN">Premium Plan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="badge">Badge</Label>
                  <Input
                    id="badge"
                    value={formData.badge}
                    onChange={(e) => setFormData(prev => ({...prev, badge: e.target.value}))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sortOrder">Sort Order</Label>
                  <Input
                    id="sortOrder"
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData(prev => ({...prev, sortOrder: e.target.value}))}
                  />
                </div>
                <div className="flex items-center space-x-2 mt-6">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData(prev => ({...prev, isActive: checked}))}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
              </div>

              <div>
                <Label>Features</Label>
                <div className="space-y-2 mb-2">
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span>{feature.icon} {feature.text}</span>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeFeature(index)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Icon (e.g., 💰)"
                    value={featureInput.icon}
                    onChange={(e) => setFeatureInput(prev => ({...prev, icon: e.target.value}))}
                    className="w-20"
                  />
                  <Input
                    placeholder="Feature text"
                    value={featureInput.text}
                    onChange={(e) => setFeatureInput(prev => ({...prev, text: e.target.value}))}
                    className="flex-1"
                  />
                  <Button type="button" onClick={addFeature}>Add</Button>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingPlan ? 'Update' : 'Create'} Plan
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Exclusive Plans */}
      <Card>
        <CardHeader>
          <CardTitle>Exclusive Plans ({exclusivePlans.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {exclusivePlans.map((plan) => (
              <div key={plan.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold">{plan.name}</h3>
                    <Badge variant={plan.isActive ? "default" : "secondary"}>
                      {plan.isActive ? "Active" : "Inactive"}
                    </Badge>
                    {plan.badge && <Badge variant="outline">{plan.badge}</Badge>}
                  </div>
                  <p className="text-sm text-gray-600">
                    ${plan.amount} • Type: {plan.type}
                    {plan.monthlyIncome && ` • Monthly: $${plan.monthlyIncome}`}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {plan.features && plan.features.map((feature, idx) => (
                      <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {feature.icon} {feature.text}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggle(plan.id)}
                  >
                    {plan.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(plan)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(plan.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            {exclusivePlans.length === 0 && (
              <p className="text-gray-500 text-center py-4">No exclusive plans found</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Premium Plans */}
      <Card>
        <CardHeader>
          <CardTitle>Premium Plans ({premiumPlans.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {premiumPlans.map((plan) => (
              <div key={plan.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold">{plan.name}</h3>
                    <Badge variant={plan.isActive ? "default" : "secondary"}>
                      {plan.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    ${plan.amount} • Type: {plan.type}
                    {plan.monthlyIncome && ` • Monthly: $${plan.monthlyIncome}`}
                    {plan.bonusReward && ` • Bonus: $${plan.bonusReward}`}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {plan.features && plan.features.map((feature, idx) => (
                      <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {feature.icon} {feature.text}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggle(plan.id)}
                  >
                    {plan.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(plan)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(plan.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            {premiumPlans.length === 0 && (
              <p className="text-gray-500 text-center py-4">No premium plans found</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPlans;
