"use client"

import type React from "react"
import { useParams } from "react-router-dom"

import { useEffect, useState } from "react"
import AvatarUpload from "../components/AvatarUpload"
import Button from "@components/ui/Button"
import InputField from "@components/ui/InputField"
import useGetUserByUsername from "../hooks/useGetUserByUsername"
import "../styles/EditProfilePage.scss"
import MainLayout from "@components/layout/MainLayout"

import useGoogleAccount from "../hooks/useUnlinkGoogleAccount"
import useRequestVerifyEmail from "../hooks/useRequestVerifyEmail"
import useUpdateUser from "../hooks/useUpdateUser"

export interface User {
  displayName: string
  username: string
  google: {
    id: string
    email: string
  }
  local: {
    email: string | null
    pendingEmail: string | null
  }
  profile: {
    displayName: string
    bio: string
    avatarUrl: string
  }
  stats: {
    winStreak: number
    wins: number
    gamesPlayed: number
    timePlayed: string
  }
}

export default function EditProfilePage() {
  const username = useParams<{ username: string }>().username
  const { user, loading } = useGetUserByUsername(username || "")

  const [activeTab, setActiveTab] = useState("profile")
  const [formData, setFormData] = useState({
    displayName: "",
    username: "",
    bio: "",
    email: "",
    currentPassword: "",
    password: "",
    confirmPassword: "",
    avatar: null as File | null
  });

  const {
    unlinkAccount,
    linkGoogleAccount,
    googleAccountUnlinked,
    setGoogleAccountUnlinked
  } = useGoogleAccount()

  const {
    requestVerification,
  } = useRequestVerifyEmail()

  const {
    updateUserData,
  } = useUpdateUser()

  // set the form state
  useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.profile.displayName,
        username: user.username,
        bio: user.profile.bio,
        email: user.local?.email || user.local?.pendingEmail || "",
        currentPassword: "",
        password: "",
        confirmPassword: "",
        avatar: null
      })
      setGoogleAccountUnlinked(!user.google)
    }
  }, [user])


  // because files take time to upload
  useEffect(() => {
    if (formData.avatar) {
      handleSubmit();
    }
  }, [formData.avatar]);

  // Handle all states explicitly
  if (loading) return <div>Loading...</div>
  if (!user) return <div>User not found</div>

  // Now we're guaranteed to have user data
  const avatarUrl = user.profile?.avatarUrl.startsWith("http")
    ? user.profile.avatarUrl
    : `${import.meta.env.VITE_IMAGE_URL}${user.profile.avatarUrl}`

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    // special handling for file inputs
    if (e.target.type === 'file') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).files?.[0] ?? null
      }));
    } else {
      // set the form data, updating only the changed field
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };



  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) {
      e.preventDefault()
    }
    if (!username) return

    const formDataToSend = new FormData()

    if (formData.username) formDataToSend.append("username", formData.username)
    if (formData.bio) formDataToSend.append("profile.bio", formData.bio)
    if (formData.email) formDataToSend.append("local.pendingEmail", formData.email)
    if (formData.password) formDataToSend.append("password", formData.password)
    if (formData.displayName) formDataToSend.append("profile.displayName", formData.displayName)
    if (formData.currentPassword) formDataToSend.append("currentPassword", formData.currentPassword)
    if (formData.avatar) formDataToSend.append("avatar", formData.avatar)
    
    await updateUserData(username, formDataToSend);
  }

  return (
    <MainLayout>
      <div className="profile-grid">
        {/* Sidebar with avatar */}
        <div className="profile-sidebar">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Profile Picture</h2>
              <p className="card-description">Upload a new profile picture</p>
            </div>
            <div className="card-content avatar-container">
              <AvatarUpload
                currentAvatarUrl={avatarUrl}
                onAvatarChange={(avatarBlob: Blob) => {
                  const file = new File([avatarBlob], "avatar.jpg", { type: avatarBlob.type });
                  setFormData((prev) => ({ ...prev, avatar: file }));
                  console.log("Avatar changed:", file);
                }}
              />

              <div className="avatar-info">
                <p className="display-name">{user.profile.displayName}</p>
                <p className="username">{user.username}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="profile-main">
          <div className="tabs-container">
            <div className="tabs-header">
              <Button
                className={`tab-button ${activeTab === "profile" ? "active" : ""}`}
                onClick={() => setActiveTab("profile")}
              >
                Profile
              </Button>
              <Button
                className={`tab-button ${activeTab === "email" ? "active" : ""}`}
                onClick={() => setActiveTab("email")}
              >
                Email
              </Button>
              <Button
                className={`tab-button ${activeTab === "password" ? "active" : ""}`}
                onClick={() => setActiveTab("password")}
              >
                Password
              </Button>
            </div>

            <div className="tab-content">
              {activeTab === "profile" && (
                <div className="card">
                  <div className="card-header">
                    <h2 className="card-title">Profile Information</h2>
                    <p className="card-description">Update your profile information visible to other users</p>
                  </div>
                  <div className="card-content">
                    <form onSubmit={handleSubmit} className="form">
                      <div className="form-group">
                        <InputField name="displayName" value={formData.displayName} onChange={handleInputChange} />
                        <p className="form-description">This is your public display name.</p>
                      </div>

                      <div className="form-group">
                        <InputField name="username" value={formData.username} onChange={handleInputChange} validate />
                        <p className="form-description">Your unique username for your profile URL.</p>
                      </div>

                      <div className="form-group">
                        <InputField name="bio" value={formData.bio} onChange={handleInputChange} />
                        <p className="form-description">A short bio about yourself.</p>
                      </div>

                      <Button type="submit" className="button primary">
                        Save Changes
                      </Button>
                    </form>
                  </div>
                </div>
              )}

              {activeTab === "email" && (
                <div className="card">
                  <div className="card-header">
                    <h2 className="card-title">Email Address</h2>
                    <p className="card-description">Update your email address and verification status</p>
                  </div>
                  <div className="card-content">
                    <form onSubmit={handleSubmit} className="form">
                      <div className="form-group">
                        <div className="email-container">
                          <div className="input-wrapper">
                            <InputField name="email" value={formData.email} onChange={handleInputChange} validate />
                          </div>
                          {user.local?.email ? (
                            <span className="badge verified">Verified</span>
                          ) : (
                            <span className="badge not-verified">Not Verified</span>
                          )}
                        </div>
                      </div>

                      <div className="email-actions">
                        {user.local?.pendingEmail && (
                          <Button type="button" className="button secondary" onClick={() => requestVerification(formData.email)}>
                            Send Verification Email
                          </Button>
                        )}
                        <Button type="submit">
                          Save Email
                        </Button>
                      </div>

                      <div className="divider"></div>

                      <div className="connected-accounts">
                        <h3 className="section-title">Connected Accounts</h3>
                        <div className="account-item">
                          <div className="account-info">
                            <div className="account-icon">G</div>
                            <div>
                              <p className="account-name">Google</p>
                              {!googleAccountUnlinked ? (
                                <p className="account-email">Connected to {user.google.email}</p>
                              ) : (
                                <p className="account-email">Not connected</p>
                              )}
                            </div>
                          </div>

                          {!googleAccountUnlinked ? (
                            <Button type="button" onClick={unlinkAccount}>
                              Disconnect
                            </Button>
                          ) : (
                            <Button type="button"  onClick={linkGoogleAccount}>
                              Connect
                            </Button>
                          )}
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {activeTab === "password" && (
                <div className="card">
                  <div className="card-header">
                    <h2 className="card-title">Change Password</h2>
                    <p className="card-description">Update your password</p>
                  </div>
                  <div className="card-content">
                    <form onSubmit={handleSubmit} className="form">
                      <div className="form-group">
                        <InputField
                          name="currentPassword"
                          value={formData.currentPassword}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="form-group">
                        <InputField
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          validate
                        />
                      </div>

                      <div className="form-group">
                        <InputField
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          validate
                          compareValue={formData.password}
                        />
                      </div>

                      <Button type="submit">
                        Update Password
                      </Button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

