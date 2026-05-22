import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

function ReportModal({ reporte, perfil, onClose, onUpdate }) {
    const [fotos, setFotos] = useState([]);
    const [notas, setNotas] = useState([]);
    const [estado, setEstado] = useState(reporte.estado);
    const [nuevaNota, setNuevaNota] = useState('');
    const [guardando, setGuardando] = useState(false);
    const [fotoAmpliada, setFotoAmpliada] = useState(null);

    useEffect(() => {
        cargarDetalles();
    }, [reporte.id_reporte]);

    const cargarDetalles = async () => {
        // Cargar fotos
        const { data: fotosData } = await supabase
            .from('fotos_reporte')
            .select('*')
            .eq('id_reporte', reporte.id_reporte);
        setFotos(fotosData || []);

        // Cargar notas
        const { data: notasData } = await supabase
            .from('notas_seguimiento')
            .select('*, usuarios(nombre)')
            .eq('id_reporte', reporte.id_reporte)
            .order('fecha_nota', { ascending: true });
        setNotas(notasData || []);
    };

    const handleGuardar = async () => {
        setGuardando(true);
        let updated = false;

        if (estado !== reporte.estado) {
            const { error } = await supabase
                .from('reportes')
                .update({ estado })
                .eq('id_reporte', reporte.id_reporte);
            if (error) alert("Error actualizando estado: " + error.message);
            else updated = true;
        }

        if (nuevaNota.trim() !== '') {
            const { error } = await supabase
                .from('notas_seguimiento')
                .insert([{
                    id_reporte: reporte.id_reporte,
                    id_admin: perfil.id_usuario,
                    nota: nuevaNota
                }]);
            if (error) alert("Error guardando nota: " + error.message);
            else updated = true;
        }

        setGuardando(false);
        if (updated) {
            onUpdate();
        } else {
            onClose(); // si no hubo cambios
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <header className="modal-header">
                    <h2>{reporte.titulo}</h2>
                    <span className="badge">{reporte.estado.replace('_', ' ')}</span>
                    <button className="close-btn" onClick={onClose} aria-label="Cerrar">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </header>

                <div className="modal-body">
                    <div className="report-info">
                        <p><strong>Ubicación:</strong> {reporte.ubicaciones.nombre} - {reporte.detalle_ubicacion}</p>
                        <p><strong>Descripción:</strong> {reporte.descripcion}</p>
                    </div>

                    {fotos.length > 0 && (
                        <div className="fotos-grid">
                            {fotos.map(foto => (
                                <img 
                                    key={foto.id_foto} 
                                    src={foto.url_foto} 
                                    alt="Reporte" 
                                    className="foto-reporte" 
                                    onClick={() => setFotoAmpliada(foto.url_foto)}
                                    style={{ cursor: 'pointer' }}
                                />
                            ))}
                        </div>
                    )}

                    <div className="notas-section">
                        <h3>Notas de Seguimiento</h3>
                        {notas.length === 0 ? <p>No hay notas registradas.</p> : (
                            <ul className="notas-list">
                                {notas.map(nota => (
                                    <li key={nota.id_nota}>
                                        <strong>{nota.usuarios?.nombre || 'Admin'}:</strong> {nota.nota}
                                        <div className="nota-fecha">{new Date(nota.fecha_nota).toLocaleString()}</div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {perfil?.rol === 'admin' && (
                        <div className="admin-actions">
                            <h3>Acciones de Administrador</h3>
                            <label>Cambiar Estado:</label>
                            <select value={estado} onChange={e => setEstado(e.target.value)}>
                                <option value="pendiente">Pendiente</option>
                                <option value="en_proceso">En Proceso</option>
                                <option value="resuelto">Resuelto</option>
                                <option value="rechazado">Rechazado</option>
                            </select>

                            <label>Agregar Nota:</label>
                            <textarea
                                value={nuevaNota}
                                onChange={e => setNuevaNota(e.target.value)}
                                placeholder="Escribe detalles sobre la revisión o reparación..."
                            />
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button className="secondary" onClick={onClose}>Cerrar</button>
                    {perfil?.rol === 'admin' && (
                        <button className="primary" onClick={handleGuardar} disabled={guardando}>
                            {guardando ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    )}
                </div>
            </div>

            {/* Modal para foto ampliada */}
            {fotoAmpliada && (
                <div className="modal-overlay" onClick={() => setFotoAmpliada(null)} style={{ zIndex: 1100, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ position: 'relative', maxWidth: '90%', maxHeight: '90%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <button onClick={() => setFotoAmpliada(null)} style={{ position: 'absolute', top: '-15px', right: '-15px', background: 'var(--accent-color, #e74c3c)', color: 'white', border: 'none', borderRadius: '50%', width: '35px', height: '35px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.3)', zIndex: 1101 }}>
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                        <img src={fotoAmpliada} alt="Reporte Ampliado" style={{ maxWidth: '100%', maxHeight: '85vh', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.5)', background: '#000' }} onClick={e => e.stopPropagation()} />
                    </div>
                </div>
            )}
        </div>
    );
}

export default ReportModal;
