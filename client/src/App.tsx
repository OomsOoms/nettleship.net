import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { UserProvider } from './context/UserContext.tsx'
import { RegisterPage, LoginPage, ResetPasswordPage, VerifyEmailPage } from './features/authentication'
import { GameSearchPage, GamePage } from './features/game'
import { ProfilePage, EditProfilePage } from './features/user'

import MainLayout from '@components/layout/MainLayout.tsx'

export default function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/" element={<GameSearchPage />} />
          <Route path="/lobby/:gameCode" element={<GamePage />} />
          <Route path="/profile/:username" element={<ProfilePage />} />
          <Route path="/profile/:username/edit" element={<EditProfilePage />} />
          <Route path="*" element={<MainLayout><h1>Page Not Found</h1></MainLayout>} />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  )
}
