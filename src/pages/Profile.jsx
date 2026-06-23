import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user } = useAuth();

  return (
    <div className="page">
      <h2>My Profile</h2>
      <div className="notes-form" style={{maxWidth: '500px'}}>
        <div className="profile-field">
          <label>Full Name</label>
          <span style={{fontSize:'1rem', fontWeight:600}}>{user?.name}</span>
        </div>
        <div className="profile-field">
          <label>Email</label>
          <span>{user?.email}</span>
        </div>
        <div className="profile-field">
          <label>Role</label>
          <span style={{textTransform:'capitalize'}}>{user?.role}</span>
        </div>
        <div className="profile-field">
          <label>Account ID</label>
          <span className="text-muted">#{user?.id}</span>
        </div>
      </div>
    </div>
  );
}
