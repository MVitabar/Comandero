"use client"

import { useState } from "react"
import { useFirebase } from "@/components/firebase-provider"
import { useAuth } from "@/components/auth-provider"
import { doc, setDoc, collection } from "firebase/firestore"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AddTeamMemberPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    role: "waiter" // Default role
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { db, auth } = useFirebase()
  const { user } = useAuth()
  const { toast } = useToast()

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

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!validateForm()) return

    // Ensure we have a logged-in user and Firestore is initialized
    if (!user || !db || !auth) {
      toast({
        title: "Error",
        description: "Authentication or database service is unavailable",
        variant: "destructive"
      })
      return
    }

    setLoading(true)

    try {
      // Generate a temporary password
      const tempPassword = Math.random().toString(36).slice(-8)

      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        tempPassword
      )

      const newTeamMember = userCredential.user

      // Add team member to restaurant's users subcollection
      await setDoc(doc(db, "restaurants", user.uid, "users", newTeamMember.uid), {
        uid: newTeamMember.uid,
        username: formData.username,
        email: formData.email,
        role: formData.role,
        status: "active",
        addedBy: user.uid,
        createdAt: new Date()
      })

      toast({
        title: "Team Member Added",
        description: `${formData.username} has been added to your team`,
      })

      // Reset form
      setFormData({
        username: "",
        email: "",
        role: "waiter"
      })
    } catch (error: any) {
      console.error("Error adding team member:", error)

      // Handle specific Firebase errors
      const errorMessage = error.code === 'auth/email-already-in-use' 
        ? "This email is already in use" 
        : error.message || "Failed to add team member"

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
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
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                className="w-full p-2 border rounded"
                disabled={loading}
              >
                <option value="waiter">Waiter</option>
                <option value="chef">Chef</option>
                <option value="manager">Manager</option>
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