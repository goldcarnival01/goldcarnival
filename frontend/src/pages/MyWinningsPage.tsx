import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";

const MyWinningsPage = () => {
  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="flex pt-20">
        <DashboardSidebar />
        
        <div className="flex-1">
          {/* Header */}
          <div className="bg-card border-b border-border p-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-foreground">MY WINNINGS</h1>
              <Button variant="ghost" size="sm" className="text-primary">
                BUY TICKET <ShoppingCart className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <section className="p-6">
            <div className="container mx-auto">
              {/* Filters */}
              <div className="flex items-center space-x-4 mb-6">
                <Select defaultValue="mega">
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Mega" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mega">Mega</SelectItem>
                    <SelectItem value="royal">Royal</SelectItem>
                    <SelectItem value="gold">Gold Carnival</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="gold" size="sm">
                  🔽 SELECT
                </Button>
              </div>

              {/* Table */}
              <Card className="bg-card border-border overflow-hidden">
                <div className="bg-gradient-to-r from-primary to-primary/80 p-4">
                  <div className="grid grid-cols-5 gap-4 text-primary-foreground font-semibold text-sm">
                    <div>DRAW DATE</div>
                    <div>PRIZE</div>
                    <div>PRIZE AMOUNT</div>
                    <div>JACKPOT</div>
                    <div>TICKET NO.</div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="text-center text-muted-foreground py-8">
                    Showing 1 to 0 of 0 results
                  </div>
                </div>
                
                {/* Pagination */}
                <div className="border-t border-border p-4 flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Showing 1 to 0 of 0 results
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" disabled>
                      &lt;
                    </Button>
                    <Button variant="gold" size="sm">
                      1
                    </Button>
                    <Button variant="outline" size="sm" disabled>
                      &gt;
                    </Button>
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

export default MyWinningsPage;