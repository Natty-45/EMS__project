import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import userReducer from '../redux/userStore/userSlice';
import { AdminRoute, SuperAdminRoute, MemberRoute } from '../components/privateRoute/roleRoute';

const renderRoutes = (currentUser, RouteComponent) => {
  const store = configureStore({
    reducer: { user: userReducer },
    preloadedState: { user: { currentUser, isAuthenticated: !!currentUser, loading: false, error: null } },
  });

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route element={<RouteComponent />}>
            <Route path="/protected" element={<div>PROTECTED AREA</div>} />
          </Route>
          <Route path="/login" element={<div>LOGIN PAGE</div>} />
          <Route path="/" element={<div>HOME PAGE</div>} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
};

describe('AdminRoute', () => {
  it('redirects guests to the login page', () => {
    renderRoutes(null, AdminRoute);
    expect(screen.getByText('LOGIN PAGE')).toBeInTheDocument();
    expect(screen.queryByText('PROTECTED AREA')).not.toBeInTheDocument();
  });

  it('redirects regular users to the home page', () => {
    renderRoutes({ _id: 'u1', role: 'user' }, AdminRoute);
    expect(screen.getByText('HOME PAGE')).toBeInTheDocument();
    expect(screen.queryByText('PROTECTED AREA')).not.toBeInTheDocument();
  });

  it('lets Admins through', () => {
    renderRoutes({ _id: 'a1', role: 'Admin' }, AdminRoute);
    expect(screen.getByText('PROTECTED AREA')).toBeInTheDocument();
  });

  it('lets superAdmin through', () => {
    renderRoutes({ _id: 's1', role: 'superAdmin' }, AdminRoute);
    expect(screen.getByText('PROTECTED AREA')).toBeInTheDocument();
  });
});

describe('SuperAdminRoute', () => {
  it('redirects guests to the login page', () => {
    renderRoutes(null, SuperAdminRoute);
    expect(screen.getByText('LOGIN PAGE')).toBeInTheDocument();
  });

  it('redirects Admins to the home page', () => {
    renderRoutes({ _id: 'a1', role: 'Admin' }, SuperAdminRoute);
    expect(screen.getByText('HOME PAGE')).toBeInTheDocument();
  });

  it('redirects regular users to the home page', () => {
    renderRoutes({ _id: 'u1', role: 'user' }, SuperAdminRoute);
    expect(screen.getByText('HOME PAGE')).toBeInTheDocument();
  });

  it('lets superAdmin through', () => {
    renderRoutes({ _id: 's1', role: 'superAdmin' }, SuperAdminRoute);
    expect(screen.getByText('PROTECTED AREA')).toBeInTheDocument();
  });
});

describe('MemberRoute', () => {
  it('redirects guests to the login page', () => {
    renderRoutes(null, MemberRoute);
    expect(screen.getByText('LOGIN PAGE')).toBeInTheDocument();
  });

  it('redirects Admins to the home page', () => {
    renderRoutes({ _id: 'a1', role: 'Admin' }, MemberRoute);
    expect(screen.getByText('HOME PAGE')).toBeInTheDocument();
  });

  it('redirects superAdmin to the home page', () => {
    renderRoutes({ _id: 's1', role: 'superAdmin' }, MemberRoute);
    expect(screen.getByText('HOME PAGE')).toBeInTheDocument();
  });

  it('lets regular users through', () => {
    renderRoutes({ _id: 'u1', role: 'user' }, MemberRoute);
    expect(screen.getByText('PROTECTED AREA')).toBeInTheDocument();
  });
});