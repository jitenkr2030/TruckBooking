'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { CreditCard, Smartphone, Wallet, Building, CheckCircle, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface PaymentFormProps {
  amount: number
  bookingId: string
  onSuccess: () => void
  onCancel: () => void
}

export function PaymentForm({ amount, bookingId, onSuccess, onCancel }: PaymentFormProps) {
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('UPI')
  const [formData, setFormData] = useState({
    upiId: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    cardName: '',
    walletNumber: '',
    corporateCode: ''
  })

  const paymentMethods = [
    { id: 'UPI', name: 'UPI', icon: Smartphone, description: 'Pay using UPI apps' },
    { id: 'CARD', name: 'Credit/Debit Card', icon: CreditCard, description: 'Visa, Mastercard, Rupay' },
    { id: 'WALLET', name: 'Wallet', icon: Wallet, description: 'Paytm, PhonePe, Amazon Pay' },
    { id: 'CORPORATE', name: 'Corporate Credit', icon: Building, description: 'Monthly billing for businesses' }
  ]

  const handlePayment = async () => {
    setLoading(true)
    try {
      // Validate form data based on payment method
      if (paymentMethod === 'UPI' && !formData.upiId) {
        throw new Error('Please enter UPI ID')
      }
      if (paymentMethod === 'CARD' && (!formData.cardNumber || !formData.cardExpiry || !formData.cardCvv)) {
        throw new Error('Please complete card details')
      }
      if (paymentMethod === 'WALLET' && !formData.walletNumber) {
        throw new Error('Please enter wallet number')
      }
      if (paymentMethod === 'CORPORATE' && !formData.corporateCode) {
        throw new Error('Please enter corporate code')
      }

      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bookingId,
          amount,
          paymentMethod,
          paymentDetails: formData
        })
      })

      if (response.ok) {
        const result = await response.json()
        toast.success('Payment successful!')
        onSuccess()
      } else {
        throw new Error('Payment failed')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Payment failed')
    } finally {
      setLoading(false)
    }
  }

  const renderPaymentForm = () => {
    switch (paymentMethod) {
      case 'UPI':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="upi-id">UPI ID</Label>
              <Input
                id="upi-id"
                placeholder="username@upi"
                value={formData.upiId}
                onChange={(e) => setFormData(prev => ({ ...prev, upiId: e.target.value }))}
              />
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                You will receive a payment request on your UPI app. Complete the payment to confirm your booking.
              </p>
            </div>
          </div>
        )

      case 'CARD':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="card-name">Cardholder Name</Label>
              <Input
                id="card-name"
                placeholder="John Doe"
                value={formData.cardName}
                onChange={(e) => setFormData(prev => ({ ...prev, cardName: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="card-number">Card Number</Label>
              <Input
                id="card-number"
                placeholder="1234 5678 9012 3456"
                value={formData.cardNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, cardNumber: e.target.value }))}
                maxLength={19}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="card-expiry">Expiry Date</Label>
                <Input
                  id="card-expiry"
                  placeholder="MM/YY"
                  value={formData.cardExpiry}
                  onChange={(e) => setFormData(prev => ({ ...prev, cardExpiry: e.target.value }))}
                  maxLength={5}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="card-cvv">CVV</Label>
                <Input
                  id="card-cvv"
                  placeholder="123"
                  value={formData.cardCvv}
                  onChange={(e) => setFormData(prev => ({ ...prev, cardCvv: e.target.value }))}
                  maxLength={3}
                  type="password"
                />
              </div>
            </div>
          </div>
        )

      case 'WALLET':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="wallet-provider">Select Wallet</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Choose your wallet" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paytm">Paytm</SelectItem>
                  <SelectItem value="phonepe">PhonePe</SelectItem>
                  <SelectItem value="amazonpay">Amazon Pay</SelectItem>
                  <SelectItem value="mobikwik">MobiKwik</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="wallet-number">Mobile Number</Label>
              <Input
                id="wallet-number"
                placeholder="9876543210"
                value={formData.walletNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, walletNumber: e.target.value }))}
                maxLength={10}
              />
            </div>
          </div>
        )

      case 'CORPORATE':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="corporate-code">Corporate Code</Label>
              <Input
                id="corporate-code"
                placeholder="CORP123456"
                value={formData.corporateCode}
                onChange={(e) => setFormData(prev => ({ ...prev, corporateCode: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="billing-email">Billing Email</Label>
              <Input
                id="billing-email"
                type="email"
                placeholder="billing@company.com"
              />
            </div>
            <div className="bg-amber-50 p-3 rounded-lg">
              <p className="text-sm text-amber-800">
                Corporate accounts are billed monthly. An invoice will be sent to your billing email.
              </p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Complete Payment</CardTitle>
        <CardDescription>
          Choose your preferred payment method to complete the booking
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Amount Summary */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium">Total Amount</span>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              ₹{amount.toFixed(2)}
            </Badge>
          </div>
        </div>

        {/* Payment Method Selection */}
        <div className="space-y-4">
          <Label>Payment Method</Label>
          <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
            {paymentMethods.map((method) => (
              <div key={method.id} className="flex items-center space-x-2">
                <RadioGroupItem value={method.id} id={method.id} />
                <Label htmlFor={method.id} className="flex items-center gap-3 cursor-pointer flex-1">
                  <method.icon className="h-5 w-5" />
                  <div>
                    <div className="font-medium">{method.name}</div>
                    <div className="text-sm text-gray-500">{method.description}</div>
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Payment Form */}
        {renderPaymentForm()}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button 
            variant="outline" 
            onClick={onCancel}
            disabled={loading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button 
            onClick={handlePayment} 
            disabled={loading}
            className="flex-1"
          >
            {loading ? 'Processing...' : `Pay ₹${amount.toFixed(2)}`}
          </Button>
        </div>

        {/* Security Notice */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span>Your payment information is secure and encrypted</span>
        </div>
      </CardContent>
    </Card>
  )
}