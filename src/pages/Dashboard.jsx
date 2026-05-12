import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import ReportForm from '../components/ReportForm';
import ReportModal from '../components/ReportModal';

function Dashboard() {
    const [user, setUser] = useState(null);
    const [perfil, setPerfil] = useState(null);
    const [reportes, setReportes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mostrarForm, setMostrarForm] = useState(false);
    const [reporteSeleccionado, setReporteSeleccionado] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        getUsuarioYDatos();
    }, []);

    const getUsuarioYDatos = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return navigate('/');
        setUser(user);

        // Obtener rol
        const { data: p } = await supabase.from('usuarios').select('*').eq('id_usuario', user.id).single();
        setPerfil(p);

        // Cargar reportes (Admin ve todos, Usuario solo los suyos)
        let query = supabase.from('reportes').select('*, ubicaciones(nombre)').order('fecha_reporte', { ascending: false });
        if (p.rol === 'usuario') query = query.eq('id_usuario', user.id);

        const { data: r } = await query;
        setReportes(r || []);
        setLoading(false);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/');
    };

    if (loading) return <p>Cargando panel...</p>;

    return (
        <div className="dashboard">
            <header>
                <h2>LoboFix - Hola, {perfil?.nombre}</h2>
                <button onClick={handleLogout}>Cerrar Sesión</button>
            </header>

            <main>
                <div className="stats-bar">
                    <p>Total de reportes: {reportes.length}</p>
                    {perfil?.rol === 'usuario' && (
                        <button onClick={() => setMostrarForm(!mostrarForm)} className="accent">
                            {mostrarForm ? 'Cerrar Formulario' : '+ Nuevo Reporte'}
                        </button>
                    )}
                </div>

                {mostrarForm && <ReportForm onReportCreated={getUsuarioYDatos} onClose={() => setMostrarForm(false)} />}

                <div className="report-grid">
                    {reportes.map(rep => (
                        <div
                            key={rep.id_reporte}
                            className={`card status-${rep.estado} clickable-card`}
                            onClick={() => setReporteSeleccionado(rep)}
                        >
                            <h3>{rep.titulo}</h3>
                            <p><strong>Ubicación:</strong> {rep.ubicaciones.nombre} - {rep.detalle_ubicacion}</p>
                            <p>{rep.descripcion}</p>
                            <span className="badge">{rep.estado.replace('_', ' ')}</span>
                        </div>
                    ))}
                </div>

                {reporteSeleccionado && (
                    <ReportModal
                        reporte={reporteSeleccionado}
                        perfil={perfil}
                        onClose={() => setReporteSeleccionado(null)}
                        onUpdate={() => {
                            setReporteSeleccionado(null);
                            getUsuarioYDatos();
                        }}
                    />
                )}
            </main>
        </div>
    );
}

export default Dashboard;