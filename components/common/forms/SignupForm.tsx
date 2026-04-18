import React, { useState } from 'react';
import { Button, Input } from '../ui';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SignupFormProps {
  onSubmit: (name: string, email: string, password: string) => void;
  loading?: boolean;
  error?: string;
}

const SignupForm: React.FC<SignupFormProps> = ({
  onSubmit,
  loading = false,
  error,
}) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(name, email, password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        type="text"
        label={t('common.forms.signup.nameLabel')}
        placeholder={t('common.forms.signup.namePlaceholder')}
        value={name}
        onChange={setName}
        required
        icon={<User size={20} />}
      />

      <Input
        type="email"
        label={t('common.forms.signup.emailLabel')}
        placeholder="example@email.com"
        value={email}
        onChange={setEmail}
        required
        icon={<Mail size={20} />}
        error={error}
      />
      
      <Input
        type={showPassword ? 'text' : 'password'}
        label={t('common.forms.signup.passwordLabel')}
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
        disabled={!name || !email || !password}
        className="w-full py-4"
      >
        {t('common.forms.signup.submit')}
      </Button>
    </form>
  );
};

export default SignupForm;
