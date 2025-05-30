"use client";
import { useDispatch, useSelector } from "react-redux";
import { logout, refresh } from "@/features/auth/authSlice";
import { AppDispatch, RootState } from "@/store/store";
import { redirect } from "next/navigation";
import { useEffect } from "react";
import { getEntities } from "@/features/entities/entitiSlice";
import Link from "next/link";
import "./Entities.css";

export default function Entities() {
    const dispatch = useDispatch<AppDispatch>();
    const { user, profile, authStatus, loading, error:authError } = useSelector((state: RootState) => state.auth);
    const { entities, loading:entitiesLoading, error:entityError } = useSelector((state: RootState) => state.entity);

    useEffect(() => {
        if (user && profile) {
            dispatch(getEntities());
        }
    }, [user, profile, dispatch]);

    useEffect(() => {
        if ((authStatus === "succeeded" || authStatus === "idle") && !user && !profile && !loading) {
            redirect("/auth");
        }
    }, [authStatus, user, profile, loading]);

    return (
        <div className="entities-page">
            <div className="header">
                <span className="username">{user?.user_metadata.name} {authError && <div>{authError.message}</div>}</span>
                <button className="logout-button" onClick={() => dispatch(logout())}>
                    {loading ? <div className="logautSpinner"/> : 'Выйти'}
                </button>
            </div>

            <h1 className="title">Каталог квартир</h1>
                {entityError && <div>{entityError.message}</div>}
            <div className="entities-grid">
                {entitiesLoading && (
                <div className="loading-container">
                    <div className="spinner" />
                </div>
                )}
                {entities?.map((entity) => (
                    <div key={entity.id}>
                    <Link
                        href={`/entities/${entity.id}`}
                        className="entity-card group"
                        style={{
                        backgroundImage:`url(${entity.image_url || './DefaultImageAppartment.avif'})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        position: 'relative', // для оверлея
                        }}
                    >
                        {/* Оверлей — затемнение */}
                        <div className="overlay" />

                        {/* Контент поверх */}
                        <div className="entity-content">
                        <div className="entity-name">{entity.name}</div>
                        <div className="entity-address">{entity.address}</div>
                        <div className="entity-capacity">комнат: {entity.capacity}</div>
                        </div>
                    </Link>

                    {entity.pdf_path && (
                        <div className="entity-pdf">
                        <a
                            href={entity.pdf_path}
                            target="_blank"
                            rel="noopener noreferrer"
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
    );
}
