import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMensaje, setErrorMensaje] = useState('');

    // Hook para redireccionar a otra página después de entrar
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault(); // Evita que la página se recargue
        setLoading(true);
        setErrorMensaje('');

        // Llamada a Supabase para iniciar sesión
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) {
            setErrorMensaje(error.message);
        } else {
            console.log('¡Inicio de sesión exitoso!', data.user);
            navigate('/dashboard');
        }

        setLoading(false);
    };

    return (
        <div className="login-container">
            <h1>Bienvenido a LoboFix</h1>
            <p>Inicia sesión para reportar un desperfecto</p>

            <form onSubmit={handleLogin} className="login-form">
                <div>
                    <label htmlFor="email">Correo electrónico:</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="usuario@facultad.edu"
                    />
                </div>

                <div>
                    <label htmlFor="password">Contraseña:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="********"
                    />
                </div>

                {errorMensaje && <p style={{ color: 'red' }}>{errorMensaje}</p>}

                <button type="submit" disabled={loading} className="primary">
                    {loading ? 'Cargando...' : 'Entrar'}
                </button>
            </form>

            <p style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                ¿No tienes cuenta? <Link to="/register" style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 'bold' }}>Regístrate primero</Link>
            </p>
        </div>
    );
}

export default Login;