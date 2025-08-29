import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DashboardSidebar from "@/components/DashboardSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { userAPI } from "@/services/api";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [memberId, setMemberId] = useState("");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setPhone(user.phone || "");
      setEmail(user.email || "");
      setMemberId(user.memberId || String(user.id || ""));
    }
  }, [user]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      // Validate phone: optional, but if present must be 10 digits
      const trimmedPhone = phone.trim();
      if (trimmedPhone && !/^\d{10}$/.test(trimmedPhone)) {
        toast({
          title: "Invalid mobile number",
          description: "Please enter a 10-digit mobile number.",
        });
        setSaving(false);
        return;
      }
      const payload: any = {};
      if (firstName !== (user?.firstName || "")) payload.firstName = firstName;
      if (lastName !== (user?.lastName || "")) payload.lastName = lastName;
      if (phone !== (user?.phone || "")) payload.phone = trimmedPhone;

      const res = await userAPI.updateProfile(payload);
      updateUser(res.data.user);
      toast({ title: "Profile updated", description: "Your changes have been saved." });
    } catch (err) {
      console.error("Failed to update profile", err);
      toast({ title: "Update failed", description: "Could not save your profile.", variant: "destructive" as any });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <div className="flex flex-col lg:flex-row pt-16 sm:pt-20">
        <DashboardSidebar />
        <div className="flex-1 min-w-0">
          <section className="p-3 sm:p-4 lg:p-6">
            <div className="container mx-auto max-w-3xl">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">My Profile</h2>
                <form onSubmit={onSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="memberId">User ID</Label>
                      <Input id="memberId" value={memberId} readOnly />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" value={email} readOnly />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phone">Mobile Number</Label>
                    <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="10-digit number" />
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
                  </div>
                </form>
              </Card>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProfilePage;


