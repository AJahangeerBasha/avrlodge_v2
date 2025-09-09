import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, X, Edit, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { User as UserType } from '@supabase/supabase-js'

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
  user: UserType | null
  profile: any
  refreshUserData: () => Promise<void>
}

interface FormData {
  full_name: string
  email: string
  phone_number: string
  alternative_phone_number: string
}

export function ProfileModal({ isOpen, onClose, user, profile, refreshUserData }: ProfileModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const [formData, setFormData] = useState<FormData>({
    full_name: '',
    email: '',
    phone_number: '',
    alternative_phone_number: ''
  })

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        email: profile.email || '',
        phone_number: profile.phone_number || '',
        alternative_phone_number: profile.alternative_phone_number || ''
      })
    }
  }, [profile])

  const handleSave = async () => {
    if (!user) {
      console.error('No user found for profile update')
      toast({
        title: "Authentication Error",
        description: "No user found. Please sign in again.",
        variant: "destructive",
      })
      return
    }
    
    setIsLoading(true)
    try {
      console.log('Saving profile data:', formData)
      
      // Use API route instead of direct database calls
      const response = await fetch('/api/auth/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          full_name: formData.full_name,
          email: formData.email,
          phone_number: formData.phone_number,
          alternative_phone_number: formData.alternative_phone_number
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update profile')
      }

      console.log('Profile updated successfully:', result)
      setIsEditing(false)
      // Refresh user data
      await refreshUserData()
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      })
    } catch (error: any) {
      console.error('Error updating profile:', error)
      toast({
        title: "Profile Update Error",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-lg shadow-xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center space-x-3">
                <User className="w-6 h-6 text-gray-600" />
                <h2 className="text-xl font-semibold text-gray-900">Profile</h2>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <Label htmlFor="phone_number">Phone Number</Label>
                <Input
                  id="phone_number"
                  value={formData.phone_number}
                  onChange={(e) => handleInputChange('phone_number', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Enter your phone number"
                />
              </div>

              <div>
                <Label htmlFor="alternative_phone_number">Alternative Phone</Label>
                <Input
                  id="alternative_phone_number"
                  value={formData.alternative_phone_number}
                  onChange={(e) => handleInputChange('alternative_phone_number', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Enter alternative phone number"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                {!isEditing ? (
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="flex-1"
                    variant="outline"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={() => setIsEditing(false)}
                      className="flex-1"
                      variant="outline"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      className="flex-1"
                      disabled={isLoading}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 