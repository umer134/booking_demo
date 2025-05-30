'use client'
import { useSelector, useDispatch } from "react-redux"
import type { RootState, AppDispatch } from "@/store/store"
import { createEntity, getMyEntities } from "@/features/entities/entitiSlice"
import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import { logout } from "@/features/auth/authSlice";
import './Admin.css';

export default function Admin () {
    const dispatch = useDispatch<AppDispatch>();
    const { entities, loading, creatingEntityLoading, error: entityError } = useSelector((state: RootState) => state.entity);
    const { user, profile, authStatus, loading: authLoading, error: authError } = useSelector((state: RootState) => state.auth);
    const [showForm, setShowForm] = useState(false);
    const [name, setName] = useState<string>('');
    const [address, setAddress] = useState<string>('');
    const [capacity, setCapacity] = useState<number>(0);
    const [image, setImage] = useState<File | undefined>(undefined);

    useEffect(() => {
        if(user?.id && profile?.id) {
            dispatch(getMyEntities())
        }
    }, [user, profile, dispatch]);

    useEffect(() => {
        if ((authStatus === 'succeeded' || authStatus === 'idle') && !user && !profile) {
            redirect('/auth'); 
        }
    }, [authStatus, user, profile]);


   return (
    <div className="page">
        {creatingEntityLoading && 
            <div className="overlay-loading">
                Создание новой карточки...
                <div className="overlay-spinner" />
            </div>
        }
        <div className="header">
            <div><strong>{user?.user_metadata?.name || "user.name"} {authError && <div>{authError.message}</div>}</strong></div>
            <button onClick={() => dispatch(logout())} className="logout">
                {authLoading ? <div className="logautSpinner"/> : 'Выйти'}
            </button>
        </div>

        <div className="top-bar">
            <h2 className="title">Мои квартиры</h2>
            {entityError && <div>{entityError.message}</div>}
            <button onClick={() => setShowForm(prev => !prev)} className="create-btn">
                Создать новую  +
            </button>
        </div>

        {showForm && (
            <div className="form-container">
                <form onSubmit={(e) => {
                     e.preventDefault();
                    if (!name || !address || !capacity) return;
                    dispatch(createEntity({ name, address, capacity, image: image?? undefined }));
                    setShowForm(false);
                }}>
                    <input
                        type="text"
                        value={name}
                        placeholder="Название"
                        onChange={(e) => setName(e.target.value)}
                    />
                    <input
                        type="text"
                        value={address}
                        placeholder="Адрес"
                        onChange={(e) => setAddress(e.target.value)}
                    />
                    <input
                        type="number"
                        value={capacity}
                        placeholder="Вместимость"
                        onChange={(e) => setCapacity(e.target.valueAsNumber)}
                    />
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImage(e.target.files?.[0] || undefined)}
                    />
                    <button type="submit">Создать</button>
                </form>
            </div>
        )}

        <div className="card-list">
            {loading && (
                <div className="loading-container">
                    <div className="spinner" />
                </div>
            )}
            {entities?.map((entity) => (
                <div key={entity.id} className="card-wrapper">
                    <div
                        className="card"
                        style={{
                            backgroundImage:`url(${entity.image_url || '../DefaultImageAppartment.avif'})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                        }}
                    >
                        <div className="card-overlay">
                            <strong>{entity.name}</strong><br />
                            {entity.address}<br />
                            Комнат: {entity.capacity}
                        </div>
                    </div>
                    {entity.pdf_path && (
                        <div className="pdf">
                            <a
                                href={entity.pdf_path}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="pdf-link"
                                download
                            >
                                📄 Скачать PDF
                            </a>
                        </div>
                    )}
                </div>
            ))}
        </div>
    </div>
)
}

