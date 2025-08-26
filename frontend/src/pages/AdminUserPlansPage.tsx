import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { userPlansAPI, adminAPI } from "@/services/api";
import { ArrowLeft, Calendar, Package } from "lucide-react";

interface AdminUserPlanItem {
  id: number;
  userId: number;
  planId: number;
  purchasePrice: string;
  purchaseDate: string;
  expiryDate?: string;
  paymentMethod?: string;
  transactionId?: string;
  walletAddress?: string;
  verified: "pending" | "verified" | "rejected";
  plan?: {
    id: number;
    name: string;
    type: string;
    amount: string;
    category: string;
    badge?: string;
  };
}

interface AdminUserSummary {
  id: number;
  memberId: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

const AdminUserPlansPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<AdminUserPlanItem[]>([]);
  const [user, setUser] = useState<AdminUserSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!userId) return;
    try {
      const [plansRes, userRes] = await Promise.all([
        userPlansAPI.getAllAdmin({ userId, limit: 100 }),
        adminAPI.getUser(userId),
      ]);

      console.log('Plans response:', plansRes.data);
      const plansData = plansRes.data.data?.userPlans || plansRes.data.userPlans || [];
      console.log('Processed plans data:', plansData);
      setPlans(plansData);
      setUser(userRes.data?.data || userRes.data);
    } catch (e) {
      console.error("Failed to load user plans", e);
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

  const getVerifiedBadge = (verified: string) => {
    const variants = {
      pending: "secondary",
      verified: "default",
      rejected: "destructive",
    } as const;
    
    const variant = variants[verified.toLowerCase() as keyof typeof variants] || "secondary";
    return <Badge variant={variant}>{verified.charAt(0).toUpperCase() + verified.slice(1)}</Badge>;
  };

  const handleVerify = async (planId: number) => {
    try {
      // Update the local state immediately for better UX
      setPlans(prevPlans => 
        prevPlans.map(plan => 
          plan.id === planId 
            ? { ...plan, verified: 'verified' as const }
            : plan
        )
      );
      
      // Call API to update verification status
      await userPlansAPI.verify(planId);
    } catch (error) {
      console.error('Failed to verify plan:', error);
      // Revert the local state change on error
      setPlans(prevPlans => 
        prevPlans.map(plan => 
          plan.id === planId 
            ? { ...plan, verified: 'pending' as const }
            : plan
        )
      );
    }
  };

  const handleReject = async (planId: number) => {
    if (!confirm('Are you sure you want to reject this plan? This action cannot be undone.')) return;
    
    try {
      // Remove the plan from local state immediately for better UX
      setPlans(prevPlans => prevPlans.filter(plan => plan.id !== planId));
      
      // Call API to reject/delete the plan
      await userPlansAPI.reject(planId);
    } catch (error) {
      console.error('Failed to reject plan:', error);
      // Revert the local state change on error by refetching
      fetchData();
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-4 flex items-center gap-2">
        <Button variant="ghost" onClick={() => navigate("/admin")}> 
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Admin
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            User Plans{user ? ` - ${user.firstName || ""} ${user.lastName || ""} (${user.memberId})` : ""}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-40">Loading...</div>
          ) : (
            <Table>
                             <TableHeader>
                 <TableRow>
                   <TableHead>Plan</TableHead>
                   <TableHead>Category</TableHead>
                   <TableHead>Price</TableHead>
                   <TableHead>Purchased</TableHead>
                   <TableHead>Expiry</TableHead>
                   <TableHead>Payment</TableHead>
                   <TableHead>Wallet Address</TableHead>
                   <TableHead>Verified</TableHead>
                   <TableHead>Actions</TableHead>
                 </TableRow>
               </TableHeader>
                             <TableBody>
                                   {plans.map((p) => {
                    console.log('Rendering plan:', p);
                    console.log('Plan verified status:', p.verified, 'Type:', typeof p.verified);
                    if (!p.verified) {
                      console.warn('⚠️ Plan has no verified status:', p.id, p);
                    }
                    return (
                   <TableRow key={p.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-muted-foreground" />
                        {p.plan?.name || `Plan #${p.planId}`}
                      </div>
                    </TableCell>
                                         <TableCell>{p.plan?.category || "-"}</TableCell>
                     <TableCell>${Number(p.purchasePrice).toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        {new Date(p.purchaseDate).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>{p.expiryDate ? new Date(p.expiryDate).toLocaleDateString() : "-"}</TableCell>
                    <TableCell>{p.paymentMethod || "-"}</TableCell>
                    <TableCell className="font-mono text-xs max-w-[120px] truncate" title={p.walletAddress || "-"}>
                      {p.walletAddress || "-"}
                    </TableCell>
                    <TableCell>{getVerifiedBadge(p.verified)}</TableCell>
                                         <TableCell>
                       {p.verified.toLowerCase() === 'pending' ? (
                         <div className="flex gap-2">
                           <Button 
                             size="sm" 
                             onClick={() => handleVerify(p.id)}
                             className="bg-green-600 hover:bg-green-700"
                           >
                             Verify
                           </Button>
                           <Button 
                             size="sm" 
                             onClick={() => handleReject(p.id)}
                             variant="destructive"
                           >
                             Reject
                           </Button>
                         </div>
                       ) : p.verified.toLowerCase() === 'verified' ? (
                         <Badge variant="default" className="bg-green-600">Verified</Badge>
                       ) : p.verified.toLowerCase() === 'rejected' ? (
                         <Badge variant="destructive">Rejected</Badge>
                       ) : (
                         <Badge variant="secondary">Unknown</Badge>
                       )}
                     </TableCell>
                                     </TableRow>
                 );
                 })}
                 {plans.length === 0 && (
                   <TableRow>
                     <TableCell colSpan={9} className="text-center text-muted-foreground">
                       No plans found for this user.
                     </TableCell>
                   </TableRow>
                 )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUserPlansPage;


