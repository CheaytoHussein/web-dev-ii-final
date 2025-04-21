
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // API call to Laravel backend
      const response = await fetch("http://localhost:8000/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: "Reset email sent",
          description: "Check your inbox for password reset instructions",
        });
        setSent(true);
      } else {
        throw new Error(data.message || "Failed to send reset email");
      }
    } catch (error) {
      console.error("Failed to send reset email:", error);
      toast({
        title: "Failed to send reset email",
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
          <CardTitle className="text-2xl">Reset Your Password</CardTitle>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="text-center py-4">
              <p className="mb-4 text-muted-foreground">
                We've sent password reset instructions to <strong>{email}</strong>. 
                Please check your inbox and follow the instructions.
              </p>
              <Button asChild className="mt-4">
                <Link to="/login">Return to Login</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" disabled={loading}>
                  {loading ? "Sending..." : "Send Reset Instructions"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
        {!sent && (
          <CardFooter className="flex justify-center">
            <div className="text-sm text-muted-foreground">
              Remember your password?{" "}
              <Link to="/login" className="text-primary hover:underline">
                Back to Login
              </Link>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default ForgotPassword;
