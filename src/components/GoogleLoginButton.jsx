import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const GoogleLoginButton = ({ setUser }) => {
    const navigate = useNavigate();

    useEffect(() => {
        /* global google */
        const handleCredentialResponse = (response) => {
            const userObject = JSON.parse(atob(response.credential.split('.')[1]));
            setUser({
                name: userObject.name,
                email: userObject.email,
                picture: userObject.picture,
            });
            navigate('/dashboard');
        };

        google.accounts.id.initialize({
            client_id: 'YOUR_CLIENT_ID_HERE',
            callback: handleCredentialResponse,
        });

        google.accounts.id.renderButton(
            document.getElementById('googleSignInDiv'),
            { theme: 'outline', size: 'large' }
        );
    }, []);

    return <div id="googleSignInDiv"></div>;
};

export default GoogleLoginButton;
