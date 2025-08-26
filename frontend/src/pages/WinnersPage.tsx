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
      <section className="pt-20 pb-16 bg-gradient-to-br from-background via-secondary/10 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              <span className="gradient-gold bg-clip-text text-transparent">
                WINNERS
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Explore the stories of triumph and fortune with our celebrated winners at Gold Carnival.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Winner */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold gradient-gold bg-clip-text text-transparent mb-4">
              OUR WINNER'S CLUB
            </h2>
            <p className="text-muted-foreground">
              Ordinary folks with extraordinary winning stories
            </p>
          </div>

          <div className="max-w-4xl mx-auto mb-12">
            <Card className="bg-card border-primary p-8 shadow-gold">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="relative">
                  <div className="absolute -top-4 left-4 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-bold">
                    {featuredWinner.jackpot}
                  </div>
                  <div className="bg-secondary/20 rounded-lg p-8 text-center">
                    <Avatar className="w-32 h-32 mx-auto mb-4">
                      <AvatarFallback className="gradient-gold text-primary-foreground text-4xl font-bold">
                        {featuredWinner.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2 text-sm">
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
                        <div className="flex justify-between items-center">
                          <span className="text-primary font-semibold">WINNING AMOUNT:</span>
                          <span className="text-2xl font-bold text-primary">${featuredWinner.amount.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    We cherish all our winners, who with their grit and perseverance have shown that extraordinary 
                    stories can have humble beginnings. We strive to create more winners and provide everyone 
                    with ample opportunities to make it to the winner's list.
                  </p>
                  <Button variant="gold" size="lg">
                    Watch More
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Ticket Sales Stats */}
      <section className="py-16 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-primary text-sm font-medium mb-4 tracking-wider uppercase">
              TICKET SALES
            </p>
            <h2 className="text-3xl lg:text-4xl font-bold gradient-gold bg-clip-text text-transparent">
              TOTAL TICKETS SOLD IN MAY
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
            {ticketStats.map((stat, index) => (
              <Card key={index} className="bg-white text-black p-8 text-center">
                <h3 className="text-xl font-bold mb-4">{stat.type}</h3>
                <p className="text-3xl font-bold text-gray-800">{stat.sold}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Winners Table */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-primary text-sm font-medium mb-4 tracking-wider uppercase">
              TRANSPARENCY. RELIABILITY. GRANDEUR
            </p>
            <h2 className="text-3xl lg:text-4xl font-bold gradient-gold bg-clip-text text-transparent">
              WE ARE COMMITTED TO EXCELLENCE
            </h2>
          </div>

          <div className="mb-8 flex justify-center space-x-4">
            <Button variant="gold">MEGA JACKPOT</Button>
            <Button variant="outline">ROYAL JACKPOT</Button>
            <Button variant="outline">GOLD CARNIVAL JACKPOT</Button>
          </div>

          <div className="overflow-x-auto">
            <Card className="bg-card border-border">
              <div className="overflow-hidden">
                <table className="w-full">
                  <thead className="bg-primary">
                    <tr>
                      <th className="px-6 py-4 text-left text-primary-foreground font-semibold">SL. NO.</th>
                      <th className="px-6 py-4 text-left text-primary-foreground font-semibold">PLACE</th>
                      <th className="px-6 py-4 text-left text-primary-foreground font-semibold">NAME</th>
                      <th className="px-6 py-4 text-left text-primary-foreground font-semibold">DRAW DATE</th>
                      <th className="px-6 py-4 text-left text-primary-foreground font-semibold">PRIZE AMOUNT</th>
                      <th className="px-6 py-4 text-left text-primary-foreground font-semibold">TICKET NO.</th>
                      <th className="px-6 py-4 text-left text-primary-foreground font-semibold">NATIONALITY</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentWinners.map((winner, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-secondary/10' : 'bg-transparent'}>
                        <td className="px-6 py-4 text-foreground">{index + 1}</td>
                        <td className="px-6 py-4 text-foreground">{winner.place}</td>
                        <td className="px-6 py-4 text-foreground font-medium">{winner.name}</td>
                        <td className="px-6 py-4 text-muted-foreground">{winner.date}</td>
                        <td className="px-6 py-4 text-foreground font-semibold">${winner.amount.toLocaleString()}</td>
                        <td className="px-6 py-4 text-muted-foreground">{winner.ticket}</td>
                        <td className="px-6 py-4 text-foreground">{winner.nationality}</td>
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