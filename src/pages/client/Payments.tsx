import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, Plus, Trash2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import ClientLayout from '@/components/layouts/ClientLayout';

const Payments = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [newCard, setNewCard] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: '',
  });

  useEffect(() => {
    const fetchPaymentData = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          navigate('/login');
          return;
        }

        // Mock data for demonstration
        setPaymentMethods([
          {
            id: 'card_1',
            type: 'visa',
            last4: '4242',
            expMonth: 12,
            expYear: 24,
            name: 'John Doe',
            isDefault: true
          }
        ]);

        setPaymentHistory([
          {
            id: 'pay_1',
            amount: 49.99,
            status: 'completed',
            date: new Date().toISOString(),
            method: 'visa **** 4242',
            deliveryId: 'DEL-123456'
          },
          {
            id: 'pay_2',
            amount: 29.99,
            status: 'completed',
            date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            method: 'visa **** 4242',
            deliveryId: 'DEL-123455'
          }
        ]);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching payment data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load payment data',
          variant: 'destructive',
        });
      }
    };

    fetchPaymentData();
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewCard(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatCardNumber = (input: string) => {
    return input
      .replace(/\s/g, '')
      .match(/.{1,4}/g)
      ?.join(' ') || '';
  };

  const formatExpiry = (input: string) => {
    const cleaned = input.replace(/\D/g, '');
    if (cleaned.length > 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setNewCard(prev => ({ ...prev, number: formatted }));
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiry(e.target.value);
    setNewCard(prev => ({ ...prev, expiry: formatted }));
  };

  const addNewCard = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, this would call the Stripe API
    toast({
      title: 'Card Added',
      description: 'Your payment method has been added successfully',
    });
    
    // Reset form
    setNewCard({
      number: '',
      expiry: '',
      cvc: '',
      name: '',
    });
  };

  const removeCard = (id: string) => {
    // In a real app, this would call your API to remove the card
    setPaymentMethods(prev => prev.filter(method => method.id !== id));
    toast({
      title: 'Card Removed',
      description: 'Your payment method has been removed',
    });
  };

  const makeDefault = (id: string) => {
    setPaymentMethods(prev => 
      prev.map(method => ({
        ...method,
        isDefault: method.id === id
      }))
    );
    toast({
      title: 'Default Updated',
      description: 'Your default payment method has been updated',
    });
  };

  if (loading) {
    return (
      <ClientLayout>
        <div className="container px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <p>Loading payment information...</p>
          </div>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <div className="container px-4 py-8">
        <div className="flex flex-col space-y-8">
          <div>
            <h1 className="text-3xl font-bold">Payment Methods</h1>
            <p className="text-muted-foreground">Manage your payment options and view transaction history</p>
          </div>

          <Tabs defaultValue="methods">
            <TabsList className="mb-4">
              <TabsTrigger value="methods">Payment Methods</TabsTrigger>
              <TabsTrigger value="history">Payment History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="methods">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Existing Payment Methods */}
                <div>
                  <h2 className="text-lg font-medium mb-4">Saved Cards</h2>
                  {paymentMethods.length > 0 ? (
                    paymentMethods.map(method => (
                      <Card key={method.id} className="mb-4">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="bg-primary/10 p-2 rounded-md">
                                <CreditCard className="h-6 w-6 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium capitalize">{method.type} **** {method.last4}</p>
                                <p className="text-sm text-muted-foreground">
                                  Expires {method.expMonth}/{method.expYear}
                                </p>
                                {method.isDefault && (
                                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                    Default
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              {!method.isDefault && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => makeDefault(method.id)}
                                >
                                  Set Default
                                </Button>
                              )}
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="text-destructive"
                                onClick={() => removeCard(method.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Remove card</span>
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card className="bg-muted/50">
                      <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                        <CreditCard className="h-10 w-10 text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">No payment methods found</p>
                        <p className="text-xs text-muted-foreground">Add a new payment method to get started</p>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Add New Card Form */}
                <div>
                  <h2 className="text-lg font-medium mb-4">Add New Card</h2>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">New Payment Method</CardTitle>
                      <CardDescription>
                        Add a new credit or debit card
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={addNewCard} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Cardholder Name</Label>
                          <Input 
                            id="name" 
                            name="name"
                            placeholder="John Doe" 
                            value={newCard.name}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="number">Card Number</Label>
                          <Input 
                            id="number" 
                            name="number"
                            placeholder="1234 5678 9012 3456" 
                            value={newCard.number}
                            onChange={handleCardNumberChange}
                            maxLength={19}
                            required
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="expiry">Expiration Date</Label>
                            <Input 
                              id="expiry" 
                              name="expiry"
                              placeholder="MM/YY" 
                              value={newCard.expiry}
                              onChange={handleExpiryChange}
                              maxLength={5}
                              required
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="cvc">CVC</Label>
                            <Input 
                              id="cvc" 
                              name="cvc"
                              type="text" 
                              placeholder="123" 
                              value={newCard.cvc}
                              onChange={handleInputChange}
                              maxLength={4}
                              required
                            />
                          </div>
                        </div>
                        
                        <CardFooter className="px-0 pt-4">
                          <Button type="submit" className="w-full">
                            <Plus className="h-4 w-4 mr-2" /> Add Card
                          </Button>
                        </CardFooter>
                      </form>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Transaction History</CardTitle>
                  <CardDescription>
                    All your past transactions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {paymentHistory.length > 0 ? (
                    <div className="rounded-md border">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-muted/50">
                              <th className="py-3 px-4 text-left font-medium">Date</th>
                              <th className="py-3 px-4 text-left font-medium">Amount</th>
                              <th className="py-3 px-4 text-left font-medium">Method</th>
                              <th className="py-3 px-4 text-left font-medium">Delivery ID</th>
                              <th className="py-3 px-4 text-left font-medium">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {paymentHistory.map(payment => (
                              <tr key={payment.id} className="border-t">
                                <td className="py-3 px-4">
                                  {new Date(payment.date).toLocaleDateString()}
                                </td>
                                <td className="py-3 px-4">
                                  ${payment.amount.toFixed(2)}
                                </td>
                                <td className="py-3 px-4">
                                  {payment.method}
                                </td>
                                <td className="py-3 px-4">
                                  {payment.deliveryId}
                                </td>
                                <td className="py-3 px-4">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    {payment.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No transactions found</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ClientLayout>
  );
};

export default Payments;