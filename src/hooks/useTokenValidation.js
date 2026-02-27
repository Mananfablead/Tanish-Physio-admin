import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { validateTokenAppType } from '@/features/auth/authSlice';

// Hook to automatically validate token app type compatibility
export const useTokenValidation = () => {
    const dispatch = useDispatch();
    const { isAuthenticated, token } = useSelector((state) => state.auth);

    useEffect(() => {
        // Only validate if we're authenticated
        if (isAuthenticated && token) {
            console.log('🔍 Validating admin token app type compatibility...');
            dispatch(validateTokenAppType());
        }
    }, [isAuthenticated, token, dispatch]);

    return null;
};