import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Calendar, MapPin, DollarSign } from "lucide-react";

const WinnersPage = () => {
  const featuredWinner = {
    name: "Rick Aguilar",
    memberId: "L582190723",
    country: "United States",
    amount: 500000,
    jackpot: "ROYAL JACKPOT",
    image: ""
  };

  const recentWinners = [
    { place: "First", name: "Sam Wyszynski", date: "Jul 5, 2025", amount: 100000, ticket: "835264", nationality: "Poland" },
    { place: "Second", name: "Sanele Nxumalo", date: "Jul 5, 2025", amount: 5000, ticket: "983220", nationality: "South Africa" },
    { place: "Third", name: "Halimat Abdulrahman", date: "Jul 5, 2025", amount: 1000, ticket: "947413", nationality: "Nigeria" },
    { place: "Third", name: "Lidia Monahan", date: "Jul 5, 2025", amount: 1000, ticket: "451771", nationality: "United States" },
    { place: "Third", name: "Isabella Mithiyane", date: "Jul 5, 2025", amount: 1000, ticket: "289336", nationality: "South Africa" },
    { place: "Fourth", name: "Enrique Soto", date: "Jul 5, 2025", amount: 100, ticket: "881224", nationality: "Canada" },
    { place: "Fourth", name: "Macy Dickson", date: "Jul 5, 2025", amount: 100, ticket: "697241", nationality: "Canada" },
    { place: "Fourth", name: "Cezara Romon", date: "Jul 5, 2025", amount: 100, ticket: "827724", nationality: "Romania" },
  ];

  const ticketStats = [
    { type: "MEGA TICKETS", sold: "19675912" },
    { type: "ROYAL TICKETS", sold: "2462494" },
    { type: "GOLD CARNIVAL TICKETS", sold: "2539564" }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-16 sm:pt-20 pb-12 sm:pb-16 bg-gradient-to-br from-background via-secondary/10 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold mb-4 sm:mb-6">
              <span className="gradient-gold bg-clip-text text-transparent">
                WINNERS
              </span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-6 sm:mb-8 leading-relaxed">
              Explore the stories of triumph and fortune with our celebrated winners at Gold Carnival.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Winner */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold gradient-gold bg-clip-text text-transparent mb-3 sm:mb-4">
              OUR WINNER'S CLUB
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Ordinary folks with extraordinary winning stories
            </p>
          </div>

          <div className="max-w-4xl mx-auto mb-8 sm:mb-12">
            <Card className="bg-card border-primary p-4 sm:p-6 lg:p-8 shadow-gold">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-center">
                <div className="relative">
                  <div className="absolute -top-3 sm:-top-4 left-2 sm:left-4 bg-primary text-primary-foreground px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold">
                    {featuredWinner.jackpot}
                  </div>
                  <div className="bg-secondary/20 rounded-lg p-4 sm:p-6 lg:p-8 text-center">
                    <Avatar className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-3 sm:mb-4">
                      <AvatarFallback className="gradient-gold text-primary-foreground text-2xl sm:text-4xl font-bold">
                        {featuredWinner.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2 text-xs sm:text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Name:</span>
                        <span className="text-foreground font-medium">{featuredWinner.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Member ID:</span>
                        <span className="text-foreground font-medium">{featuredWinner.memberId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Country:</span>
                        <span className="text-foreground font-medium">{featuredWinner.country}</span>
                      </div>
                      <div className="pt-2 border-t border-border">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                          <span className="text-primary font-semibold text-xs sm:text-sm">WINNING AMOUNT:</span>
                          <span className="text-lg sm:text-2xl font-bold text-primary">${featuredWinner.amount.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4 sm:mb-6">
                    We cherish all our winners, who with their grit and perseverance have shown that extraordinary 
                    stories can have humble beginnings. We strive to create more winners and provide everyone 
                    with ample opportunities to make it to the winner's list.
                  </p>
                  <Button variant="gold" size="lg" className="w-full sm:w-auto">
                    Watch More
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Ticket Sales Stats */}
      <section className="py-12 sm:py-16 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <p className="text-primary text-xs sm:text-sm font-medium mb-3 sm:mb-4 tracking-wider uppercase">
              TICKET SALES
            </p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold gradient-gold bg-clip-text text-transparent">
              TOTAL TICKETS SOLD IN MAY
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto mb-12 sm:mb-16">
            {ticketStats.map((stat, index) => (
              <Card key={index} className="bg-white text-black p-4 sm:p-6 lg:p-8 text-center">
                <h3 className="text-base sm:text-lg lg:text-xl font-bold mb-2 sm:mb-4">{stat.type}</h3>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">{stat.sold}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Winners Table */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <p className="text-primary text-xs sm:text-sm font-medium mb-3 sm:mb-4 tracking-wider uppercase">
              TRANSPARENCY. RELIABILITY. GRANDEUR
            </p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold gradient-gold bg-clip-text text-transparent">
              WE ARE COMMITTED TO EXCELLENCE
            </h2>
          </div>

          <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row justify-center gap-2 sm:gap-4">
            <Button variant="gold" className="text-xs sm:text-sm">MEGA JACKPOT</Button>
            <Button variant="outline" className="text-xs sm:text-sm">ROYAL JACKPOT</Button>
            <Button variant="outline" className="text-xs sm:text-sm">GOLD CARNIVAL JACKPOT</Button>
          </div>

          {/* Mobile-first responsive approach */}
          <div className="block sm:hidden">
            {/* Mobile Card Layout */}
            <div className="space-y-4">
              {recentWinners.map((winner, index) => (
                <Card key={index} className="bg-card border-border p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">{index + 1}</Badge>
                      <Badge variant="secondary" className="text-xs">{winner.place}</Badge>
                    </div>
                    <span className="text-sm font-bold text-primary">${winner.amount.toLocaleString()}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">Name:</span>
                      <span className="text-sm font-medium">{winner.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">Date:</span>
                      <span className="text-sm">{winner.date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">Ticket:</span>
                      <span className="text-sm">{winner.ticket}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">Country:</span>
                      <span className="text-sm">{winner.nationality}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Desktop Table Layout */}
          <div className="hidden sm:block overflow-x-auto">
            <Card className="bg-card border-border">
              <div className="overflow-hidden">
                <table className="w-full">
                  <thead className="bg-primary">
                    <tr>
                      <th className="px-3 lg:px-6 py-3 lg:py-4 text-left text-primary-foreground font-semibold text-xs lg:text-sm">SL. NO.</th>
                      <th className="px-3 lg:px-6 py-3 lg:py-4 text-left text-primary-foreground font-semibold text-xs lg:text-sm">PLACE</th>
                      <th className="px-3 lg:px-6 py-3 lg:py-4 text-left text-primary-foreground font-semibold text-xs lg:text-sm">NAME</th>
                      <th className="px-3 lg:px-6 py-3 lg:py-4 text-left text-primary-foreground font-semibold text-xs lg:text-sm">DRAW DATE</th>
                      <th className="px-3 lg:px-6 py-3 lg:py-4 text-left text-primary-foreground font-semibold text-xs lg:text-sm">PRIZE AMOUNT</th>
                      <th className="px-3 lg:px-6 py-3 lg:py-4 text-left text-primary-foreground font-semibold text-xs lg:text-sm">TICKET NO.</th>
                      <th className="px-3 lg:px-6 py-3 lg:py-4 text-left text-primary-foreground font-semibold text-xs lg:text-sm">NATIONALITY</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentWinners.map((winner, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-secondary/10' : 'bg-transparent'}>
                        <td className="px-3 lg:px-6 py-3 lg:py-4 text-foreground text-xs lg:text-sm">{index + 1}</td>
                        <td className="px-3 lg:px-6 py-3 lg:py-4 text-foreground text-xs lg:text-sm">{winner.place}</td>
                        <td className="px-3 lg:px-6 py-3 lg:py-4 text-foreground font-medium text-xs lg:text-sm">{winner.name}</td>
                        <td className="px-3 lg:px-6 py-3 lg:py-4 text-muted-foreground text-xs lg:text-sm">{winner.date}</td>
                        <td className="px-3 lg:px-6 py-3 lg:py-4 text-foreground font-semibold text-xs lg:text-sm">${winner.amount.toLocaleString()}</td>
                        <td className="px-3 lg:px-6 py-3 lg:py-4 text-muted-foreground text-xs lg:text-sm">{winner.ticket}</td>
                        <td className="px-3 lg:px-6 py-3 lg:py-4 text-foreground text-xs lg:text-sm">{winner.nationality}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default WinnersPage;