import { useEffect, useState } from 'react';
import { api } from '../services/api';

export default function ClientGoals() {
  const [goals, setGoals]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/goals/client.php')
      .then(res => setGoals(res.data || []))
      .finally(() => setLoading(false));
  }, []);

  const active    = goals.filter(g => g.status === 'active');
  const completed = goals.filter(g => g.status === 'completed');
  const cancelled = goals.filter(g => g.status === 'cancelled');

  if (loading) return <div className="page-loading">Loading goals…</div>;

  return (
    <div className="page-sticky">
      {/* Fixed header */}
      <div className="page-sticky__header">
        <div>
          <h2>My Goals</h2>
          <p style={{marginTop:'0.25rem', color:'var(--text-secondary)', fontSize:'0.9375rem'}}>
            Your coaching goals and progress.
          </p>
        </div>
      </div>

      {/* Scrollable list */}
      <div className="page-sticky__body">
        {goals.length === 0 ? (
          <div className="empty-state" style={{paddingTop:'3rem'}}>
            <div style={{fontSize:'2rem', marginBottom:'0.75rem'}}>🎯</div>
            <p style={{fontWeight:600, color:'var(--text)', marginBottom:'0.375rem'}}>No goals yet.</p>
            <p style={{fontSize:'0.875rem'}}>Your coach will assign goals to your coaching plan.</p>
          </div>
        ) : (
          <>
            {active.length > 0 && (
              <>
                <div style={{fontSize:'0.775rem', fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em', paddingTop:'0.25rem'}}>Active</div>
                {active.map(goal => <GoalCard key={goal.id} goal={goal} />)}
              </>
            )}
            {completed.length > 0 && (
              <>
                <div style={{fontSize:'0.775rem', fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em', paddingTop:'0.5rem'}}>Completed</div>
                {completed.map(goal => <GoalCard key={goal.id} goal={goal} />)}
              </>
            )}
            {cancelled.length > 0 && (
              <>
                <div style={{fontSize:'0.775rem', fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em', paddingTop:'0.5rem'}}>Cancelled</div>
                {cancelled.map(goal => <GoalCard key={goal.id} goal={goal} />)}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function GoalCard({ goal }) {
  return (
    <div className="dashboard-panel" style={{overflow:'hidden'}}>
      <div style={{padding:'1.25rem 1.5rem'}}>
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'0.75rem'}}>
          <span style={{fontWeight:600, fontSize:'0.9375rem'}}>{goal.title}</span>
          <span className={`badge badge--${goal.status}`}>{goal.status}</span>
        </div>
        {goal.description && (
          <p style={{fontSize:'0.875rem', color:'var(--text-secondary)', marginBottom:'0.875rem'}}>{goal.description}</p>
        )}
        <div style={{display:'flex', alignItems:'center', gap:'0.75rem'}}>
          <div style={{flex:1, height:'8px', background:'#EEEBE4', borderRadius:'100px', overflow:'hidden'}}>
            <div style={{height:'100%', width:`${goal.progress_percentage}%`, background:'linear-gradient(90deg, var(--primary), var(--primary-light))', borderRadius:'100px', transition:'width 0.4s ease'}} />
          </div>
          <span style={{fontSize:'0.9rem', fontWeight:700, color:'var(--primary-dark)', flexShrink:0}}>
            {goal.progress_percentage}%
          </span>
        </div>
        {goal.timeline_months && (
          <div style={{fontSize:'0.775rem', color:'var(--text-muted)', marginTop:'0.5rem'}}>
            Timeline: {goal.timeline_months} months
          </div>
        )}
      </div>
    </div>
  );
}
