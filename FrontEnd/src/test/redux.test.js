import { describe, it, expect, beforeEach } from 'vitest';
import userReducer, {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  updateProfileStart,
  updateProfileSuccess,
  updateProfileFailure,
  verifyEmailStart,
  verifyEmailSuccess,
  verifyEmailFailure,
  resendVerificationStart,
  resendVerificationSuccess,
  resendVerificationFailure,
  forgotPasswordStart,
  forgotPasswordSuccess,
  forgotPasswordFailure,
  resetPasswordStart,
  resetPasswordSuccess,
  resetPasswordFailure,
} from '../redux/userStore/userSlice';

import eventReducer, {
  updateEventStart,
  updateEventSuccess,
  updateEventFailure,
  deleteEventStart,
  deleteEventSuccess,
  deleteEventFailure,
  setCurrentEvent,
  clearEventState,
} from '../redux/eventStore/eventSlice';

describe('User Slice', () => {
  const initialState = {
    currentUser: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  };

  beforeEach(() => {
    localStorage.clear();
  });

  it('should return the initial state', () => {
    expect(userReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle loginStart', () => {
    const state = userReducer(initialState, loginStart());
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('should handle loginSuccess', () => {
    const user = { _id: '1', fullName: 'Test User', email: 'test@test.com' };
    const state = userReducer(initialState, loginSuccess(user));
    expect(state.currentUser).toEqual(user);
    expect(state.isAuthenticated).toBe(true);
    expect(state.loading).toBe(false);
  });

  it('should handle loginFailure', () => {
    const state = userReducer(initialState, loginFailure('Invalid credentials'));
    expect(state.error).toBe('Invalid credentials');
    expect(state.loading).toBe(false);
  });

  it('should handle logout', () => {
    const loggedInState = {
      currentUser: { _id: '1', fullName: 'Test User' },
      isAuthenticated: true,
      loading: false,
      error: null,
    };
    const state = userReducer(loggedInState, logout());
    expect(state.currentUser).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('should handle updateProfileStart', () => {
    const state = userReducer(initialState, updateProfileStart());
    expect(state.loading).toBe(true);
  });

  it('should handle updateProfileSuccess', () => {
    const user = { _id: '1', fullName: 'Updated Name' };
    const state = userReducer(initialState, updateProfileSuccess(user));
    expect(state.currentUser).toEqual(user);
    expect(state.loading).toBe(false);
  });

  it('should handle updateProfileFailure', () => {
    const state = userReducer(initialState, updateProfileFailure('Update failed'));
    expect(state.error).toBe('Update failed');
    expect(state.loading).toBe(false);
  });

  it('should persist the user to localStorage on loginSuccess', () => {
    const user = { _id: '1', fullName: 'Test User' };
    userReducer(initialState, loginSuccess(user));
    expect(JSON.parse(localStorage.getItem('user'))).toEqual(user);
  });

  it('should remove the user from localStorage on logout', () => {
    localStorage.setItem('user', JSON.stringify({ _id: '1' }));
    userReducer(initialState, logout());
    expect(localStorage.getItem('user')).toBeNull();
  });

  it('should handle verifyEmailStart', () => {
    const state = userReducer(initialState, verifyEmailStart());
    expect(state.loading).toBe(true);
  });

  it('should handle verifyEmailSuccess', () => {
    const user = { _id: '1', isVerified: true };
    const state = userReducer(initialState, verifyEmailSuccess(user));
    expect(state.currentUser).toEqual(user);
    expect(state.isAuthenticated).toBe(true);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should handle verifyEmailFailure', () => {
    const state = userReducer(initialState, verifyEmailFailure('Invalid code'));
    expect(state.error).toBe('Invalid code');
    expect(state.loading).toBe(false);
  });

  it('should handle resendVerificationStart', () => {
    const state = userReducer(initialState, resendVerificationStart());
    expect(state.loading).toBe(true);
  });

  it('should handle resendVerificationSuccess', () => {
    const state = userReducer({ ...initialState, loading: true }, resendVerificationSuccess());
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should handle resendVerificationFailure', () => {
    const state = userReducer(initialState, resendVerificationFailure('Cooldown active'));
    expect(state.error).toBe('Cooldown active');
    expect(state.loading).toBe(false);
  });

  it('should handle forgotPasswordStart', () => {
    const state = userReducer(initialState, forgotPasswordStart());
    expect(state.loading).toBe(true);
  });

  it('should handle forgotPasswordSuccess', () => {
    const state = userReducer({ ...initialState, loading: true }, forgotPasswordSuccess());
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should handle forgotPasswordFailure', () => {
    const state = userReducer(initialState, forgotPasswordFailure('Email not found'));
    expect(state.error).toBe('Email not found');
    expect(state.loading).toBe(false);
  });

  it('should handle resetPasswordStart', () => {
    const state = userReducer(initialState, resetPasswordStart());
    expect(state.loading).toBe(true);
  });

  it('should handle resetPasswordSuccess', () => {
    const state = userReducer({ ...initialState, loading: true }, resetPasswordSuccess());
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should handle resetPasswordFailure', () => {
    const state = userReducer(initialState, resetPasswordFailure('Token expired'));
    expect(state.error).toBe('Token expired');
    expect(state.loading).toBe(false);
  });
});

describe('Event Slice', () => {
  const initialState = {
    currentEvent: null,
    loading: false,
    error: null,
  };

  it('should return the initial state', () => {
    expect(eventReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle updateEventStart', () => {
    const state = eventReducer(initialState, updateEventStart());
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('should handle updateEventSuccess', () => {
    const event = { _id: '1', title: 'Updated Event' };
    const state = eventReducer(initialState, updateEventSuccess(event));
    expect(state.currentEvent).toEqual(event);
    expect(state.loading).toBe(false);
  });

  it('should handle updateEventFailure', () => {
    const state = eventReducer(initialState, updateEventFailure('Update failed'));
    expect(state.error).toBe('Update failed');
    expect(state.loading).toBe(false);
  });

  it('should handle deleteEventStart', () => {
    const state = eventReducer(initialState, deleteEventStart());
    expect(state.loading).toBe(true);
  });

  it('should handle deleteEventSuccess', () => {
    const state = eventReducer(initialState, deleteEventSuccess());
    expect(state.currentEvent).toBeNull();
    expect(state.loading).toBe(false);
  });

  it('should handle deleteEventFailure', () => {
    const state = eventReducer(initialState, deleteEventFailure('Delete failed'));
    expect(state.error).toBe('Delete failed');
  });

  it('should handle setCurrentEvent', () => {
    const event = { _id: '1', title: 'Test Event' };
    const state = eventReducer(initialState, setCurrentEvent(event));
    expect(state.currentEvent).toEqual(event);
  });

  it('should handle clearEventState', () => {
    const dirtyState = {
      currentEvent: { _id: '1' },
      loading: true,
      error: 'some error',
    };
    const state = eventReducer(dirtyState, clearEventState());
    expect(state).toEqual(initialState);
  });
});
