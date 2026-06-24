import { useEffect } from "react";
import logo from "../assets/mumkin-logo.png";

export default function Login() {

  useEffect(() => {
    function doLogin() {
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const errorEl = document.getElementById('login-error');

      if (!email || !password) {
        errorEl.textContent = 'Email and password are required';
        errorEl.style.display = 'block';
        return;
      }

      const btn = document.getElementById('login-btn');
      btn.textContent = 'Signing in…';
      btn.disabled = true;
      errorEl.style.display = 'none';

      fetch('https://coach-crm-backend-production.up.railway.app/api/auth/login.php', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          window.location.href = '/dashboard';
        } else {
          errorEl.textContent = data.message || 'Invalid email or password';
          errorEl.style.display = 'block';
          btn.textContent = 'Sign in';
          btn.disabled = false;
        }
      })
      .catch(err => {
        errorEl.textContent = 'Connection error. Try again.';
        errorEl.style.display = 'block';
        btn.textContent = 'Sign in';
        btn.disabled = false;
      });
    }

    const btn = document.getElementById('login-btn');
    if (btn) btn.addEventListener('click', doLogin);

    const form = document.getElementById('login-form');
    function handleSubmit(e) {
      e.preventDefault();
      doLogin();
    }
    if (form) form.addEventListener('submit', handleSubmit);

    return () => {
      const b = document.getElementById('login-btn');
      if (b) b.removeEventListener('click', doLogin);
      const f = document.getElementById('login-form');
      if (f) f.removeEventListener('submit', handleSubmit);
    };
  }, []);

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-card__brand">
          <img src={logo} alt="Mumkin" className="login-card__logo" />
          <p className="login-card__tagline">
            Professional coaching management platform
          </p>
        </div>

        <div id="login-error" className="alert alert-error" style={{display:'none'}}></div>

        <form id="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" required autoFocus />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" required />
          </div>
          <button id="login-btn" type="submit" className="btn btn-primary login-submit">
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
