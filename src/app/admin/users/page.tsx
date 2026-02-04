'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { 
  Users, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Shield, 
  Truck,
  User,
  Eye,
  Ban
} from 'lucide-react'
import { toast } from 'sonner'

interface User {
  id: string
  name: string | null
  email: string | null
  phone: string
  role: string
  isVerified: boolean
  isKycVerified: boolean
  createdAt: string
  driverProfile?: {
    licenseNumber: string | null
    rcNumber: string | null
    isOnline: boolean
    truckCount: number
    ratingCount: number
  } | null
  customerBookingCount: number
  driverBookingCount: number
}

export default function AdminUsersPage() {
  const { data: session, status } = useSession()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated' || session?.user?.role !== 'ADMIN') {
      redirect('/')
    }
  }, [status, session])

  useEffect(() => {
    if (session?.user?.role === 'ADMIN') {
      fetchUsers()
    }
  }, [session])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
      toast.error('Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  const handleUserAction = async (userId: string, action: string, data?: any) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, action, data })
      })

      if (response.ok) {
        toast.success(`User ${action} successful`)
        fetchUsers() // Refresh the list
      } else {
        throw new Error('Action failed')
      }
    } catch (error) {
      toast.error(`Failed to ${action} user`)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.phone.includes(searchTerm)
    const matchesRole = roleFilter === 'all' || user.role === roleFilter.toUpperCase()
    return matchesSearch && matchesRole
  })

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    )
  }

  if (!session || session.user.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                <p className="text-sm text-gray-600">Manage all system users</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => window.location.href = '/dashboard'}>
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="customer">Customers</SelectItem>
                    <SelectItem value="driver">Drivers</SelectItem>
                    <SelectItem value="admin">Admins</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Users ({filteredUsers.length})</CardTitle>
            <CardDescription>Manage user accounts and permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Verification</TableHead>
                    <TableHead>Bookings</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.name || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{user.phone}</div>
                          {user.email && (
                            <div className="text-xs text-gray-400">{user.email}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={user.role === 'ADMIN' ? 'default' : 'secondary'}
                          className="capitalize"
                        >
                          {user.role.toLowerCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            {user.isVerified ? (
                              <CheckCircle className="h-3 w-3 text-green-500" />
                            ) : (
                              <XCircle className="h-3 w-3 text-red-500" />
                            )}
                            <span className="text-xs">Phone</span>
                          </div>
                          {user.role === 'DRIVER' && (
                            <div className="flex items-center gap-1">
                              {user.isKycVerified ? (
                                <CheckCircle className="h-3 w-3 text-green-500" />
                              ) : (
                                <XCircle className="h-3 w-3 text-red-500" />
                              )}
                              <span className="text-xs">KYC</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {user.customerBookingCount > 0 && (
                            <div>Customer: {user.customerBookingCount}</div>
                          )}
                          {user.driverBookingCount > 0 && (
                            <div>Driver: {user.driverBookingCount}</div>
                          )}
                          {(user.customerBookingCount === 0 && user.driverBookingCount === 0) && (
                            <div className="text-gray-400">None</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setSelectedUser(user)}
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>User Details</DialogTitle>
                                <DialogDescription>
                                  Detailed information about {user.name || user.phone}
                                </DialogDescription>
                              </DialogHeader>
                              {selectedUser && (
                                <div className="grid gap-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label>Name</Label>
                                      <p className="text-sm">{selectedUser.name || 'N/A'}</p>
                                    </div>
                                    <div>
                                      <Label>Phone</Label>
                                      <p className="text-sm">{selectedUser.phone}</p>
                                    </div>
                                    <div>
                                      <Label>Email</Label>
                                      <p className="text-sm">{selectedUser.email || 'N/A'}</p>
                                    </div>
                                    <div>
                                      <Label>Role</Label>
                                      <p className="text-sm capitalize">{selectedUser.role.toLowerCase()}</p>
                                    </div>
                                  </div>
                                  
                                  {selectedUser.driverProfile && (
                                    <div className="border-t pt-4">
                                      <h4 className="font-medium mb-2">Driver Profile</h4>
                                      <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                          <Label>License Number</Label>
                                          <p>{selectedUser.driverProfile.licenseNumber || 'N/A'}</p>
                                        </div>
                                        <div>
                                          <Label>RC Number</Label>
                                          <p>{selectedUser.driverProfile.rcNumber || 'N/A'}</p>
                                        </div>
                                        <div>
                                          <Label>Online Status</Label>
                                          <p>{selectedUser.driverProfile.isOnline ? 'Online' : 'Offline'}</p>
                                        </div>
                                        <div>
                                          <Label>Trucks</Label>
                                          <p>{selectedUser.driverProfile.truckCount} truck(s)</p>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>

                          {!user.isVerified && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleUserAction(user.id, 'verify')}
                            >
                              <CheckCircle className="h-3 w-3" />
                            </Button>
                          )}

                          {user.isVerified && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleUserAction(user.id, 'unverify')}
                            >
                              <Ban className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}