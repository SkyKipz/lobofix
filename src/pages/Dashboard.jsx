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
    const [busqueda, setBusqueda] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('todos');
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

    const reportesFiltrados = reportes.filter(rep => {
        const coincideBusqueda =
            rep.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
            rep.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
            (rep.ubicaciones?.nombre && rep.ubicaciones.nombre.toLowerCase().includes(busqueda.toLowerCase()));
        const coincideEstado = filtroEstado === 'todos' || rep.estado === filtroEstado;
        return coincideBusqueda && coincideEstado;
    });

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

                <div className="filters-section">
                    <div className="filters-bar">
                        <div className="filter-group flex-2">
                            <label htmlFor="search-input" className="filter-label">Término de búsqueda</label>
                            <div className="input-wrapper">
                                <span className="input-prefix" aria-hidden="true">›</span>
                                <input
                                    id="search-input"
                                    type="text"
                                    placeholder="ej. Silla rota, Salón 301, fuga..."
                                    value={busqueda}
                                    onChange={(e) => setBusqueda(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="filter-group flex-1">
                            <label htmlFor="status-filter" className="filter-label">Estado del reporte</label>
                            <select
                                id="status-filter"
                                value={filtroEstado}
                                onChange={(e) => setFiltroEstado(e.target.value)}
                            >
                                <option value="todos">Cualquier estado</option>
                                <option value="pendiente">Pendiente</option>
                                <option value="en_proceso">En Proceso</option>
                                <option value="resuelto">Resuelto</option>
                                <option value="rechazado">Rechazado</option>
                            </select>
                        </div>
                        {(busqueda !== '' || filtroEstado !== 'todos') && (
                            <button
                                type="button"
                                className="btn-clear"
                                onClick={() => {
                                    setBusqueda('');
                                    setFiltroEstado('todos');
                                }}
                                aria-label="Limpiar todos los filtros"
                            >
                                Limpiar
                            </button>
                        )}
                    </div>
                </div>

                {mostrarForm && <ReportForm onReportCreated={getUsuarioYDatos} onClose={() => setMostrarForm(false)} />}

                <div className="report-grid">
                    {reportesFiltrados.length === 0 && (
                        <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                            <p className="empty-message">
                                {reportes.length === 0
                                    ? (perfil?.rol === 'usuario'
                                        ? "No has enviado ningún reporte de incidencia todavía. Usa el botón '+ Nuevo Reporte' de arriba para comenzar."
                                        : "No hay reportes de incidencias en el sistema en este momento.")
                                    : "No se encontraron reportes que coincidan con la búsqueda o el estado seleccionado."}
                            </p>
                            {(busqueda !== '' || filtroEstado !== 'todos') && (
                                <button
                                    type="button"
                                    className="btn-clear-empty"
                                    onClick={() => {
                                        setBusqueda('');
                                        setFiltroEstado('todos');
                                    }}
                                >
                                    Restablecer filtros
                                </button>
                            )}
                        </div>
                    )}
                    {reportesFiltrados.map(rep => (
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