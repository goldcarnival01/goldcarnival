import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react";
import Header from "@/components/Header";
import ticketIcon from "@/assets/ticket-icon.png";
import axios from "axios";

const EmailVerificationPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [showManualVerification, setShowManualVerification] = useState(false);
  const [email, setEmail] = useState('');
  const token = searchParams.get('token');

  // Use the correct API URL
  const API_BASE_URL = import.meta.env.VITE_API_URL 
    ? `${import.meta.env.VITE_API_URL}/api`
    : 'http://localhost:3000/api';

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link. No token provided.');
        setShowManualVerification(true);
        return;
      }

      try {
        const response = await axios.get(
          `${API_BASE_URL}/auth/verify-email?token=${token}`
        );
        
        setStatus('success');
        setMessage(response.data.message);
      } catch (error: any) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Email verification failed. Please try again.');
        setShowManualVerification(true);
      }
    };

    verifyEmail();
  }, [token, API_BASE_URL]);

  const handleManualVerification = async () => {
    if (!email) {
      setMessage('Please enter your email address.');
      return;
    }

    setStatus('loading');
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/verify-email-manual`, { email });
      setStatus('success');
      setMessage(response.data.message);
    } catch (error: any) {
      setStatus('error');
      setMessage(error.response?.data?.message || 'Manual verification failed.');
    }
  };

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-background">
      <Header />
      
      <div className="flex items-center justify-center min-h-screen pt-20 pb-8">
        <div className="w-full max-w-md mx-4">
          {/* Logo */}
          <div className="text-center mb-8">
            <img src={ticketIcon} alt="Gold Carnival" className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-2xl font-bold gradient-gold bg-clip-text text-transparent">
              GOLD CARNIVAL
            </h1>
          </div>

          <Card className="bg-card/80 backdrop-blur-sm border-border p-8 text-center">
            {status === 'loading' && (
              <>
                <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin text-primary" />
                <h2 className="text-xl font-semibold mb-2 text-foreground">
                  Verifying Your Email
                </h2>
                <p className="text-muted-foreground">
                  Please wait while we verify your email address...
                </p>
              </>
            )}

            {status === 'success' && (
              <>
                <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                <h2 className="text-xl font-semibold mb-2 text-foreground">
                  Email Verified Successfully!
                </h2>
                <p className="text-muted-foreground mb-6">
                  {message}
                </p>
                <Button 
                  onClick={handleLoginRedirect}
                  variant="gold" 
                  className="w-full text-base font-semibold"
                >
                  LOGIN NOW
                </Button>
              </>
            )}

            {status === 'error' && (
              <>
                <XCircle className="w-16 h-16 mx-auto mb-4 text-destructive" />
                <h2 className="text-xl font-semibold mb-2 text-foreground">
                  Verification Failed
                </h2>
                <p className="text-muted-foreground mb-6">
                  {message}
                </p>
                
                {showManualVerification && (
                  <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center mb-3">
                      <Mail className="w-5 h-5 text-yellow-600 mr-2" />
                      <span className="text-sm font-medium text-yellow-800">
                        Manual Verification
                      </span>
                    </div>
                    <p className="text-sm text-yellow-700 mb-3">
                      If you're having trouble with the email link, you can verify manually:
                    </p>
                    <input
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded mb-3"
                    />
                    <Button 
                      onClick={handleManualVerification}
                      variant="outline" 
                      className="w-full text-sm"
                    >
                      Verify Manually
                    </Button>
                  </div>
                )}
                
                <div className="space-y-3">
                  <Button 
                    onClick={handleLoginRedirect}
                    variant="gold" 
                    className="w-full text-base font-semibold"
                  >
                    GO TO LOGIN
                  </Button>
                  <Button 
                    onClick={() => navigate('/')}
                    variant="outline" 
                    className="w-full text-base"
                  >
                    GO TO HOME
                  </Button>
                </div>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPage;
