import React, { useState } from 'react';
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    parseISO
} from 'date-fns';
import { ja } from 'date-fns/locale';
import { useStorage } from '../contexts/StorageContext';

export default function Calendar() {
    const { studyRecords, journals } = useStorage();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate,
    });

    const weekDays = ['日', '月', '火', '水', '木', '金', '土'];

    // Helper for formatting duration
    const formatDuration = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return `${h}時間${m}分`;
    };

    const getDayData = (date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        return {
            record: studyRecords[dateStr],
            journal: journals[dateStr]
        };
    };

    const renderDetails = () => {
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        const { record, journal } = getDayData(selectedDate);

        // Mood Emojis
        const moodEmojis = { great: '😄', good: '🙂', neutral: '😐', bad: '😔', terrible: '😢' };

        if ((!record || (record.studyTime === 0 && record.pomodoros === 0)) && (!journal || !journal.mood)) {
            return (
                <div className="day-details">
                    <h4>{format(selectedDate, 'yyyy年M月d日')}</h4>
                    <p className="empty-message">この日の記録はありません</p>
                </div>
            );
        }

        return (
            <div className="day-details">
                <h4>{format(selectedDate, 'yyyy年M月d日')}</h4>

                {record && (record.studyTime > 0 || record.pomodoros > 0) && (
                    <>
                        <div className="day-stat">
                            <span>勉強時間:</span>
                            <span>{formatDuration(record.studyTime || 0)}</span>
                        </div>
                        <div className="day-stat">
                            <span>休憩時間:</span>
                            <span>{formatDuration(record.breakTime || 0)}</span>
                        </div>
                        <div className="day-stat">
                            <span>ポモドーロ:</span>
                            <span>{record.pomodoros || 0}回</span>
                        </div>
                    </>
                )}

                {journal && journal.mood && (
                    <div className="day-stat">
                        <span>気分:</span>
                        <span>{moodEmojis[journal.mood]}</span>
                    </div>
                )}
            </div>
        );
    };

    return (
        <section className="page active" id="page-calendar">


            <div className="calendar-container">
                <div className="calendar-grid">
                    <div className="calendar-header">
                        {weekDays.map(day => <span key={day}>{day}</span>)}
                    </div>
                    <div className="calendar-days">
                        {calendarDays.map((day, idx) => {
                            const dateStr = format(day, 'yyyy-MM-dd');
                            const data = getDayData(day);
                            // Check if has meaningful data to highlight
                            const hasRecord = (data.record && data.record.studyTime > 0);
                            const isCurrentMonth = isSameMonth(day, monthStart);
                            const isToday = isSameDay(day, new Date());
                            const isSelected = isSameDay(day, selectedDate);

                            return (
                                <div
                                    key={dateStr}
                                    className={`calendar-day 
                                        ${!isCurrentMonth ? 'empty' : ''} 
                                        ${isToday ? 'today' : ''} 
                                        ${isSelected ? 'selected' : ''}
                                        ${isCurrentMonth && hasRecord ? 'has-record' : ''}
                                    `}
                                    onClick={() => setCurrentMonth(day) || setSelectedDate(day)}
                                >
                                    {format(day, 'd')}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="calendar-details">
                    <h3>選択した日の記録</h3>
                    {renderDetails()}
                </div>
            </div>
        </section>
    );
}
