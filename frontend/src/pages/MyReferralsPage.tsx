import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { referralAPI } from "@/services/api";
import { useEffect, useState } from "react";

interface ReferralRow {
  id: number;
  memberId: string;
  name: string;
  email: string;
  joinedAt: string;
  status: string;
  transactionCount: number;
  totalSpent: number;
}

const MyReferralsPage = () => {
  const [referrals, setReferrals] = useState<ReferralRow[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReferrals = async (p = 1) => {
    try {
      setIsLoading(true);
      const res = await referralAPI.getList({ page: p, limit: 10 });
      setReferrals(res.data.referrals || res.data.data || []);
      const pagination = res.data.pagination || res.data.data?.pagination || { pages: 1 };
      setPages(pagination.pages || 1);
      setPage(p);
    } catch (e) {
      setReferrals([]);
      setPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReferrals(1);
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      <div className="flex pt-20">
        <DashboardSidebar />
        <div className="flex-1">
          <div className="bg-card border-b border-border p-6">
            <h1 className="text-2xl font-bold text-foreground">MY REFERRALS</h1>
          </div>

          <section className="p-6">
            <div className="container mx-auto">
              <Card className="bg-card border-border p-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted-foreground border-b border-border">
                      <th className="py-2">Member ID</th>
                      <th className="py-2">Name</th>
                      <th className="py-2">Email</th>
                      <th className="py-2">Joined</th>
                      <th className="py-2">Status</th>
                      <th className="py-2">Txns</th>
                      <th className="py-2">Total Spent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={7} className="py-6 text-center text-muted-foreground">Loading...</td>
                      </tr>
                    ) : referrals.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-6 text-center text-muted-foreground">No referrals yet.</td>
                      </tr>
                    ) : (
                      referrals.map((r) => (
                        <tr key={r.id} className="border-b border-border">
                          <td className="py-2 font-mono">{r.memberId}</td>
                          <td className="py-2">{r.name}</td>
                          <td className="py-2">{r.email}</td>
                          <td className="py-2">{new Date(r.joinedAt).toLocaleDateString()}</td>
                          <td className="py-2 capitalize">{r.status}</td>
                          <td className="py-2">{r.transactionCount}</td>
                          <td className="py-2">${Number(r.totalSpent || 0).toFixed(2)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                <div className="flex items-center justify-between mt-4">
                  <span className="text-xs text-muted-foreground">Page {page} of {pages}</span>
                  <div className="space-x-2">
                    <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => fetchReferrals(page - 1)}>Prev</Button>
                    <Button size="sm" variant="outline" disabled={page >= pages} onClick={() => fetchReferrals(page + 1)}>Next</Button>
                  </div>
                </div>
              </Card>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default MyReferralsPage;


