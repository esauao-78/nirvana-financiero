import React, { useState, useEffect } from 'react';
import { Moon, Sun, Menu, X, TrendingUp, Target, CheckSquare, DollarSign, BookOpen, BarChart3, Settings, MessageCircle, LogOut, Download, Plus, Trash2, Edit2, Save, Calendar } from 'lucide-react';

// Configuración de colores
const colors = {
  gold: '#D4AF37',
  blue: '#1E3A8A',
  red: '#DC2626',
  green: '#10B981',
};

const App = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [currentView, setCurrentView] = useState('login');
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [coachOpen, setCoachOpen] = useState(false);
  const [emergencyMode, setEmergencyMode] = useState(false);
  
  // Estados principales
  const [identidad, setIdentidad] = useState({
    palabraDelAño: '',
    fraseDelAño: '',
    porQue: '',
    noNegociables: [],
    alterEgo: '',
    estadoEmocionalIdeal: ''
  });

  const [prosperidad, setProsperidad] = useState({
    economica: { hoy: 5, deseado: 10 },
    emocional: { hoy: 5, deseado: 10 },
    fisica: { hoy: 5, deseado: 10 },
    relacional: { hoy: 5, deseado: 10 },
    entorno: { hoy: 5, deseado: 10 }
  });

  const [metas, setMetas] = useState([]);
  const [habitos, setHabitos] = useState([]);
  const [diario, setDiario] = useState({});
  const [finanzas, setFinanzas] = useState({});
  const [openAIKey, setOpenAIKey] = useState('');

  // Cargar tema
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') setDarkMode(true);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Componente de Login/Registro
  const LoginView = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);

    const handleLogin = (e) => {
      e.preventDefault();
      // Simulación de login - en producción conectar con backend
      const userData = {
        email,
        name: email.split('@')[0],
        id: Date.now()
      };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      setCurrentView('onboarding');
    };

    const handleGoogleLogin = () => {
      // Simulación de Google Auth - en producción usar Firebase o similar
      const userData = {
        email: 'usuario@gmail.com',
        name: 'Usuario Demo',
        id: Date.now()
      };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      setCurrentView('onboarding');
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
        <div className="absolute top-4 right-4">
          <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-lg">
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: colors.gold }}>
              Juega Tu Propio Juego
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Alcanza el Nirvana Financiero
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-200">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-200">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-lg font-semibold text-white transition-all hover:opacity-90"
              style={{ backgroundColor: colors.blue }}
            >
              {isRegistering ? 'Registrarse' : 'Iniciar Sesión'}
            </button>
          </form>

          <div className="mt-4">
            <button
              onClick={handleGoogleLogin}
              className="w-full py-3 border-2 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continuar con Google
            </button>
          </div>

          <p className="text-center mt-4 text-sm dark:text-gray-300">
            {isRegistering ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}
            <button
              onClick={() => setIsRegistering(!isRegistering)}
              className="ml-2 font-semibold"
              style={{ color: colors.gold }}
            >
              {isRegistering ? 'Inicia sesión' : 'Regístrate'}
            </button>
          </p>
        </div>
      </div>
    );
  };

  // Componente de Onboarding
  const OnboardingView = () => {
    const [step, setStep] = useState(1);
    const [tempIdentidad, setTempIdentidad] = useState(identidad);
    const [tempProsperidad, setTempProsperidad] = useState(prosperidad);
    const [tempNoNegociable, setTempNoNegociable] = useState('');

    const saveAndContinue = async () => {
      if (step === 5) {
        setIdentidad(tempIdentidad);
        await window.storage.set('identidad:anual', JSON.stringify(tempIdentidad));
        setCurrentView('prosperidad-test');
      } else if (step === 6) {
        setProsperidad(tempProsperidad);
        await window.storage.set('prosperidad:test', JSON.stringify(tempProsperidad));
        setCurrentView('dashboard');
      } else {
        setStep(step + 1);
      }
    };

    const addNoNegociable = () => {
      if (tempNoNegociable.trim()) {
        setTempIdentidad({
          ...tempIdentidad,
          noNegociables: [...tempIdentidad.noNegociables, tempNoNegociable]
        });
        setTempNoNegociable('');
      }
    };

    const removeNoNegociable = (index) => {
      setTempIdentidad({
        ...tempIdentidad,
        noNegociables: tempIdentidad.noNegociables.filter((_, i) => i !== index)
      });
    };

    if (step === 6) {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
              <h2 className="text-3xl font-bold mb-6 text-center" style={{ color: colors.gold }}>
                Test de Prosperidad Integral
              </h2>
              <p className="text-center text-gray-600 dark:text-gray-300 mb-8">
                Evaluemos dónde estás hoy en los 5 pilares de tu vida
              </p>

              {Object.keys(tempProsperidad).map((pilar) => {
                const gap = tempProsperidad[pilar].deseado - tempProsperidad[pilar].hoy;
                return (
                  <div key={pilar} className="mb-8">
                    <h3 className="text-xl font-semibold mb-4 capitalize dark:text-white">
                      {pilar === 'fisica' ? 'Salud Física' : pilar === 'relacional' ? 'Relaciones' : pilar}
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm mb-2 dark:text-gray-300">Hoy (1-10)</label>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={tempProsperidad[pilar].hoy}
                          onChange={(e) => setTempProsperidad({
                            ...tempProsperidad,
                            [pilar]: { ...tempProsperidad[pilar], hoy: parseInt(e.target.value) }
                          })}
                          className="w-full"
                        />
                        <div className="text-center text-2xl font-bold mt-2" style={{ color: colors.blue }}>
                          {tempProsperidad[pilar].hoy}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm mb-2 dark:text-gray-300">Deseado (1-10)</label>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={tempProsperidad[pilar].deseado}
                          onChange={(e) => setTempProsperidad({
                            ...tempProsperidad,
                            [pilar]: { ...tempProsperidad[pilar], deseado: parseInt(e.target.value) }
                          })}
                          className="w-full"
                        />
                        <div className="text-center text-2xl font-bold mt-2" style={{ color: colors.gold }}>
                          {tempProsperidad[pilar].deseado}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3 text-sm text-center">
                      Gap: <span className={`font-bold ${gap > 5 ? 'text-red-600' : gap > 3 ? 'text-orange-500' : 'text-green-600'}`}>
                        {gap} puntos
                      </span>
                    </div>
                  </div>
                );
              })}

              <button
                onClick={saveAndContinue}
                className="w-full mt-6 py-3 rounded-lg font-semibold text-white"
                style={{ backgroundColor: colors.blue }}
              >
                Completar Configuración
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 p-6 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-2xl">
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <div
                  key={s}
                  className={`h-2 flex-1 mx-1 rounded ${s <= step ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-gray-300'}`}
                  style={s <= step ? { background: `linear-gradient(to right, ${colors.blue}, ${colors.gold})` } : {}}
                />
              ))}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 text-right">Paso {step} de 5</p>
          </div>

          <div className="min-h-[300px]">
            {step === 1 && (
              <div>
                <h2 className="text-3xl font-bold mb-4" style={{ color: colors.gold }}>
                  Tu Palabra del Año
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  ¿Qué palabra quieres que te acompañe cada día del año?
                </p>
                <input
                  type="text"
                  value={tempIdentidad.palabraDelAño}
                  onChange={(e) => setTempIdentidad({ ...tempIdentidad, palabraDelAño: e.target.value })}
                  placeholder="Ej: ABUNDANCIA, LIBERTAD, CRECIMIENTO..."
                  className="w-full px-4 py-3 text-2xl text-center font-bold border-2 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white uppercase"
                />
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="text-3xl font-bold mb-4" style={{ color: colors.gold }}>
                  Tu Frase del Año
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Algo que te recuerde tu dirección cada mañana
                </p>
                <textarea
                  value={tempIdentidad.fraseDelAño}
                  onChange={(e) => setTempIdentidad({ ...tempIdentidad, fraseDelAño: e.target.value })}
                  placeholder="Ej: Este año construyo mi libertad financiera con paz interior..."
                  className="w-full px-4 py-3 border-2 rounded-lg h-32 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 className="text-3xl font-bold mb-4" style={{ color: colors.gold }}>
                  Tu ¿Por Qué?
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  ¿Por qué vale la pena vivir este año con intención y disciplina?
                </p>
                <textarea
                  value={tempIdentidad.porQue}
                  onChange={(e) => setTempIdentidad({ ...tempIdentidad, porQue: e.target.value })}
                  placeholder="Escribe tu razón profunda..."
                  className="w-full px-4 py-3 border-2 rounded-lg h-40 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            )}

            {step === 4 && (
              <div>
                <h2 className="text-3xl font-bold mb-4" style={{ color: colors.gold }}>
                  Tus No Negociables
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Aspectos de tu vida que no vas a ceder por dinero, miedo o presión
                </p>
                
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={tempNoNegociable}
                    onChange={(e) => setTempNoNegociable(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addNoNegociable()}
                    placeholder="Ej: Tiempo con familia"
                    className="flex-1 px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <button
                    onClick={addNoNegociable}
                    className="px-4 py-2 rounded-lg text-white"
                    style={{ backgroundColor: colors.blue }}
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-2">
                  {tempIdentidad.noNegociables.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      <span className="dark:text-white">{item}</span>
                      <button onClick={() => removeNoNegociable(idx)} className="text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 5 && (
              <div>
                <h2 className="text-3xl font-bold mb-4" style={{ color: colors.gold }}>
                  Tu Alter-Ego
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  ¿Qué versión de ti vas a invocar para jugar tu mejor juego?
                </p>
                <input
                  type="text"
                  value={tempIdentidad.alterEgo}
                  onChange={(e) => setTempIdentidad({ ...tempIdentidad, alterEgo: e.target.value })}
                  placeholder="Ej: El Arquitecto de Mi Destino"
                  className="w-full px-4 py-3 text-xl font-semibold border-2 rounded-lg mb-6 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />

                <h2 className="text-2xl font-bold mb-4" style={{ color: colors.gold }}>
                  Tu Estado Emocional Ideal
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  ¿Cuál es la emoción que quieres sentir la mayor parte del tiempo?
                </p>
                <input
                  type="text"
                  value={tempIdentidad.estadoEmocionalIdeal}
                  onChange={(e) => setTempIdentidad({ ...tempIdentidad, estadoEmocionalIdeal: e.target.value })}
                  placeholder="Ej: Paz, Abundancia, Confianza..."
                  className="w-full px-4 py-3 text-xl border-2 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            )}
          </div>

          <div className="flex gap-4 mt-8">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="flex-1 py-3 border-2 rounded-lg font-semibold dark:border-gray-600 dark:text-white"
              >
                Atrás
              </button>
            )}
            <button
              onClick={saveAndContinue}
              className="flex-1 py-3 rounded-lg font-semibold text-white"
              style={{ backgroundColor: colors.blue }}
            >
              {step === 5 ? 'Continuar al Test' : 'Siguiente'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Dashboard Principal
  const DashboardView = () => {
    const gaps = Object.keys(prosperidad).map(pilar => ({
      pilar,
      gap: prosperidad[pilar].deseado - prosperidad[pilar].hoy
    }));
    const maxGap = Math.max(...gaps.map(g => g.gap));
    const areaCritica = gaps.find(g => g.gap === maxGap);

    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold dark:text-white">
            Hola, {user?.name} 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Tu palabra del año: <span className="font-bold" style={{ color: colors.gold }}>
              {identidad.palabraDelAño || 'Define tu palabra'}
            </span>
          </p>
        </div>

        {emergencyMode && (
          <div className="mb-6 p-6 bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-xl animate-pulse">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">
                  ⚠️ Modo Emergencia Activado
                </h3>
                <p className="text-red-700 dark:text-red-300">
                  Tu juego necesita recalibración urgente
                </p>
              </div>
              <button
                onClick={() => setCoachOpen(true)}
                className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700"
              >
                Hablar con Rodrigo
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold dark:text-white">Área Crítica</h3>
              <TrendingUp className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-2xl font-bold capitalize" style={{ color: colors.red }}>
              {areaCritica?.pilar || 'N/A'}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
              Gap de {maxGap} puntos
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold dark:text-white">Metas Activas</h3>
              <Target className="w-5 h-5" style={{ color: colors.gold }} />
            </div>
            <p className="text-2xl font-bold dark:text-white">{metas.length}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
              En progreso
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold dark:text-white">Racha de Hábitos</h3>
              <span className="text-2xl">🔥</span>
            </div>
            <p className="text-2xl font-bold" style={{ color: colors.gold }}>
              {habitos.length > 0 ? Math.max(...habitos.map(h => h.racha?.actual || 0)) : 0} días
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
              Récord personal
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold mb-4 dark:text-white">Prosperidad Integral</h3>
          <div className="space-y-4">
            {Object.keys(prosperidad).map(pilar => {
              const gap = prosperidad[pilar].deseado - prosperidad[pilar].hoy;
              const percentage = (prosperidad[pilar].hoy / prosperidad[pilar].deseado) * 100;
              return (
                <div key={pilar}>
                  <div className="flex justify-between mb-2">
                    <span className="capitalize font-semibold dark:text-white">
                      {pilar === 'fisica' ? 'Salud Física' : pilar === 'relacional' ? 'Relaciones' : pilar}
                    </span>
                    <span className="text-sm dark:text-gray-300">
                      {prosperidad[pilar].hoy}/{prosperidad[pilar].deseado}
                    </span>
                  </div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: gap > 5 ? colors.red : gap > 3 ? '#F59E0B' : colors.green
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Coach IA Modal
  const CoachModal = () => {
    const [messages, setMessages] = useState([
      {
        role: 'assistant',
        content: `Hola ${user?.name}, soy Rodrigo. Estoy aquí para ayudarte a jugar tu mejor juego. ¿En qué área de tu vida necesitas claridad hoy?`
      }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const sendMessage = async () => {
      if (!input.trim() || !openAIKey) return;

      const userMessage = { role: 'user', content: input };
      setMessages([...messages, userMessage]);
      setInput('');
      setLoading(true);

      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openAIKey}`
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: `Eres Rodrigo Zubiria, mentor de prosperidad integral y diseño de vida intencional.

PERSONALIDAD:
- Directo pero empático
- Usas preguntas poderosas más que dar órdenes
- Celebras los logros pequeños
- No juzgas, pero sí desafías con amor
- Hablas de "jugar tu propio juego" no "competir"

CONTEXTO DEL USUARIO:
Nombre: ${user?.name}
Palabra del año: ${identidad.palabraDelAño}
Estado emocional ideal: ${identidad.estadoEmocionalIdeal}
Área crítica: ${Object.keys(prosperidad).reduce((max, pilar) => {
  const gap = prosperidad[pilar].deseado - prosperidad[pilar].hoy;
  return gap > (prosperidad[max]?.deseado - prosperidad[max]?.hoy || 0) ? pilar : max;
}, 'economica')}

PRINCIPIOS QUE ENSEÑAS:
1. El estado emocional ideal viene ANTES que el dinero
2. No existe un juego universal; cada uno escribe su historia
3. Los 5 pilares de prosperidad deben estar balanceados
4. La riqueza sin paz interior es pobreza disfrazada
5. Las micro-acciones consistentes superan los grandes planes sin ejecución

TONO:
- Usa "tú" no "usted"
- Ocasionalmente usa metáforas de juegos/deportes
- Frases motivacionales cortas y memorables
- Preguntas que inviten a la reflexión profunda

Responde en español de forma concisa y práctica.`
              },
              ...messages,
              userMessage
            ],
            max_tokens: 1000
          })
        });

        const data = await response.json();
        const assistantMessage = {
          role: 'assistant',
          content: data.choices[0].message.content
        };
        setMessages([...messages, userMessage, assistantMessage]);
      } catch (error) {
        console.error('Error al comunicar con el Coach IA:', error);
        setMessages([...messages, userMessage, {
          role: 'assistant',
          content: 'Lo siento, hubo un error al conectar. Verifica tu API Key de OpenAI en Configuración.'
        }]);
      }
      setLoading(false);
    };

    if (!coachOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
          <div className="p-6 border-b dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: colors.gold }}>
                RZ
              </div>
              <div>
                <h3 className="font-bold text-lg dark:text-white">Rodrigo Zubiria</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Tu Coach de Prosperidad</p>
              </div>
            </div>
            <button onClick={() => setCoachOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <X className="w-6 h-6 dark:text-white" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-4 rounded-lg ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 dark:bg-gray-700 dark:text-white'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t dark:border-gray-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Escribe tu pregunta..."
                className="flex-1 px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                disabled={!openAIKey}
              />
              <button
                onClick={sendMessage}
                disabled={!openAIKey || loading}
                className="px-6 py-2 rounded-lg text-white font-semibold disabled:opacity-50"
                style={{ backgroundColor: colors.blue }}
              >
                Enviar
              </button>
            </div>
            {!openAIKey && (
              <p className="text-sm text-red-600 mt-2">
                Configura tu API Key de OpenAI en Configuración para usar el Coach IA
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Componente de Configuración
  const SettingsView = () => {
    const [localKey, setLocalKey] = useState(openAIKey);

    const saveSettings = () => {
      setOpenAIKey(localKey);
      localStorage.setItem('openai_key', localKey);
      alert('Configuración guardada correctamente');
    };

    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6 dark:text-white">Configuración</h2>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4 dark:text-white">API Key de OpenAI</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Necesitas una API Key de OpenAI para usar el Coach IA (Rodrigo). Esta key se guarda solo en tu navegador.
          </p>
          <input
            type="password"
            value={localKey}
            onChange={(e) => setLocalKey(e.target.value)}
            placeholder="sk-proj-..."
            className="w-full px-4 py-2 border rounded-lg mb-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <button
            onClick={saveSettings}
            className="px-6 py-2 rounded-lg text-white font-semibold"
            style={{ backgroundColor: colors.blue }}
          >
            Guardar Configuración
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4 dark:text-white">Exportar Datos</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Descarga una copia de todos tus datos en formato JSON
          </p>
          <button
            onClick={() => {
              const data = {
                identidad,
                prosperidad,
                metas,
                habitos,
                diario,
                finanzas
              };
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `juega-tu-juego-backup-${new Date().toISOString().split('T')[0]}.json`;
              a.click();
            }}
            className="flex items-center gap-2 px-6 py-2 border-2 rounded-lg font-semibold dark:border-gray-600 dark:text-white"
          >
            <Download className="w-5 h-5" />
            Exportar Datos
          </button>
        </div>
      </div>
    );
  };

  // Navegación y Layout Principal
  const MainLayout = () => {
    const menuItems = [
      { id: 'dashboard', icon: BarChart3, label: 'Dashboard' },
      { id: 'metas', icon: Target, label: 'Metas' },
      { id: 'rutina', icon: CheckSquare, label: 'Rutina Diaria' },
      { id: 'finanzas', icon: DollarSign, label: 'Finanzas' },
      { id: 'biblioteca', icon: BookOpen, label: 'Biblioteca' },
      { id: 'estadisticas', icon: TrendingUp, label: 'Estadísticas' },
      { id: 'settings', icon: Settings, label: 'Configuración' }
    ];

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700 sticky top-0 z-40">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden">
                <Menu className="w-6 h-6 dark:text-white" />
              </button>
              <h1 className="text-xl font-bold" style={{ color: colors.gold }}>
                Juega Tu Propio Juego
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setCoachOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-semibold hover:opacity-90"
                style={{ backgroundColor: colors.gold }}
              >
                <MessageCircle className="w-5 h-5" />
                Rodrigo IA
              </button>
              
              <button onClick={() => setDarkMode(!darkMode)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                {darkMode ? <Sun className="w-5 h-5 dark:text-white" /> : <Moon className="w-5 h-5" />}
              </button>

              <button
                onClick={() => {
                  localStorage.removeItem('user');
                  setUser(null);
                  setCurrentView('login');
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                title="Cerrar Sesión"
              >
                <LogOut className="w-5 h-5 dark:text-white" />
              </button>
            </div>
          </div>
        </header>

        <div className="flex">
          {/* Sidebar */}
          <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:sticky top-[73px] h-[calc(100vh-73px)] w-64 bg-white dark:bg-gray-800 border-r dark:border-gray-700 transition-transform z-30`}>
            <nav className="p-4 space-y-2">
              {menuItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentView(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    currentView === item.id
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {currentView === 'dashboard' && <DashboardView />}
            {currentView === 'settings' && <SettingsView />}
            {currentView === 'metas' && (
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-6 dark:text-white">Mis Metas</h2>
                <p className="text-gray-600 dark:text-gray-300">Módulo en construcción...</p>
              </div>
            )}
            {currentView === 'rutina' && (
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-6 dark:text-white">Rutina Diaria</h2>
                <p className="text-gray-600 dark:text-gray-300">Módulo en construcción...</p>
              </div>
            )}
            {currentView === 'finanzas' && (
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-6 dark:text-white">Control Financiero</h2>
                <p className="text-gray-600 dark:text-gray-300">Módulo en construcción...</p>
              </div>
            )}
            {currentView === 'biblioteca' && (
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-6 dark:text-white">Biblioteca de Sabiduría</h2>
                <p className="text-gray-600 dark:text-gray-300">Módulo en construcción...</p>
              </div>
            )}
            {currentView === 'estadisticas' && (
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-6 dark:text-white">Estadísticas y Análisis</h2>
                <p className="text-gray-600 dark:text-gray-300">Módulo en construcción...</p>
              </div>
            )}
          </main>
        </div>

        <CoachModal />
      </div>
    );
  };

  // Cargar datos al iniciar
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedKey = localStorage.getItem('openai_key');
    
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setCurrentView('dashboard');
    }
    
    if (savedKey) {
      setOpenAIKey(savedKey);
    }
  }, []);

  // Render principal
  if (!user) {
    return <LoginView />;
  }

  if (currentView === 'onboarding' || currentView === 'prosperidad-test') {
    return <OnboardingView />;
  }

  return <MainLayout />;
};

export default App;