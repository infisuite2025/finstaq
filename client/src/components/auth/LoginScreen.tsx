import React, { useState, useEffect } from 'react';
import {
  Lock,
  Mail,
  Building2,
  Shield,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Sun,
  Moon,
  Key,
  BarChart3,
  Users,
  ShoppingCart,
  FileText,
  Package,
  Layers,
  Eye,
  EyeOff,
  Sparkles,
  ExternalLink,
  Globe,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export interface AuthSessionUser {
  email: string;
  role: 'SUPER_ADMIN' | 'OWNER' | 'ACCOUNTANT' | 'DATA_ENTRY';
  tenantId: string;
  tenantName?: string;
  subdomain?: string;
  tenantStatus?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'TRIAL';
  suspendedReason?: string;
}

interface LoginScreenProps {
  onLoginSuccess: (user: AuthSessionUser) => void;
  sessionExpiryNotice?: string | null;
}

// Utility: Detect tenant subdomain from browser URL
const getDetectedSubdomain = (): string | null => {
  if (typeof window === 'undefined') return null;
  const hostname = window.location.hostname.toLowerCase();
  
  // 1. Check for query param override for local testing (e.g., ?subdomain=zenith or ?tenant=novaretail)
  const params = new URLSearchParams(window.location.search);
  const subParam = params.get('subdomain') || params.get('workspace') || params.get('tenant');
  if (subParam) {
    return subParam.toLowerCase().trim();
  }

  // 2. Ignore raw IP addresses and standalone localhost
  if (hostname === 'localhost' || hostname === '127.0.0.1' || /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)) {
    return null;
  }
  
  const parts = hostname.split('.');
  const reserved = ['www', 'app', 'api', 'admin', 'superadmin', 'login', 'auth', 'billing', 'status', 'portal', 'mail'];
  
  // 3. Subdomain on custom domain (e.g., abc.finstaq.com or abc.mydomain.com)
  if (parts.length >= 3 && !reserved.includes(parts[0])) {
    return parts[0].toLowerCase().trim();
  }
  
  // 4. Subdomain on localhost (e.g., abc.localhost)
  if (parts.length === 2 && parts[1] === 'localhost' && !reserved.includes(parts[0])) {
    return parts[0].toLowerCase().trim();
  }
  
  return null;
};

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, sessionExpiryNotice }) => {
  const { theme, toggleTheme } = useTheme();
  const [subdomain, setSubdomain] = useState('apex');
  const [tenantGstin, setTenantGstin] = useState('27AABCF1234F1Z5');
  const [email, setEmail] = useState('owner@apexindustries.com');
  const [password, setPassword] = useState('Password@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const [selectedRole, setSelectedRole] = useState<'SUPER_ADMIN' | 'OWNER' | 'ACCOUNTANT' | 'DATA_ENTRY'>('OWNER');
  const [showPresets, setShowPresets] = useState(false);
  
  // Hybrid Subdomain States
  const [isSubdomainLocked, setIsSubdomainLocked] = useState(false);
  const [resolvedTenant, setResolvedTenant] = useState<{ id: string; name: string; subdomain: string; gstin: string; status: string } | null>(null);
  const [subdomainNotFound, setSubdomainNotFound] = useState(false);
  const [isResolvingSubdomain, setIsResolvingSubdomain] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Auto-detect & resolve subdomain from browser URL on mount
  useEffect(() => {
    const detected = getDetectedSubdomain();
    if (detected) {
      setSubdomain(detected);
      setIsSubdomainLocked(true);
      setIsResolvingSubdomain(true);

      fetch(`/api/v1/tenants/resolve/${detected}`)
        .then((res) => res.json())
        .then((res) => {
          setIsResolvingSubdomain(false);
          if (res.success && res.data) {
            setResolvedTenant(res.data);
            setTenantGstin(res.data.gstin || res.data.id);
            setSubdomainNotFound(false);
            if (res.data.contactEmail) {
              setEmail(res.data.contactEmail);
            }
          } else {
            setSubdomainNotFound(true);
            setError(`Workspace "${detected}" was not found. Please verify your domain.`);
          }
        })
        .catch(() => {
          setIsResolvingSubdomain(false);
        });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (selectedRole !== 'SUPER_ADMIN' && !tenantGstin.trim()) {
      setError('Company GSTIN / Tenant ID is required');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid business email address');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      if (selectedRole === 'SUPER_ADMIN') {
        setTimeout(() => {
          setIsLoading(false);
          onLoginSuccess({
            email: email.trim(),
            role: 'SUPER_ADMIN',
            tenantId: 'PLATFORM_SUPER_ADMIN',
            tenantName: 'Finstaq Platform Management',
            subdomain: 'admin',
            tenantStatus: 'ACTIVE',
          });
        }, 300);
        return;
      }

      // Resolve tenant by subdomain or gstin
      const res = await fetch(`/api/v1/tenants/resolve/${subdomain.trim().toLowerCase()}`);
      const data = await res.json();
      
      let tenantData: any = data?.data;
      if (!tenantData && tenantGstin) {
        const tListRes = await fetch('/api/v1/super-admin/tenants');
        const tListData = await tListRes.json();
        tenantData = tListData?.data?.find((t: any) => t.id === tenantGstin || t.gstin === tenantGstin);
      }

      setIsLoading(false);
      onLoginSuccess({
        email: email.trim(),
        role: selectedRole,
        tenantId: tenantData ? tenantData.id : tenantGstin.trim(),
        tenantName: tenantData ? tenantData.name : (resolvedTenant?.name || 'Apex Industries Ltd.'),
        subdomain: tenantData ? tenantData.subdomain : subdomain,
        tenantStatus: tenantData ? tenantData.status : 'ACTIVE',
        suspendedReason: tenantData?.suspendedReason,
      });
    } catch (err) {
      setIsLoading(false);
      onLoginSuccess({
        email: email.trim(),
        role: selectedRole,
        tenantId: tenantGstin.trim(),
        tenantName: resolvedTenant?.name || 'Apex Industries Ltd.',
        subdomain: subdomain,
        tenantStatus: 'ACTIVE',
      });
    }
  };

  const handleFillDemo = (
    role: 'SUPER_ADMIN' | 'OWNER' | 'ACCOUNTANT' | 'DATA_ENTRY',
    demoEmail: string,
    demoSubdomain: string,
    demoGstin: string
  ) => {
    setSelectedRole(role);
    setEmail(demoEmail);
    setPassword('Password@2026');
    setSubdomain(demoSubdomain);
    setTenantGstin(demoGstin);
    setError(null);
    setSubdomainNotFound(false);
  };

  const modulePills = [
    { icon: BarChart3, label: 'Finance', color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/50 border-blue-100 dark:border-blue-900/50' },
    { icon: Users, label: 'HR', color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 border-indigo-100 dark:border-indigo-900/50' },
    { icon: ShoppingCart, label: 'Sales', color: 'text-sky-600 bg-sky-50 dark:bg-sky-950/50 border-sky-100 dark:border-sky-900/50' },
    { icon: FileText, label: 'Purchase', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-100 dark:border-emerald-900/50' },
    { icon: Package, label: 'Inventory', color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/50 border-amber-100 dark:border-amber-900/50' },
    { icon: Layers, label: 'Projects', color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/50 border-purple-100 dark:border-purple-900/50' },
  ];

  return (
    <div className="min-h-screen w-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-10 relative overflow-hidden font-sans select-none transition-colors duration-200">
      {/* Theme Toggle Button in Top Right */}
      <div className="absolute top-6 right-6 z-30">
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-sm text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all flex items-center space-x-2 text-xs font-semibold cursor-pointer"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-indigo-600" />
              <span className="hidden sm:inline">Dark Mode</span>
            </>
          )}
        </button>
      </div>

      {/* Decorative ambient background glows */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-blue-400/10 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-indigo-400/10 dark:bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Split-Screen Container */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
        
        {/* ═══ LEFT HERO SECTION (55% / 7 cols) ═══ */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-8 pr-0 lg:pr-6">
          {/* Logo & Brand Header */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center font-black text-white text-xl shadow-md shadow-blue-500/20">
              F
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                FINSTAQ <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 uppercase tracking-wider">ERP</span>
              </span>
            </div>
          </div>

          {/* Hero Headlines */}
          <div className="space-y-4">
            <div className="inline-flex items-center space-x-2 text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span>ONE PLATFORM</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.15]">
              A More Connected <br />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 bg-clip-text text-transparent">
                Way to Work
              </span>
            </h1>
            <p className="text-base text-slate-600 dark:text-slate-400 max-w-lg leading-relaxed font-normal">
              Bring your people, processes, and financial data together with a single, high-speed integrated enterprise platform.
            </p>
          </div>

          {/* 6 Integrated Modules Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-3 gap-3 max-w-lg">
            {modulePills.map((m, idx) => {
              const Icon = m.icon;
              return (
                <div
                  key={idx}
                  className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border border-slate-200/80 dark:border-slate-800 p-4 rounded-2xl shadow-xs hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all flex flex-col items-center justify-center text-center space-y-2 group cursor-default"
                >
                  <div className={`p-2.5 rounded-xl border ${m.color} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{m.label}</span>
                </div>
              );
            })}
          </div>

          {/* Left Footer Values & Slogan */}
          <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
            <div>
              <p className="font-bold text-slate-900 dark:text-white">Streamline today.</p>
              <p className="text-slate-500">Scale for tomorrow.</p>
            </div>
            <div className="flex items-center space-x-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono">
              <span>INSIGHT</span>
              <span>•</span>
              <span>EFFICIENCY</span>
              <span>•</span>
              <span>GROWTH</span>
              <span>•</span>
              <span>TOGETHER</span>
            </div>
          </div>
        </div>

        {/* ═══ RIGHT SIGN-IN CARD (45% / 5 cols) ═══ */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl dark:shadow-2xl p-7 sm:p-9 relative z-20">
            
            {/* Top Slogan */}
            <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 text-center mb-6">
              PEOPLE &nbsp;/&nbsp; PROCESS &nbsp;/&nbsp; POSSIBILITIES
            </div>

            {/* Card Header — Branded by Resolved Tenant when detected */}
            <div className="mb-6 text-left">
              {resolvedTenant && isSubdomainLocked ? (
                <div className="space-y-1">
                  <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[11px] font-bold border border-blue-200 dark:border-blue-800 mb-2">
                    <Building2 className="w-3 h-3" />
                    <span>{resolvedTenant.name}</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    Welcome Back
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                    Sign in to your organization's ERP workspace
                  </p>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    Welcome Back
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
                    Sign in to access your ERP
                  </p>
                </>
              )}
            </div>

            {/* Session Expiry Notice */}
            {sessionExpiryNotice && (
              <div className="mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700/50 flex items-start space-x-2.5 text-xs text-amber-900 dark:text-amber-200">
                <Shield className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="leading-snug">
                  <span className="font-bold">Session Notice:</span> {sessionExpiryNotice}
                </div>
              </div>
            )}

            {/* Subdomain Not Found Banner */}
            {subdomainNotFound && (
              <div className="mb-4 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs space-y-2">
                <div className="flex items-center space-x-2 font-bold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Workspace Not Found</span>
                </div>
                <p className="text-[11px] text-rose-600 dark:text-rose-400">
                  No organization is registered at <strong className="font-mono">{subdomain}.finstaq.com</strong>.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsSubdomainLocked(false);
                    setSubdomainNotFound(false);
                    setError(null);
                    setSubdomain('apex');
                  }}
                  className="text-[11px] font-bold text-rose-800 dark:text-rose-200 underline cursor-pointer"
                >
                  Choose another workspace or sign in to default portal →
                </button>
              </div>
            )}

            {/* General Error Alert */}
            {error && !subdomainNotFound && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/80 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email / Username */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Email or Username
                </label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email or username"
                    className="w-full bg-slate-50/80 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-slate-50/80 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Subdomain Workspace Indicator */}
              <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <Globe className="w-3 h-3 text-blue-500" />
                  Workspace: <strong className="font-mono text-slate-700 dark:text-slate-300">{subdomain}.finstaq.com</strong>
                </span>
                {!isSubdomainLocked ? (
                  <button
                    type="button"
                    onClick={() => setShowPresets(!showPresets)}
                    className="text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer"
                  >
                    {showPresets ? 'Hide presets' : 'Change preset'}
                  </button>
                ) : (
                  <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> URL Locked
                  </span>
                )}
              </div>

              {/* Quick Demo Credentials Switcher (collapsible for non-locked mode) */}
              {showPresets && !isSubdomainLocked && (
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5 animate-in fade-in">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 flex items-center space-x-1 uppercase tracking-wider">
                    <Key className="w-3 h-3 text-blue-500" />
                    <span>Select Preset Workspace:</span>
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleFillDemo('SUPER_ADMIN', 'superadmin@finstaq.com', 'admin', 'PLATFORM_SUPER_ADMIN')}
                      className={`p-1.5 rounded-lg text-[10px] border transition-all text-left truncate ${
                        selectedRole === 'SUPER_ADMIN'
                          ? 'bg-indigo-600 text-white border-indigo-600 font-bold'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      👑 Super Admin
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFillDemo('OWNER', 'owner@apexindustries.com', 'apex', '27AABCF1234F1Z5')}
                      className={`p-1.5 rounded-lg text-[10px] border transition-all text-left truncate ${
                        selectedRole === 'OWNER' && subdomain === 'apex'
                          ? 'bg-blue-600 text-white border-blue-600 font-bold'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      🏢 Apex Industries
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFillDemo('ACCOUNTANT', 'accounts@zenithlogistics.in', 'zenith', '29ABCDE5678G2Z3')}
                      className={`p-1.5 rounded-lg text-[10px] border transition-all text-left truncate ${
                        subdomain === 'zenith'
                          ? 'bg-blue-600 text-white border-blue-600 font-bold'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      🚚 Zenith Logistics
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFillDemo('OWNER', 'finance@novaretail.com', 'novaretail', '06XYZPA9988H1Z1')}
                      className={`p-1.5 rounded-lg text-[10px] border transition-all text-left truncate ${
                        subdomain === 'novaretail'
                          ? 'bg-rose-600 text-white border-rose-600 font-bold'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      ⛔ Nova (Suspended)
                    </button>
                  </div>
                </div>
              )}

              {/* Keep Signed In + Forgot Password */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center space-x-2 cursor-pointer text-slate-600 dark:text-slate-400 font-medium">
                  <input
                    type="checkbox"
                    checked={keepSignedIn}
                    onChange={(e) => setKeepSignedIn(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 accent-blue-600"
                  />
                  <span>Keep me signed in</span>
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => { e.preventDefault(); alert('Password recovery instructions sent to registered administrator email.'); }}
                  className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
                >
                  Forgot password?
                </a>
              </div>

              {/* Primary Sign In Button */}
              <button
                type="submit"
                disabled={isLoading || subdomainNotFound || isResolvingSubdomain}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center space-x-2 cursor-pointer active:scale-[0.99] disabled:opacity-50"
              >
                {isLoading || isResolvingSubdomain ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800" />
              </div>
              <span className="relative bg-white dark:bg-slate-900 px-3 text-[11px] text-slate-400 uppercase font-mono">
                or
              </span>
            </div>

            {/* Microsoft Single Sign-On Button */}
            <button
              type="button"
              onClick={() => {
                handleFillDemo('OWNER', 'owner@apexindustries.com', 'apex', '27AABCF1234F1Z5');
                handleSubmit({ preventDefault: () => {} } as any);
              }}
              className="w-full bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200 font-semibold py-2.5 px-4 rounded-xl text-xs border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center space-x-2.5 shadow-2xs cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 21 21">
                <path fill="#f25022" d="M1 1h9v9H1z"/>
                <path fill="#00a4ef" d="M1 11h9v9H1z"/>
                <path fill="#7fba00" d="M1 11h9v9H11z"/>
                <path fill="#ffb900" d="M11 11h9v9H11z"/>
              </svg>
              <span>Sign in with Microsoft</span>
            </button>

            {/* Bottom Slogan */}
            <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-center space-x-2 text-[11px] text-slate-400">
              <span>A smarter business starts here.</span>
              <span className="w-5 h-0.5 bg-blue-500 rounded-full" />
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
