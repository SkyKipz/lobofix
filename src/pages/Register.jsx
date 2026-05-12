import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';

function Register() {
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMensaje, setErrorMensaje] = useState('');
    const [exitoMensaje, setExitoMensaje] = useState('');

    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMensaje('');
        setExitoMensaje('');

        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    nombre: nombre
                }
            }
        });

        if (error) {
            setErrorMensaje(error.message);
        } else {
            setExitoMensaje('¡Registro exitoso! Ahora puedes iniciar sesión.');
        }

        setLoading(false);
    };

    return (
        <div className="login-container">
            <h1>Regístrate en LoboFix</h1>
            <p>Crea tu cuenta para reportar un desperfecto</p>

            <form onSubmit={handleRegister} className="login-form">
                <div>
                    <label htmlFor="nombre">Nombre completo:</label>
                    <input
                        type="text"
                        id="nombre"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        required
                        placeholder="Juan Pérez"
                    />
                </div>

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
                {exitoMensaje && <p style={{ color: 'green' }}>{exitoMensaje}</p>}

                <button type="submit" disabled={loading} className="primary">
                    {loading ? 'Cargando...' : 'Registrarse'}
                </button>
            </form>

            <p style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                ¿Ya tienes cuenta? <Link to="/" style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 'bold' }}>Inicia sesión aquí</Link>
            </p>
        </div>
    );
}

export default Register;
