import { describe, it, expect } from 'vitest';
import userReducer, {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  updateProfileStart,
  updateProfileSuccess,
  updateProfileFailure,
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
