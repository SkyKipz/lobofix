import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

function ReportForm({ onReportCreated, onClose }) {
    const [titulo, setTitulo] = useState('');
    const [categoria, setCategoria] = useState('');
    const [desc, setDesc] = useState('');
    const [ubicacionId, setUbicacionId] = useState('');
    const [detalle, setDetalle] = useState('');
    const [fotos, setFotos] = useState([]);
    const [ubicaciones, setUbicaciones] = useState([]);
    const [enviando, setEnviando] = useState(false);

    useEffect(() => {
        // Cargar el catálogo de ubicaciones
        supabase.from('ubicaciones').select('*').eq('activa', true).then(({ data }) => setUbicaciones(data));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setEnviando(true);

        const { data: { user } } = await supabase.auth.getUser();

        // 1. Insertar el reporte
        const { data: nuevoRep, error: errorRep } = await supabase
            .from('reportes')
            .insert([{
                id_usuario: user.id, id_ubicacion: ubicacionId,
                detalle_ubicacion: detalle, titulo, descripcion: desc,
                categoria: categoria
            }])
            .select().single();

        if (errorRep) return alert(errorRep.message);

        // 2. Subir Fotos al Storage
        for (const file of fotos) {
            const fileName = `${Date.now()}_${file.name}`;
            const { data: fData, error: fError } = await supabase.storage
                .from('fotos_reportes')
                .upload(`${user.id}/${fileName}`, file);

            if (fData) {
                const { data: { publicUrl } } = supabase.storage.from('fotos_reportes').getPublicUrl(fData.path);
                // 3. Guardar URL en la BD
                await supabase.from('fotos_reporte').insert([{ id_reporte: nuevoRep.id_reporte, url_foto: publicUrl }]);
            }
        }

        setEnviando(false);
        onReportCreated(); // Refrescar lista
        if (onClose) onClose(); // Cerrar el modal para evitar envíos dobles
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <header className="modal-header">
                    <h2>Nuevo Reporte</h2>
                    <button className="close-btn" type="button" onClick={onClose} aria-label="Cerrar">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </header>
                <div className="modal-body">
                    <form onSubmit={handleSubmit} className="form-reporte" style={{ marginBottom: 0, borderLeft: 'none', boxShadow: 'none', padding: 0 }}>
                        <input placeholder="Título (ej: Silla rota)" value={titulo} onChange={e => setTitulo(e.target.value)} required />
                        <input placeholder="Categoría (ej: Mobiliario, Eléctrico, Plomería)" value={categoria} onChange={e => setCategoria(e.target.value)} required />
                        <select value={ubicacionId} onChange={e => setUbicacionId(e.target.value)} required>
                            <option value="">Selecciona Edificio...</option>
                            {ubicaciones.map(u => <option key={u.id_ubicacion} value={u.id_ubicacion}>{u.nombre}</option>)}
                        </select>
                        <input placeholder="Detalle preciso (ej: Salón 301)" value={detalle} onChange={e => setDetalle(e.target.value)} required />
                        <textarea placeholder="Descripción del daño" value={desc} onChange={e => setDesc(e.target.value)} />

                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-primary)', fontWeight: '600', fontSize: '0.9rem' }}>
                            Evidencia Fotográfica:
                        </label>
                        <input type="file" multiple onChange={e => setFotos(e.target.files)} accept=".jpg,.jpeg,.png,.gif,.webp" />

                        <div className="modal-footer" style={{ marginTop: '20px', padding: '20px 0 0 0' }}>
                            <button type="button" className="secondary" onClick={onClose}>Cancelar</button>
                            <button type="submit" disabled={enviando} className="primary">{enviando ? 'Subiendo...' : 'Enviar Reporte'}</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ReportForm;