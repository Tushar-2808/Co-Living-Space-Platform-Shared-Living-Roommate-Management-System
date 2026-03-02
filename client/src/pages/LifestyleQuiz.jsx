import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateLifestyle } from '../api/api';
import toast from 'react-hot-toast';

const STEPS = [
    {
        key: 'smoking', title: 'Smoking Habits', icon: '🚬',
        options: [{ val: 'never', label: 'Non Smoker', icon: '✅' }, { val: 'occasionally', label: 'Occasionally', icon: '💨' }, { val: 'regularly', label: 'Regular Smoker', icon: '🚬' }],
    },
    {
        key: 'pets', title: 'Pets at Home', icon: '🐾',
        options: [{ val: 'no', label: 'No Pets', icon: '🚫' }, { val: 'yes', label: 'Pet Owner', icon: '🐶' }, { val: 'allergic', label: 'Allergic to Pets', icon: '🤧' }],
    },
    {
        key: 'cleanliness', title: 'Cleanliness Level', icon: '🧹',
        options: [{ val: 'relaxed', label: 'Relaxed', icon: '😌' }, { val: 'moderate', label: 'Moderate', icon: '🙂' }, { val: 'very_clean', label: 'Very Clean', icon: '✨' }],
    },
    {
        key: 'lateNight', title: 'Daily Schedule', icon: '🌙',
        options: [{ val: 'early_bird', label: 'Early Bird', icon: '🌅' }, { val: 'moderate', label: 'Moderate', icon: '☀️' }, { val: 'night_owl', label: 'Night Owl', icon: '🌙' }],
    },
    {
        key: 'workFromHome', title: 'Work From Home', icon: '💻',
        options: [{ val: 'never', label: 'Never', icon: '🏢' }, { val: 'sometimes', label: 'Sometimes', icon: '🔄' }, { val: 'always', label: 'Always', icon: '🏠' }],
    },
    {
        key: 'socialPreference', title: 'Social Style', icon: '🤝',
        options: [{ val: 'introvert', label: 'Introvert', icon: '📚' }, { val: 'ambivert', label: 'Ambivert', icon: '🤝' }, { val: 'extrovert', label: 'Extrovert', icon: '🎉' }],
    },
    {
        key: 'foodPreference', title: 'Food Preference', icon: '🍽️',
        options: [{ val: 'veg', label: 'Vegetarian', icon: '🥗' }, { val: 'vegan', label: 'Vegan', icon: '🌱' }, { val: 'non_veg', label: 'Non Vegetarian', icon: '🍗' }, { val: 'any', label: 'Any / Flexible', icon: '🍱' }],
    },
    {
        key: 'guestPolicy', title: 'Guest Policy', icon: '👥',
        options: [{ val: 'no_guests', label: 'No Guests', icon: '🔒' }, { val: 'occasional', label: 'Occasional', icon: '🚪' }, { val: 'frequent', label: 'Welcome Guests', icon: '🎊' }],
    },
];

const LifestyleQuiz = () => {
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(false);
    const { login, user } = useAuth();
    const navigate = useNavigate();

    const current = STEPS[step];
    const progress = Math.round(((step) / STEPS.length) * 100);

    const select = (val) => {
        const newAnswers = { ...answers, [current.key]: val };
        setAnswers(newAnswers);
        if (step < STEPS.length - 1) {
            setTimeout(() => setStep(step + 1), 280);
        }
    };

    const handleSubmit = async () => {
        if (Object.keys(answers).length < STEPS.length) return toast.error('Please answer all questions');
        setLoading(true);
        try {
            const res = await updateLifestyle(answers);
            login(res.data.user);
            toast.success('Profile complete! Find your perfect roommates now 🎉');
            navigate('/search');
        } catch {
            toast.error('Failed to save preferences');
        } finally {
            setLoading(false);
        }
    };

    const isLast = step === STEPS.length - 1;
    const allAnswered = Object.keys(answers).length === STEPS.length;

    return (
        <div className="quiz-page page-wrapper">
            <div className="quiz-card card fade-in">
                <div className="quiz-header">
                    <h2>🏠 Lifestyle Profile</h2>
                    <p>Help us find your perfect roommate match</p>
                    <div className="quiz-progress">
                        <div className="quiz-progress-bar">
                            <div className="quiz-progress-fill" style={{ width: `${Math.max(progress, 5)}%` }} />
                        </div>
                        <span className="quiz-step-count">{step + 1} / {STEPS.length}</span>
                    </div>
                </div>

                <div className="quiz-step">
                    <div className="quiz-step-icon">{current.icon}</div>
                    <h3 className="quiz-step-title">{current.title}</h3>
                    <div className="quiz-options">
                        {current.options.map(({ val, label, icon }) => (
                            <button
                                key={val}
                                className={`quiz-option ${answers[current.key] === val ? 'selected' : ''}`}
                                onClick={() => select(val)}
                            >
                                <span className="quiz-option-icon">{icon}</span>
                                <span className="quiz-option-label">{label}</span>
                                {answers[current.key] === val && <span className="quiz-check">✓</span>}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="quiz-nav">
                    {step > 0 && (
                        <button className="btn btn-ghost" onClick={() => setStep(step - 1)}>← Back</button>
                    )}
                    {isLast && allAnswered && (
                        <button className="btn btn-primary btn-lg" onClick={handleSubmit} disabled={loading} style={{ marginLeft: 'auto' }}>
                            {loading ? 'Saving...' : 'Complete Profile 🎉'}
                        </button>
                    )}
                    {!isLast && answers[current.key] && (
                        <button className="btn btn-primary" onClick={() => setStep(step + 1)} style={{ marginLeft: 'auto' }}>
                            Next →
                        </button>
                    )}
                </div>
            </div>
            <style>{`
        .quiz-page { display:flex; align-items:center; justify-content:center; min-height:100vh; background:linear-gradient(135deg,#fff5f5,#fff); }
        .quiz-card { width:100%; max-width:520px; padding:2.5rem; border-radius:var(--radius-xl); box-shadow:var(--shadow-lg); }
        .quiz-header { text-align:center; margin-bottom:2rem; }
        .quiz-header h2 { color:var(--dark); margin-bottom:0.25rem; }
        .quiz-header p { color:var(--text-muted); margin-bottom:1.25rem; }
        .quiz-progress { display:flex; align-items:center; gap:1rem; }
        .quiz-progress-bar { flex:1; height:8px; background:var(--border); border-radius:999px; overflow:hidden; }
        .quiz-progress-fill { height:100%; background:linear-gradient(90deg,var(--primary),var(--accent)); border-radius:999px; transition:width 0.4s ease; }
        .quiz-step-count { font-size:0.8rem; font-weight:700; color:var(--text-muted); white-space:nowrap; }
        .quiz-step { margin-bottom:2rem; }
        .quiz-step-icon { font-size:2.5rem; text-align:center; margin-bottom:0.75rem; }
        .quiz-step-title { text-align:center; color:var(--dark); margin-bottom:1.5rem; }
        .quiz-options { display:grid; grid-template-columns:repeat(auto-fit,minmax(140px,1fr)); gap:0.75rem; }
        .quiz-option { display:flex; flex-direction:column; align-items:center; gap:0.4rem; padding:1rem 0.75rem; border:2px solid var(--border); border-radius:var(--radius); background:var(--surface); cursor:pointer; transition:all var(--transition); position:relative; }
        .quiz-option:hover { border-color:var(--primary); background:#fff0f0; }
        .quiz-option.selected { border-color:var(--primary); background:var(--primary); color:#fff; }
        .quiz-option-icon { font-size:1.6rem; }
        .quiz-option-label { font-size:0.82rem; font-weight:600; text-align:center; }
        .quiz-check { position:absolute; top:6px; right:8px; font-size:0.75rem; font-weight:900; }
        .quiz-nav { display:flex; align-items:center; margin-top:1rem; }
      `}</style>
        </div>
    );
};

export default LifestyleQuiz;
