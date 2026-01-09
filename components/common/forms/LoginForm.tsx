import React, { useState } from 'react';
import { Button, Input } from '../ui';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

interface LoginFormProps {
  onSubmit: (email: string, password: string) => void;
  loading?: boolean;
  error?: string;
}

const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  loading = false,
  error,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(email, password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        type="email"
        label="البريد الإلكتروني"
        placeholder="example@email.com"
        value={email}
        onChange={setEmail}
        required
        icon={<Mail size={20} />}
        error={error}
      />
      
      <Input
        type={showPassword ? 'text' : 'password'}
        label="كلمة المرور"
        placeholder="••••••••"
        value={password}
        onChange={setPassword}
        required
        icon={
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-slate-400 hover:text-white transition-colors"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        }
      />

      <Button
        type="submit"
        loading={loading}
        disabled={!email || !password}
        className="w-full py-4"
      >
        تسجيل الدخول
      </Button>
    </form>
  );
};

export default LoginForm;
