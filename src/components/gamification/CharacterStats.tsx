import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts'
import { useAuth } from '../../contexts/AuthContext'

export function CharacterStats() {
    const { profile } = useAuth()

    const stats = profile?.stats as Record<string, number> || {
        fuerza: 0,
        sabiduria: 0,
        carisma: 0,
        disciplina: 0,
        salud: 0
    }

    const data = [
        { subject: 'Fuerza', A: stats.fuerza || 0, fullMark: 100 },
        { subject: 'Sabiduría', A: stats.sabiduria || 0, fullMark: 100 },
        { subject: 'Carisma', A: stats.carisma || 0, fullMark: 100 },
        { subject: 'Disciplina', A: stats.disciplina || 0, fullMark: 100 },
        { subject: 'Salud', A: stats.salud || 0, fullMark: 100 },
    ]

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
            <h3 className="text-xl font-bold mb-4 dark:text-white text-center">Atributos</h3>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar
                            name="Atributos"
                            dataKey="A"
                            stroke="#10B981"
                            strokeWidth={3}
                            fill="#10B981"
                            fillOpacity={0.5}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4 text-sm text-gray-500 dark:text-gray-400">
                {data.map(d => (
                    <div key={d.subject} className="flex justify-between">
                        <span>{d.subject}</span>
                        <span className="font-bold text-gray-800 dark:text-white">{d.A}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
