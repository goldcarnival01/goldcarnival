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
      <div className="flex flex-col lg:flex-row pt-16 sm:pt-20">
        <DashboardSidebar />
        <div className="flex-1">
          <div className="bg-card border-b border-border p-3 sm:p-4 lg:p-6">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">MY REFERRALS</h1>
          </div>

          <section className="p-3 sm:p-4 lg:p-6">
            <div className="container mx-auto">
              {/* Mobile Card Layout */}
              <div className="block sm:hidden space-y-4">
                {isLoading ? (
                  <Card className="bg-card border-border p-4 text-center">
                    <div className="text-muted-foreground">Loading...</div>
                  </Card>
                ) : referrals.length === 0 ? (
                  <Card className="bg-card border-border p-4 text-center">
                    <div className="text-muted-foreground">No referrals yet.</div>
                  </Card>
                ) : (
                  referrals.map((r) => (
                    <Card key={r.id} className="bg-card border-border p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex flex-col space-y-1">
                          <span className="font-semibold text-sm">{r.name}</span>
                          <span className="text-xs font-mono text-muted-foreground">{r.memberId}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold">${Number(r.totalSpent || 0).toFixed(2)}</div>
                          <div className="text-xs text-muted-foreground capitalize">{r.status}</div>
                        </div>
                      </div>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Email:</span>
                          <span className="text-right truncate max-w-32">{r.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Joined:</span>
                          <span>{new Date(r.joinedAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Transactions:</span>
                          <span>{r.transactionCount}</span>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
                
                {/* Mobile Pagination */}
                <div className="flex items-center justify-between mt-4 px-2">
                  <span className="text-xs text-muted-foreground">Page {page} of {pages}</span>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => fetchReferrals(page - 1)}>Prev</Button>
                    <Button size="sm" variant="outline" disabled={page >= pages} onClick={() => fetchReferrals(page + 1)}>Next</Button>
                  </div>
                </div>
              </div>

              {/* Desktop Table Layout */}
              <div className="hidden sm:block">
                <Card className="bg-card border-border p-3 sm:p-4 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-muted-foreground border-b border-border">
                        <th className="py-2 px-2">Member ID</th>
                        <th className="py-2 px-2">Name</th>
                        <th className="py-2 px-2">Email</th>
                        <th className="py-2 px-2">Joined</th>
                        <th className="py-2 px-2">Status</th>
                        <th className="py-2 px-2">Txns</th>
                        <th className="py-2 px-2">Total Spent</th>
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
                            <td className="py-2 px-2 font-mono text-xs">{r.memberId}</td>
                            <td className="py-2 px-2 text-xs">{r.name}</td>
                            <td className="py-2 px-2 text-xs">{r.email}</td>
                            <td className="py-2 px-2 text-xs">{new Date(r.joinedAt).toLocaleDateString()}</td>
                            <td className="py-2 px-2 text-xs capitalize">{r.status}</td>
                            <td className="py-2 px-2 text-xs">{r.transactionCount}</td>
                            <td className="py-2 px-2 text-xs">${Number(r.totalSpent || 0).toFixed(2)}</td>
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
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default MyReferralsPage;


