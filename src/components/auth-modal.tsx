'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X, Phone, Mail, User, Shield } from 'lucide-react'
import { toast } from 'sonner'

interface AuthModalProps {
  onClose: () => void
}

export function AuthModal({ onClose }: AuthModalProps) {
  const [loading, setLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [formData, setFormData] = useState({
    phone: '',
    email: '',
    name: '',
    role: 'CUSTOMER',
    otp: ''
  })

  const sendOtp = async () => {
    if (!formData.phone || formData.phone.length !== 10) {
      toast.error('Please enter a valid 10-digit phone number')
      return
    }

    setLoading(true)
    try {
      // Mock OTP sending - in production, this would call an SMS service
      await new Promise(resolve => setTimeout(resolve, 1000))
      setOtpSent(true)
      toast.success('OTP sent successfully! (Use any 6-digit code for demo)')
    } catch (error) {
      toast.error('Failed to send OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const verifyOtp = async () => {
    if (!formData.otp || formData.otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP')
      return
    }

    setLoading(true)
    try {
      const result = await signIn('credentials', {
        phone: formData.phone,
        otp: formData.otp,
        redirect: false
      })

      if (result?.ok) {
        toast.success('Login successful!')
        onClose()
      } else {
        toast.error('Invalid OTP. Please try again.')
      }
    } catch (error) {
      toast.error('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const register = async () => {
    if (!formData.phone || formData.phone.length !== 10) {
      toast.error('Please enter a valid 10-digit phone number')
      return
    }

    if (!formData.name) {
      toast.error('Please enter your name')
      return
    }

    setLoading(true)
    try {
      // First send OTP for verification
      await new Promise(resolve => setTimeout(resolve, 1000))
      setOtpSent(true)
      toast.success('OTP sent for verification! (Use any 6-digit code for demo)')
    } catch (error) {
      toast.error('Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md relative">
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-4 top-4"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>

        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle>Welcome to TruckBooking</CardTitle>
          <CardDescription>
            Sign in or create an account to book trucks
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone Number
                </Label>
                <Input
                  id="signin-phone"
                  type="tel"
                  placeholder="Enter 10-digit phone number"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  maxLength={10}
                  disabled={otpSent}
                />
              </div>

              {!otpSent ? (
                <Button onClick={sendOtp} disabled={loading} className="w-full">
                  {loading ? 'Sending OTP...' : 'Send OTP'}
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-otp">Enter OTP</Label>
                    <Input
                      id="signin-otp"
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      value={formData.otp}
                      onChange={(e) => setFormData(prev => ({ ...prev, otp: e.target.value }))}
                      maxLength={6}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={verifyOtp} disabled={loading} className="flex-1">
                      {loading ? 'Verifying...' : 'Verify OTP'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setOtpSent(false)}
                      disabled={loading}
                    >
                      Change Number
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Full Name
                </Label>
                <Input
                  id="signup-name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  disabled={otpSent}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone Number
                </Label>
                <Input
                  id="signup-phone"
                  type="tel"
                  placeholder="Enter 10-digit phone number"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  maxLength={10}
                  disabled={otpSent}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email (Optional)
                </Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  disabled={otpSent}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-role">I am a</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
                  disabled={otpSent}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CUSTOMER">Customer (Shipper)</SelectItem>
                    <SelectItem value="DRIVER">Truck Owner/Driver</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {!otpSent ? (
                <Button onClick={register} disabled={loading} className="w-full">
                  {loading ? 'Sending OTP...' : 'Create Account'}
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-otp">Enter OTP</Label>
                    <Input
                      id="signup-otp"
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      value={formData.otp}
                      onChange={(e) => setFormData(prev => ({ ...prev, otp: e.target.value }))}
                      maxLength={6}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={verifyOtp} disabled={loading} className="flex-1">
                      {loading ? 'Verifying...' : 'Verify & Create Account'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setOtpSent(false)}
                      disabled={loading}
                    >
                      Back
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>For demo: Use any 6-digit code as OTP</p>
            <p className="mt-1">By continuing, you agree to our Terms & Privacy Policy</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}