import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Loader2, CheckCircle, XCircle, Mail } from 'lucide-react';

const API_BASE = '/api';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'no-token'>('loading');
  const [message, setMessage] = useState('');
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('no-token');
      setMessage('Kein Verifizierungstoken gefunden.');
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(`${API_BASE}/auth/verify-email?token=${token}`);
        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage(data.message || 'E-Mail erfolgreich verifiziert!');
          
          // If token is returned, save it for auto-login
          if (data.token) {
            localStorage.setItem('token', data.token);
            // Redirect to home after 3 seconds
            setTimeout(() => {
              navigate('/');
              window.location.reload();
            }, 3000);
          }
        } else {
          setStatus('error');
          setMessage(data.message || 'Verifizierung fehlgeschlagen.');
        }
      } catch (error) {
        setStatus('error');
        setMessage('Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
      }
    };

    verifyEmail();
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {status === 'loading' && (
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            )}
            {status === 'success' && (
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            )}
            {status === 'error' && (
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            )}
            {status === 'no-token' && (
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-yellow-600" />
              </div>
            )}
          </div>
          <CardTitle className="text-2xl">
            {status === 'loading' && 'E-Mail wird verifiziert...'}
            {status === 'success' && 'Erfolgreich verifiziert! 🎉'}
            {status === 'error' && 'Verifizierung fehlgeschlagen'}
            {status === 'no-token' && 'Fehlender Token'}
          </CardTitle>
          <CardDescription className="text-base mt-2">
            {message}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {status === 'success' && (
            <>
              <p className="text-sm text-gray-600">
                Sie werden in wenigen Sekunden automatisch weitergeleitet...
              </p>
              <Button 
                onClick={() => {
                  navigate('/');
                  window.location.reload();
                }}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              >
                Jetzt zur Startseite →
              </Button>
            </>
          )}
          
          {status === 'error' && (
            <div className="space-y-3">
              <Button 
                onClick={() => navigate('/login')}
                variant="outline"
                className="w-full"
              >
                Zur Anmeldeseite
              </Button>
              <p className="text-xs text-gray-500">
                Bei Problemen kontaktieren Sie bitte den Support.
              </p>
            </div>
          )}
          
          {status === 'no-token' && (
            <Button 
              onClick={() => navigate('/login')}
              className="w-full"
            >
              Zur Anmeldeseite
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
