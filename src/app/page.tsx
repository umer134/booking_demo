'use client'
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import type { RootState, AppDispatch } from '@/store/store';
import { refresh } from '@/features/auth/authSlice';

export default function Home() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { user, loading, profile } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(refresh()); 
    if(!user) {
      router.push('/auth')
    }
  }, [dispatch]);

 useEffect(() => {
  if (!loading && user) {
    if (profile?.role === 'admin') {
      router.push('/admin/dashboard');
    } else {
      router.push('/entities');
    }
  }
}, [user, loading, profile, router]);

  if (loading) return <p>Загрузка...</p>;

  return null;
}