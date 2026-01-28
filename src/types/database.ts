export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    nombre: string | null
                    palabra_del_año: string | null
                    frase_del_año: string | null
                    por_que: string | null
                    alter_ego: string | null
                    estado_emocional_ideal: string | null
                    onboarding_completed: boolean
                    ecualizador_estados: Record<string, number>
                    rutina_millonaria: Record<string, boolean>
                    pilares_prosperidad: Record<string, number> | null
                    xp: number
                    level: number
                    coins: number
                    stats: Record<string, number>
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    nombre?: string | null
                    palabra_del_año?: string | null
                    frase_del_año?: string | null
                    por_que?: string | null
                    alter_ego?: string | null
                    estado_emocional_ideal?: string | null
                    onboarding_completed?: boolean
                    ecualizador_estados?: Record<string, number>
                    rutina_millonaria?: Record<string, boolean>
                    pilares_prosperidad?: Record<string, number> | null
                    xp?: number
                    level?: number
                    coins?: number
                    stats?: Record<string, number>
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    nombre?: string | null
                    palabra_del_año?: string | null
                    frase_del_año?: string | null
                    por_que?: string | null
                    alter_ego?: string | null
                    estado_emocional_ideal?: string | null
                    onboarding_completed?: boolean
                    ecualizador_estados?: Record<string, number>
                    rutina_millonaria?: Record<string, boolean>
                    pilares_prosperidad?: Record<string, number> | null
                    xp?: number
                    level?: number
                    coins?: number
                    stats?: Record<string, number>
                    created_at?: string
                    updated_at?: string
                }
            }
            non_negotiables: {
                Row: {
                    id: string
                    user_id: string
                    descripcion: string
                    orden: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    descripcion: string
                    orden?: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    descripcion?: string
                    orden?: number
                    created_at?: string
                }
            }
            prosperity_pillars: {
                Row: {
                    id: string
                    user_id: string
                    pilar: 'economica' | 'emocional' | 'fisica' | 'relacional' | 'entorno' | 'salud' | 'desarrollo_personal'
                    valor_actual: number
                    valor_deseado: number
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    pilar: 'economica' | 'emocional' | 'fisica' | 'relacional' | 'entorno' | 'salud' | 'desarrollo_personal'
                    valor_actual?: number
                    valor_deseado?: number
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    pilar?: 'economica' | 'emocional' | 'fisica' | 'relacional' | 'entorno' | 'salud' | 'desarrollo_personal'
                    valor_actual?: number
                    valor_deseado?: number
                    updated_at?: string
                }
            }
            goals: {
                Row: {
                    id: string
                    user_id: string
                    titulo: string
                    descripcion: string | null
                    pilar: 'economica' | 'emocional' | 'fisica' | 'relacional' | 'entorno' | 'salud' | 'desarrollo_personal' | null
                    fecha_limite: string | null
                    progreso: number
                    completada: boolean
                    archivada: boolean
                    indicador_exito: string | null
                    valor_objetivo: number
                    valor_actual: number
                    estado: 'no_iniciada' | 'en_progreso' | 'completada' | 'en_pausa'
                    orden: number
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    titulo: string
                    descripcion?: string | null
                    pilar?: 'economica' | 'emocional' | 'fisica' | 'relacional' | 'entorno' | 'salud' | 'desarrollo_personal' | null
                    fecha_limite?: string | null
                    progreso?: number
                    completada?: boolean
                    archivada?: boolean
                    indicador_exito?: string | null
                    valor_objetivo?: number
                    valor_actual?: number
                    estado?: 'no_iniciada' | 'en_progreso' | 'completada' | 'en_pausa'
                    orden?: number
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    titulo?: string
                    descripcion?: string | null
                    pilar?: 'economica' | 'emocional' | 'fisica' | 'relacional' | 'entorno' | 'salud' | 'desarrollo_personal' | null
                    fecha_limite?: string | null
                    progreso?: number
                    completada?: boolean
                    archivada?: boolean
                    indicador_exito?: string | null
                    valor_objetivo?: number
                    valor_actual?: number
                    estado?: 'no_iniciada' | 'en_progreso' | 'completada' | 'en_pausa'
                    orden?: number
                    created_at?: string
                    updated_at?: string
                }
            }
            habits: {
                Row: {
                    id: string
                    user_id: string
                    nombre: string
                    descripcion: string | null
                    icono: string
                    color: string
                    objetivo_frecuencia: 'diario' | 'semanal' | 'personalizado'
                    dias_semana: number[]
                    racha_actual: number
                    racha_record: number
                    activo: boolean
                    estado_animo_favorece: string | null
                    beneficio_salud: string | null
                    beneficio_productividad: string | null
                    veces_por_semana: number
                    hora_preferida: 'mañana' | 'tarde' | 'noche' | 'cualquiera'
                    veces_por_dia: number
                    type: 'good' | 'bad'
                    attribute: 'fuerza' | 'sabiduria' | 'carisma' | 'disciplina' | 'salud' | null
                    micro_step: string | null
                    anchor: string | null
                    identity_affirmation: string | null
                    orden: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    nombre: string
                    descripcion?: string | null
                    icono?: string
                    color?: string
                    objetivo_frecuencia?: 'diario' | 'semanal' | 'personalizado'
                    dias_semana?: number[]
                    racha_actual?: number
                    racha_record?: number
                    activo?: boolean
                    estado_animo_favorece?: string | null
                    beneficio_salud?: string | null
                    beneficio_productividad?: string | null
                    veces_por_semana?: number
                    hora_preferida?: 'mañana' | 'tarde' | 'noche' | 'cualquiera'
                    veces_por_dia?: number
                    type?: 'good' | 'bad'
                    attribute?: 'fuerza' | 'sabiduria' | 'carisma' | 'disciplina' | 'salud' | null
                    micro_step?: string | null
                    anchor?: string | null
                    identity_affirmation?: string | null
                    orden?: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    nombre?: string
                    descripcion?: string | null
                    icono?: string
                    color?: string
                    objetivo_frecuencia?: 'diario' | 'semanal' | 'personalizado'
                    dias_semana?: number[]
                    racha_actual?: number
                    racha_record?: number
                    activo?: boolean
                    estado_animo_favorece?: string | null
                    beneficio_salud?: string | null
                    beneficio_productividad?: string | null
                    veces_por_semana?: number
                    hora_preferida?: 'mañana' | 'tarde' | 'noche' | 'cualquiera'
                    veces_por_dia?: number
                    type?: 'good' | 'bad'
                    attribute?: 'fuerza' | 'sabiduria' | 'carisma' | 'disciplina' | 'salud' | null
                    micro_step?: string | null
                    anchor?: string | null
                    identity_affirmation?: string | null
                    orden?: number
                    created_at?: string
                }
            }
            rewards: {
                Row: {
                    id: string
                    user_id: string
                    title: string
                    cost: number
                    icon: string
                    description: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    title: string
                    cost?: number
                    icon?: string
                    description?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    title?: string
                    cost?: number
                    icon?: string
                    description?: string | null
                    created_at?: string
                }
            }
            habit_completions: {
                Row: {
                    id: string
                    habit_id: string
                    user_id: string
                    fecha: string
                    completado: boolean
                    notas: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    habit_id: string
                    user_id: string
                    fecha: string
                    completado?: boolean
                    notas?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    habit_id?: string
                    user_id?: string
                    fecha?: string
                    completado?: boolean
                    notas?: string | null
                    created_at?: string
                }
            }
            daily_diary: {
                Row: {
                    id: string
                    user_id: string
                    fecha: string
                    estado_emocional: number | null
                    energia: number | null
                    gratitudes: string[]
                    reflexion: string | null
                    wins: string[]
                    tmi: string | null
                    afirmaciones: string[]
                    retos: string[]
                    notas_adicionales: string | null
                    checklist_conciencia: Record<string, boolean>
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    fecha: string
                    estado_emocional?: number | null
                    energia?: number | null
                    gratitudes?: string[]
                    reflexion?: string | null
                    wins?: string[]
                    tmi?: string | null
                    afirmaciones?: string[]
                    retos?: string[]
                    notas_adicionales?: string | null
                    checklist_conciencia?: Record<string, boolean>
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    fecha?: string
                    estado_emocional?: number | null
                    energia?: number | null
                    gratitudes?: string[]
                    reflexion?: string | null
                    wins?: string[]
                    tmi?: string | null
                    afirmaciones?: string[]
                    retos?: string[]
                    notas_adicionales?: string | null
                    checklist_conciencia?: Record<string, boolean>
                    created_at?: string
                }
            }
            transactions: {
                Row: {
                    id: string
                    user_id: string
                    tipo: 'ingreso' | 'gasto'
                    categoria: string
                    monto: number
                    descripcion: string | null
                    fecha: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    tipo: 'ingreso' | 'gasto'
                    categoria: string
                    monto: number
                    descripcion?: string | null
                    fecha?: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    tipo?: 'ingreso' | 'gasto'
                    categoria?: string
                    monto?: number
                    descripcion?: string | null
                    fecha?: string
                    created_at?: string
                }
            }
            wisdom_entries: {
                Row: {
                    id: string
                    user_id: string
                    tipo: 'frase' | 'aprendizaje' | 'recurso' | 'libro'
                    contenido: string
                    fuente: string | null
                    favorito: boolean
                    fecha: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    tipo: 'frase' | 'aprendizaje' | 'recurso' | 'libro'
                    contenido: string
                    fuente?: string | null
                    favorito?: boolean
                    fecha?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    tipo?: 'frase' | 'aprendizaje' | 'recurso' | 'libro'
                    contenido?: string
                    fuente?: string | null
                    favorito?: boolean
                    fecha?: string | null
                    created_at?: string
                }
            }
            coach_conversations: {
                Row: {
                    id: string
                    user_id: string
                    messages: Json
                    contexto: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    messages?: Json
                    contexto?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    messages?: Json
                    contexto?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            tasks: {
                Row: {
                    id: string
                    user_id: string
                    goal_id: string | null
                    nombre: string
                    descripcion: string | null
                    hora_preferida: 'mañana' | 'tarde' | 'noche' | 'cualquiera'
                    fecha_limite: string | null
                    plazo_tiempo: number | null
                    recordatorio: boolean
                    recordatorio_minutos: number
                    estado: 'pendiente' | 'en_progreso' | 'completada' | 'cancelada'
                    tiempo_dedicado: number
                    orden: number
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    goal_id?: string | null
                    nombre: string
                    descripcion?: string | null
                    hora_preferida?: 'mañana' | 'tarde' | 'noche' | 'cualquiera'
                    fecha_limite?: string | null
                    plazo_tiempo?: number | null
                    recordatorio?: boolean
                    recordatorio_minutos?: number
                    estado?: 'pendiente' | 'en_progreso' | 'completada' | 'cancelada'
                    tiempo_dedicado?: number
                    orden?: number
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    goal_id?: string | null
                    nombre?: string
                    descripcion?: string | null
                    hora_preferida?: 'mañana' | 'tarde' | 'noche' | 'cualquiera'
                    fecha_limite?: string | null
                    plazo_tiempo?: number | null
                    recordatorio?: boolean
                    recordatorio_minutos?: number
                    estado?: 'pendiente' | 'en_progreso' | 'completada' | 'cancelada'
                    tiempo_dedicado?: number
                    orden?: number
                    created_at?: string
                    updated_at?: string
                }
            }
            pomodoro_sessions: {
                Row: {
                    id: string
                    user_id: string
                    task_id: string | null
                    duracion: number
                    tipo: 'focus' | 'short_break' | 'long_break'
                    completada: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    task_id?: string | null
                    duracion: number
                    tipo?: 'focus' | 'short_break' | 'long_break'
                    completada?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    task_id?: string | null
                    duracion?: number
                    tipo?: 'focus' | 'short_break' | 'long_break'
                    completada?: boolean
                    created_at?: string
                }
            }
            breathing_sessions: {
                Row: {
                    id: string
                    user_id: string
                    tipo: string
                    rondas: number
                    tiempo_total: number
                    retencion_maxima: number | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    tipo?: string
                    rondas: number
                    tiempo_total: number
                    retencion_maxima?: number | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    tipo?: string
                    rondas?: number
                    tiempo_total?: number
                    retencion_maxima?: number | null
                    created_at?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
    }
}
