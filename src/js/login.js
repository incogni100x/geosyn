// Admin login with Supabase authentication
import { supabase } from './client.js';

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  
  if (!loginForm) return;

  // Check if already logged in
  checkExistingSession();

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('username').value; // email field
    const password = document.getElementById('password').value;
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    if (!email || !password) {
      alert('Please enter both email and password');
      return;
    }

    try {
      // Disable button during login
      submitBtn.disabled = true;
      submitBtn.textContent = 'Signing in...';
      
      // Supabase authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) throw error;
      
      if (data.user) {
        // Store session info
        sessionStorage.setItem('adminLoggedIn', 'true');
        sessionStorage.setItem('adminUser', data.user.email);
        sessionStorage.setItem('adminUserId', data.user.id);
        
            // Redirect to admin dashboard
            window.location.href = '/admin';
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed: ' + error.message);
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });
});

// Check if user is already logged in
async function checkExistingSession() {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session) {
    sessionStorage.setItem('adminLoggedIn', 'true');
    sessionStorage.setItem('adminUser', session.user.email);
        sessionStorage.setItem('adminUserId', session.user.id);
        window.location.href = '/admin';
  }
}
