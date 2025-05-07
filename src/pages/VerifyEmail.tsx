
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    // Get email from location state or from localStorage
    const stateEmail = location.state?.email;
    const storedEmail = localStorage.getItem("pending_verification_email");
    
    if (stateEmail) {
      setEmail(stateEmail);
      localStorage.setItem("pending_verification_email", stateEmail);
    } else if (storedEmail) {
      setEmail(storedEmail);
    } else {
      // If no email is found, redirect to login
      navigate("/login");
    }
  }, [location.state, navigate]);

  useEffect(() => {
    // Cooldown timer for resend button
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a valid 6-digit OTP",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      // API call to Laravel backend
      const response = await fetch("http://localhost:8000/api/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          otp
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: "Email verified",
          description: "Your email has been successfully verified",
        });
        
        // Clear the pending verification email
        localStorage.removeItem("pending_verification_email");
        
        // Redirect to login
        navigate("/login");
      } else {
        throw new Error(data.message || "Verification failed");
      }
    } catch (error) {
      console.error("Verification failed:", error);
      toast({
        title: "Verification failed",
        description: error instanceof Error ? error.message : "Please check your OTP and try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    
    try {
      // API call to Laravel backend
      const response = await fetch("http://localhost:8000/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: "OTP resent",
          description: "A new OTP has been sent to your email",
        });
        
        // Start cooldown for resend button
        setResendCooldown(60);
      } else {
        throw new Error(data.message || "Failed to resend OTP");
      }
    } catch (error) {
      console.error("Failed to resend OTP:", error);
      toast({
        title: "Failed to resend OTP",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto flex items-center justify-center min-h-screen px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Verify Your Email</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-muted-foreground">
            We've sent a verification code to <strong>{email}</strong>. Please enter the code below.
          </p>
          <div className="grid gap-4">
            <div className="flex justify-center mb-4">
              <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <Button onClick={handleVerify} disabled={loading || otp.length !== 6}>
              {loading ? "Verifying..." : "Verify Email"}
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <div className="text-sm text-muted-foreground">
            Didn't receive the code?{" "}
            <Button 
              variant="link" 
              className="p-0"
              onClick={handleResendOTP}
              disabled={resendCooldown > 0 || loading}
            >
              {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : "Resend"}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default VerifyEmail;
