
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CreditCard, Bitcoin, Wallet } from "lucide-react";

interface StripePaymentFormProps {
  amount: number;
  deliveryId: number;
  onSuccess: () => void;
  onCancel: () => void;
}

const StripePaymentForm = ({ amount, deliveryId, onSuccess, onCancel }: StripePaymentFormProps) => {
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "crypto">("card");
  const [cardInfo, setCardInfo] = useState({
    name: "",
    number: "",
    expiry: "",
    cvc: ""
  });
  const [walletAddress, setWalletAddress] = useState("");
  const [showQrDialog, setShowQrDialog] = useState(false);
  const [walletType, setWalletType] = useState("bitcoin");
  
  const handleCardInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Format card number with spaces
    if (name === "number") {
      const formattedValue = value
        .replace(/\s/g, "") // Remove existing spaces
        .replace(/(.{4})/g, "$1 ") // Add space after every 4 chars
        .trim(); // Remove trailing space
      
      setCardInfo({
        ...cardInfo,
        [name]: formattedValue
      });
      return;
    }
    
    // Format expiry date with slash
    if (name === "expiry") {
      const cleaned = value.replace(/\D/g, "");
      
      if (cleaned.length <= 2) {
        setCardInfo({
          ...cardInfo,
          [name]: cleaned
        });
      } else {
        const month = cleaned.substring(0, 2);
        const year = cleaned.substring(2, 4);
        setCardInfo({
          ...cardInfo,
          [name]: `${month}/${year}`
        });
      }
      return;
    }
    
    setCardInfo({
      ...cardInfo,
      [name]: value
    });
  };

  const handleProcessCardPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // This would be replaced with actual Stripe integration
      // For now, simulate API call with a timeout
      const token = localStorage.getItem("auth_token");
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const response = await fetch(`http://localhost:8000/api/payments/process`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          delivery_id: deliveryId,
          amount,
          payment_method: "card",
          card_info: {
            name: cardInfo.name,
            number: cardInfo.number.replace(/\s/g, ""),
            expiry: cardInfo.expiry,
            cvc: cardInfo.cvc
          }
        }),
      });
      
      if (!response.ok) {
        throw new Error("Payment processing failed");
      }
      
      toast({
        title: "Payment Successful",
        description: `Payment of $${amount.toFixed(2)} was processed successfully`,
      });
      
      onSuccess();
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : "Failed to process payment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProcessCryptoPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!walletType) {
      toast({
        title: "Select Wallet Type",
        description: "Please select a cryptocurrency wallet type",
        variant: "destructive",
      });
      return;
    }
    
    setShowQrDialog(true);
  };

  const confirmCryptoPayment = async () => {
    setLoading(true);
    setShowQrDialog(false);
    
    try {
      // This would be replaced with actual crypto payment verification
      const token = localStorage.getItem("auth_token");
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const response = await fetch(`http://localhost:8000/api/payments/verify-crypto`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          delivery_id: deliveryId,
          amount,
          wallet_type: walletType,
          wallet_address: walletAddress,
          transaction_id: "sample_tx_id" // In real-world, this would come from the wallet
        }),
      });
      
      if (!response.ok) {
        throw new Error("Crypto payment verification failed");
      }
      
      toast({
        title: "Payment Successful",
        description: `Crypto payment of $${amount.toFixed(2)} equivalent was verified successfully`,
      });
      
      onSuccess();
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : "Failed to verify crypto payment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="py-4">
        <div className="mb-4 flex justify-between items-center">
          <h3 className="text-lg font-medium">Total Amount:</h3>
          <p className="text-xl font-bold">${amount.toFixed(2)}</p>
        </div>

        <Tabs defaultValue="card" onValueChange={(value) => setPaymentMethod(value as "card" | "crypto")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="card" className="flex items-center justify-center">
              <CreditCard className="h-4 w-4 mr-2" />
              Credit Card
            </TabsTrigger>
            <TabsTrigger value="crypto" className="flex items-center justify-center">
              <Bitcoin className="h-4 w-4 mr-2" />
              Cryptocurrency
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="card">
            <form onSubmit={handleProcessCardPayment} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Cardholder Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="John Doe"
                  value={cardInfo.name}
                  onChange={handleCardInfoChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="number">Card Number</Label>
                <Input
                  id="number"
                  name="number"
                  placeholder="4242 4242 4242 4242"
                  value={cardInfo.number}
                  onChange={handleCardInfoChange}
                  maxLength={19}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiry">Expiry Date</Label>
                  <Input
                    id="expiry"
                    name="expiry"
                    placeholder="MM/YY"
                    value={cardInfo.expiry}
                    onChange={handleCardInfoChange}
                    maxLength={5}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cvc">CVC</Label>
                  <Input
                    id="cvc"
                    name="cvc"
                    placeholder="123"
                    value={cardInfo.cvc}
                    onChange={handleCardInfoChange}
                    maxLength={3}
                    required
                  />
                </div>
              </div>
              
              <div className="pt-2 flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Processing..." : "Pay Now"}
                </Button>
              </div>
            </form>
          </TabsContent>
          
          <TabsContent value="crypto">
            <form onSubmit={handleProcessCryptoPayment} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Select Cryptocurrency</Label>
                <RadioGroup 
                  value={walletType} 
                  onValueChange={setWalletType}
                  className="flex flex-col space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="bitcoin" id="bitcoin" />
                    <Label htmlFor="bitcoin" className="flex items-center">
                      <Bitcoin className="h-4 w-4 mr-2" />
                      Bitcoin
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="ethereum" id="ethereum" />
                    <Label htmlFor="ethereum" className="flex items-center">
                      <Wallet className="h-4 w-4 mr-2" />
                      Ethereum
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="pt-2 flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
                <Button type="submit">
                  Continue with Crypto
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </div>
      
      <Dialog open={showQrDialog} onOpenChange={setShowQrDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Scan to Pay</DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col items-center space-y-4 p-4">
            <div className="border-2 border-dashed border-gray-200 p-4 rounded-md">
              {/* Placeholder for QR code - in a real app, generate an actual QR code */}
              <div className="w-48 h-48 bg-gray-100 flex items-center justify-center">
                <span className="text-muted-foreground">QR Code Placeholder</span>
              </div>
            </div>
            
            <div className="w-full">
              <Label htmlFor="wallet-address">Your {walletType.charAt(0).toUpperCase() + walletType.slice(1)} Address</Label>
              <Input
                id="wallet-address"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder={`Enter your ${walletType} address`}
                className="mt-1"
              />
            </div>
            
            <div className="text-sm text-muted-foreground text-center">
              <p>Please send {amount.toFixed(2)} USD equivalent to the above address.</p>
              <p>After sending, click the Confirm Payment button below.</p>
            </div>
            
            <div className="flex justify-end space-x-2 w-full">
              <Button
                variant="outline"
                onClick={() => setShowQrDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={confirmCryptoPayment} disabled={loading}>
                {loading ? "Verifying..." : "Confirm Payment"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default StripePaymentForm;
