import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { Landing } from '@/pages/Landing'
import { Auth } from '@/pages/Auth'
import { AuthCallback } from '@/pages/AuthCallback'
import { Dashboard } from '@/pages/Dashboard'
import { Studio } from '@/pages/Studio'
import { Settings } from '@/pages/Settings'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Landing />,
  },
  {
    path: '/auth',
    element: <Auth />,
  },
  {
    path: '/auth/callback',
    element: <AuthCallback />,
  },
  {
    path: '/app',
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/app/dashboard" replace /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'studio/:documentId?', element: <Studio /> },
      { path: 'settings', element: <Settings /> },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])
