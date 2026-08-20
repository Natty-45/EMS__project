import React from 'react';
import { useSelector } from 'react-redux';
import { Outlet, Navigate } from 'react-router-dom';

export function AdminRoute() {
  const { currentUser } = useSelector((state) => state.user);
  if (!currentUser) return <Navigate to="/login" />;
  if (currentUser.role !== 'Admin' && currentUser.role !== 'superAdmin') {
    return <Navigate to="/" />;
  }
  return <Outlet />;
}

export function SuperAdminRoute() {
  const { currentUser } = useSelector((state) => state.user);
  if (!currentUser) return <Navigate to="/login" />;
  if (currentUser.role !== 'superAdmin') return <Navigate to="/" />;
  return <Outlet />;
}

export function MemberRoute() {
  const { currentUser } = useSelector((state) => state.user);
  if (!currentUser) return <Navigate to="/login" />;
  if (currentUser.role === 'Admin' || currentUser.role === 'superAdmin') {
    return <Navigate to="/" />;
  }
  return <Outlet />;
}