'use client';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import { refresh } from "@/features/auth/authSlice";
import Login from "./Login";
import Register from "./Register";

export default function SignPage () {
    const dispatch = useDispatch<AppDispatch>();
    const { loading, user, profile } = useSelector((state: RootState) => state.auth)
    const router = useRouter();
    const [signUp, setSignUp] = useState(false);
    const [signIn, setSignIn] = useState(true);

    useEffect(() => {
        if (!user) {
            dispatch(refresh());
        }
    }, [user])

    useEffect(() => {
        if (!loading && user && profile) {
            if (profile.role === 'admin') {
                router.push('/admin/dashboard');
            } else {
                router.push('/entities');
            }
        }
    }, [user, profile, loading]);

    const handleChangeForm = (e: EventTarget & HTMLButtonElement) => {
        if(e.classList.contains('signUp-btn')) {
            setSignUp(true);
            setSignIn(false);
        } else {
            setSignUp(false);
            setSignIn(true);
        }
    };

    return (
        <div className="sign-page">
            <div className="container">
                <header className="sign-page-header">
                    <div className="container" />
                </header>
                <main className="sign-page-main">
                    <div className="container">
                        <div className="chage-form">
                            <button className={`signIn-btn ${signIn ? 'active' : ''}`}
                                onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleChangeForm(e.currentTarget)}
                            >
                            signIn</button>
                            <button className={`signUp-btn ${signUp ? 'active' : ''}`} 
                                onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleChangeForm(e.currentTarget)}
                            >
                            signUp</button>
                        </div>
                        { signIn && <Login /> }
                        { signUp && <Register /> }
                    </div>
                </main>
                <footer className="sign-page-footer">
                    <div className="container" />
                </footer>
            </div>
        </div>
    )
}