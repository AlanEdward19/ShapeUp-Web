import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import './Login.css'; // Reusing the layout styles

const Register = () => {
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();

        const firstName = e.target.firstName.value;
        const lastName = e.target.lastName.value;
        const email = e.target.email.value;

        // Mock update logic: Find the invited client and update their status
        const stored = localStorage.getItem('shapeup_clients');
        let clients = stored ? JSON.parse(stored) : [];
        const clientIndex = clients.findIndex(c => c.email === email && c.status === 'Invited');

        if (clientIndex !== -1) {
            // Update specific fields of invited client
            clients[clientIndex].name = `${firstName} ${lastName}`;
            clients[clientIndex].status = 'Active';
            clients[clientIndex].lastCheckin = 'Just now';
        } else {
            // Create a brand new client since they weren't invited
            const newClient = {
                id: Date.now(),
                name: `${firstName} ${lastName}`,
                email: email,
                activePlan: '-',
                compliance: 0,
                lastCheckin: 'Just now',
                status: 'Active'
            };
            clients.push(newClient);
        }

        // Save back to localStorage
        localStorage.setItem('shapeup_clients', JSON.stringify(clients));

        navigate('/'); // Redirect to login on success
    };

    return (
        <div className="login-container">
            {/* Background shapes for consistency with Login */}
            <div className="login-bg-shape login-bg-shape-1"></div>
            <div className="login-bg-shape login-bg-shape-2"></div>

            <div className="login-content">
                <div className="login-header">
                    <div className="login-logo">
                        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="40" height="40" rx="10" fill="var(--primary)" />
                            <path d="M12 28L20 12L28 28H12Z" fill="white" />
                        </svg>
                        <span className="login-logo-text">ShapeUp</span>
                    </div>
                    <h1 className="login-tagline">Join and transform.</h1>
                </div>

                <Card className="login-card">
                    <form className="login-form" onSubmit={handleSubmit}>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div style={{ flex: 1 }}>
                                <Input
                                    id="firstName"
                                    type="text"
                                    label="First Name"
                                    placeholder="John"
                                    required
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <Input
                                    id="lastName"
                                    type="text"
                                    label="Last Name"
                                    placeholder="Doe"
                                    required
                                />
                            </div>
                        </div>

                        <Input
                            id="email"
                            type="email"
                            label="Email address"
                            placeholder="you@example.com"
                            required
                        />


                        <Input
                            id="password"
                            type="password"
                            label="Password"
                            placeholder="••••••••"
                            required
                        />

                        <Input
                            id="birthDate"
                            type="date"
                            label="Birth Date"
                            required
                        />

                        <Button type="submit" fullWidth className="btn-sign-in" style={{ marginTop: '0.5rem' }}>
                            Create account
                        </Button>
                    </form>
                </Card>

                <p className="login-footer-text">
                    Already have an account? <Link to="/">Sign in</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
