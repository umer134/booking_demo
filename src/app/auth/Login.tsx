import { useState } from "react"
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";
import { signIn } from "@/features/auth/authSlice";

export default function Login ( ) {
    const dispatch = useDispatch<AppDispatch>();
    const { loading, error } = useSelector((state: RootState) => state.auth);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [formError, setFromError] = useState('')

    const handleSignIn = () => {
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
        dispatch(signIn({email, password}));
    };

    return (
        <div className="login-form">
            <div className="container">
                <form action={handleSignIn}>
                    <div className="login-inputs">
                    <input type="email" placeholder="type email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    <input type="password" placeholder="type password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                    {formError && <p className="error">{formError}</p>}
                    <div className="login-btn">
                        {loading ? 
                        <button  disabled>loading...</button> :
                        <button type="submit">signIn</button>
                        }
                    </div>
                </form>
            </div>
        </div>
    );

};