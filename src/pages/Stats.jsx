import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';
import { subDays, format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useStorage } from '../contexts/StorageContext';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#8b5cf6', '#14b8a6', '#6b7280'];

export default function Stats() {
    const { user, studyRecords, tasks, categories } = useStorage();

    // Calculate Totals
    const totalStudyTime = Object.values(studyRecords).reduce((acc, curr) => acc + (curr.studyTime || 0), 0);
    const completedTasks = tasks.filter(t => t.completed);
    const completedTasksCount = completedTasks.length;

    // Prepare Category Data for Pie Chart
    const categoryCounts = {};
    completedTasks.forEach(task => {
        const cats = task.categories && task.categories.length > 0 ? task.categories : (task.category ? [task.category] : ['other']);
        cats.forEach(catId => {
            categoryCounts[catId] = (categoryCounts[catId] || 0) + 1;
        });
    });

    const pieData = Object.keys(categoryCounts).map(catId => {
        const catDef = categories.find(c => c.id === catId);
        return {
            name: catDef ? catDef.name : catId,
            value: categoryCounts[catId],
            color: catDef ? catDef.color : '#999'
        };
    }).sort((a, b) => b.value - a.value);

    // Filter out zero values and take top 8 for Pie Chart
    const activePieData = pieData.filter(d => d.value > 0);

    const formatDuration = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return `${h}時間${m}分`;
    };

    // Prepare Chart Data (Last 7 Days)
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
        const date = subDays(new Date(), i);
        const dateStr = format(date, 'yyyy-MM-dd');
        const record = studyRecords[dateStr];

        chartData.push({
            name: format(date, 'M/d', { locale: ja }),
            time: record ? (record.studyTime || 0) / 60 : 0, // Convert to minutes for chart
        });
    }

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-tooltip">
                    <p className="label">{`${label}`}</p>
                    <p className="intro">{`勉強時間: ${Math.round(payload[0].value)}分`}</p>
                </div>
            );
        }
        return null;
    };

    const shareProgress = async () => {
        const text = `🎮 HabitQuest プログレス報告！\n🔥 レベル: ${user.level}\n🌟 総XP: ${user.totalXP}\n✅ 完了タスク: ${completedTasksCount}\n⏱️ 総勉強時間: ${formatDuration(totalStudyTime)}\n\n一緒に習慣化を目指そう！ #HabitQuest`;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'HabitQuest Progress',
                    text: text,
                    url: window.location.href
                });
            } catch (err) {
                console.error('Sharing failed', err);
            }
        } else {
            try {
                await navigator.clipboard.writeText(text);
                alert('プログレス情報をクリップボードにコピーしました！');
            } catch (err) {
                console.error('Copy failed', err);
            }
        }
    };

    return (
        <section className="page active" id="page-stats">


            <div className="stats-container">
                <div className="stats-card">
                    <h3>📈 総合統計</h3>
                    <div className="overview-stats">
                        <div className="overview-stat">
                            <span className="stat-value">{user.level}</span>
                            <span className="stat-label">レベル</span>
                        </div>
                        <div className="overview-stat">
                            <span className="stat-value">{user.totalXP}</span>
                            <span className="stat-label">総獲得XP</span>
                        </div>
                        <div className="overview-stat">
                            <span className="stat-value">{completedTasksCount}</span>
                            <span className="stat-label">完了タスク</span>
                        </div>
                        <div className="overview-stat">
                            <span className="stat-value">{formatDuration(totalStudyTime)}</span>
                            <span className="stat-label">総勉強時間</span>
                        </div>
                    </div>
                </div>

                <div className="stats-grid">
                    <div className="stats-card">
                        <h3>⏱️ 勉強時間（直近7日）</h3>
                        <div className="stats-chart">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        stroke="var(--text-secondary)"
                                        tick={{ fill: 'var(--text-secondary)' }}
                                    />
                                    <YAxis
                                        stroke="var(--text-secondary)"
                                        tick={{ fill: 'var(--text-secondary)' }}
                                        label={{ value: '分', angle: -90, position: 'insideLeft', fill: 'var(--text-secondary)' }}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="time" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="stats-card">
                        <h3>📊 タスク内訳（完了）</h3>
                        <div className="stats-chart">
                            {activePieData.length === 0 ? (
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-muted)' }}>
                                    データがありません
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={activePieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {activePieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '8px' }}
                                            itemStyle={{ color: 'var(--text-primary)' }}
                                        />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
