"use client"

import { useState } from "react"
import { useAuth } from "@/components/auth-provider"
import {toast} from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserRole } from "@/types/permissions"
import { createTeamMember, CurrentUser } from "@/lib/user-management"
import { useNotifications } from "@/hooks/useNotifications"

export default function AddTeamMemberPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: UserRole.WAITER // Default role
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { user } = useAuth()
  const { sendNotification } = useNotifications();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    
    // Clear any existing errors for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.username.trim()) {
      newErrors.username = "Username is required"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format"
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!validateForm()) return

    // Ensure we have a logged-in user
    if (!user) {
      toast.error("You must be logged in to add a team member")
      return
    }

    setLoading(true)

    try {
      console.group('🔍 Add Team Member Debug');
      console.log('Full User Object:', JSON.stringify(user, null, 2));
      console.log('User Properties:', {
        uid: user?.uid,
        establishmentId: user?.establishmentId,
        currentEstablishmentName: user?.currentEstablishmentName,
        role: user?.role
      });

      // Validate user object before passing
      if (!user) {
        console.error('No user object available');
        throw new Error('No authenticated user found');
      }

      // Ensure all required properties are present
      const userToPass = {
        uid: user.uid,
        role: user.role,
        establishmentId: user.establishmentId,
        currentEstablishmentName: user.currentEstablishmentName,
        // Add any other properties you know should be present
      };

      console.log('Processed User Object:', JSON.stringify(userToPass, null, 2));

      await createTeamMember(user as unknown as CurrentUser, {
        email: formData.email,
        password: formData.password,
        username: formData.username,
        role: formData.role,
        establishmentName: user?.currentEstablishmentName || '',
        establishmentId: user?.establishmentId
      });

      console.groupEnd(); // Close debug group

      toast.success("Team member added successfully")
      await sendNotification({
        title: "Nuevo miembro agregado",
        message: `Se agregó a ${formData.username} al equipo`,
        url: window.location.href,
      });
      setFormData({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: UserRole.WAITER
      })
    } catch (error: any) {
      console.error("Error adding team member:", error)

      const errorMessage = 
        error.code === 'auth/email-already-in-use' 
          ? "This email is already in use" 
          : error.message || "Failed to add team member"

      toast.error(errorMessage)
      setErrors((prev) => ({ ...prev, email: errorMessage }))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10">
      <Card>
        <CardHeader>
          <CardTitle>Add Team Member</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                disabled={loading}
                className={errors.username ? "border-red-500" : ""}
              />
              {errors.username && <p className="text-red-500 text-sm">{errors.username}</p>}
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                className={errors.password ? "border-red-500" : ""}
              />
              {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading}
                className={errors.confirmPassword ? "border-red-500" : ""}
              />
              {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}
            </div>

            <div>
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as UserRole }))}
                className="w-full p-2 border rounded"
                disabled={loading}
              >
                {Object.values(UserRole).map(role => (
                  <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>
                ))}
              </select>
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Team Member"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}