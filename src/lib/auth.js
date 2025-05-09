//src/lib/auth
export const authService = {
    // Log in user
    login: async (credentials) => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials),
        });
        
        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.message || 'Login failed');
        }
        
        // Ensure the result has 'data' with 'token' and 'user' properties
        if (!result.data || !result.data.token || !result.data.user) {
          throw new Error('Invalid response structure');
        }
        
        // Store token and user in localStorage
        localStorage.setItem('token', result.data.token);
        localStorage.setItem('user', JSON.stringify(result.data.user));
        
        return {
          success: true,
          user: result.data.user,
          token: result.data.token
        };
      } catch (error) {
        return {
          success: false,
          message: error.message
        };
      }
    },
    
    // Log out user
    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    },
    
    // Get current authenticated user
    getCurrentUser: () => {
      try {
        const userStr = localStorage.getItem('user');
        if (!userStr) return null;
        return JSON.parse(userStr);
      } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
      }
    },
    
    // Check if user is authenticated
    isAuthenticated: () => {
      return !!localStorage.getItem('token');
    },
    
    // Get authentication token
    getToken: () => {
      return localStorage.getItem('token');
    },
    
    // Get user role
    getUserRole: () => {
      const user = authService.getCurrentUser();
      return user ? user.role : null;
    },
    
    // Get redirect path based on user role
    getRedirectPath: (role) => {
      switch (role) {
        case 'admin': return '/admin/dashboard';
        case 'hr': return '/hr/dashboard';
        case 'workManager': return '/manager/dashboard';
        case 'staff': return '/staff/dashboard';
        default: return '/dashboard';
      }
    }
  };