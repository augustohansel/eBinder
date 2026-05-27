import { useState } from 'react';
import { loginUser } from '../api';

interface LoginPageProps {
  onLogin: (userId: string) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const user = await loginUser(username);
      // Salva o ID no armazenamento do navegador
      localStorage.setItem('pokelist_user_id', user.id);
      // Avisa o App.tsx que logamos com sucesso
      onLogin(user.id);
    } catch (err) {
      setError('Usuário não encontrado. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0f0f13', color: '#fff' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '3rem', margin: '0' }}>
          <span style={{ opacity: 0.5 }}>my</span>Poké<span style={{ color: '#3b82f6' }}>list</span>
        </h1>
        <p style={{ color: '#9ca3af' }}>Acesse seu fichário 3D</p>
      </div>

      <form onSubmit={handleLogin} style={{ background: '#1e1e24', padding: '32px', borderRadius: '16px', width: '100%', maxWidth: '360px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
        
        {error && <p style={{ color: '#ef4444', marginBottom: '16px', textAlign: 'center', fontWeight: 'bold' }}>{error}</p>}

        <label style={{ display: 'block', marginBottom: '8px', color: '#9ca3af' }}>Nome de Usuário</label>
        <input 
          required
          type="text"
          placeholder="Ex: ash_ketchum"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #374151', background: '#0f0f13', color: '#fff', marginBottom: '24px', boxSizing: 'border-box' }}
        />

        <button 
          type="submit" 
          disabled={isLoading || !username}
          style={{ width: '100%', padding: '14px', borderRadius: '8px', border: 'none', background: '#3b82f6', color: '#fff', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}
        >
          {isLoading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}