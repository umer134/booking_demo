import { useState } from "react";
import type { AppDispatch, RootState } from "@/store/store";
import { signUp, cleanError } from "@/features/auth/authSlice";
import { useDispatch, useSelector } from "react-redux";
import "./Auth.css";

export default function Register () {
    const dispatch = useDispatch<AppDispatch>();
    const { loading, error } = useSelector((state: RootState) => state.auth);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [formError, setFromError] = useState('')

    const handleSignUp = () => {
    if (!email || !password) {
      setFromError('Все поля обязательны');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFromError('Неверный формат email');
      return;
    }
    setFromError('');
        dispatch(signUp({name, email, password, role: "user"}));
    }
    
    return (
        <div className="register-form">
            <div className="container">
                {error && <div style={{marginBottom:'10px'}}>⚠️ {error?.message} <button onClick={() => dispatch(cleanError())}>clean</button></div>}
                <form action={handleSignUp}>
                    <div className="register-inputs">
                        <input type="text" placeholder="type username" value={name} onChange={(e) => setName(e.target.value)} />
                        <input type="email" placeholder="type email" value={email} onChange={(e) => setEmail(e.target.value)} />
                        <input type="password" placeholder="type password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                    {formError && <p className="error">{formError}</p>}
                    <div className="register-btn">
                        { loading ? <button disabled>loading...</button> : <button type="submit" >signUp</button> }
                    </div>
                </form>
            </div>
        </div>
    );
};