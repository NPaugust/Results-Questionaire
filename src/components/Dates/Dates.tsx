import React, { useState, useEffect, useRef } from 'react';
import Calendar from './parts/Calendar';
import YearSelector from './parts/YearSelector';
import PeriodSelector from './parts/PeriodSelector';
import MonthSelector from './parts/MonthSelector';
import ResetButton from './parts/ResetButton';
import { formatDisplayDate, getQuarterDates, getMonthDates } from '@/lib/utils/dateUtils';
import { useDateParams } from '@/context/DateParamsContext';
import { useLanguage } from '@/context/LanguageContext';
import { CalendarDays } from 'lucide-react';

const DateRangePicker: React.FC = () => {
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '', year: '2025' });
  const [calMonth, setCalMonth] = useState(0);
  const [calYear, setCalYear] = useState('2025');
  const [activePeriod, setActivePeriod] = useState<number | null>(null);
  const [selMonth, setSelMonth] = useState<string | null>(null);
  const [showCal, setShowCal] = useState(false);
  const [selStart, setSelStart] = useState(true);
  const [selRangeDone, setSelRangeDone] = useState(false);
  const [showYear, setShowYear] = useState(false);
  const [showMonth, setShowMonth] = useState(false);
  const { setDateParams } = useDateParams();
  const { language, getTranslation } = useLanguage();
  const calendarRef = useRef<HTMLDivElement>(null);

  const years = Array.from({ length: 11 }, (_, i) => (2025 + i).toString());

  const periods = [
    { id: 0, type: 'quarter', label: 'I' },
    { id: 1, type: 'quarter', label: 'II' },
    { id: 2, type: 'quarter', label: 'III' },
    { id: 3, type: 'quarter', label: 'IV' },
  ];

  const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];

  useEffect(() => {
    if (selRangeDone) setDateParams({ startDate: dateRange.startDate, endDate: dateRange.endDate });
    else setDateParams({ startDate: `${dateRange.year}-01-01`, endDate: `${dateRange.year}-12-31` });
  }, [dateRange, selRangeDone, setDateParams]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCal(false);
      }
    };

    if (showCal) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCal]);

  const handleYear = (y: string) => {
    setDateRange({ startDate: '', endDate: '', year: y });
    setCalYear(y);
    setCalMonth(0);
    setActivePeriod(null);
    setSelMonth(null);
    setSelStart(true);
    setSelRangeDone(false);
    setShowYear(false);
  };

  const handlePeriod = (p: any) => {
    const [s, e] = getQuarterDates(dateRange.year, p.id);
    setDateRange({ startDate: s, endDate: e, year: dateRange.year });
    setActivePeriod(p.id);
    setSelMonth(null);
    setSelStart(true);
    setSelRangeDone(true);
    setShowCal(false);
  };

  const handleMonth = (idx: number) => {
    const [s, e] = getMonthDates(dateRange.year, idx);
    setDateRange({ startDate: s, endDate: e, year: dateRange.year });
    setActivePeriod(null);
    setSelMonth(months[idx]);
    setSelStart(true);
    setSelRangeDone(true);
    setShowMonth(false);
  };

  const handleDateSelect = (iso: string) => {
    if (selStart) {
      setDateRange(r => ({ ...r, startDate: iso, endDate: '' }));
      setSelStart(false);
    } else {
      setDateRange(r => ({ ...r, endDate: iso }));
      setSelStart(true);
      setSelRangeDone(true);
      setShowCal(false);
    }
  };

  const changeMonth = (delta: number) => {
    let m = calMonth + delta,
      y = Number(calYear);
    if (m < 0) {
      m = 11;
      y--;
    }
    if (m > 11) {
      m = 0;
      y++;
    }
    setCalMonth(m);
    setCalYear(y.toString());
  };

  const reset = () => {
    const cy = new Date().getFullYear().toString();
    setDateRange({ startDate: '', endDate: '', year: cy });
    setCalYear(cy);
    setCalMonth(0);
    setActivePeriod(null);
    setSelMonth(null);
    setSelStart(true);
    setSelRangeDone(false);
  };

  return (
    <div className="w-full bg-gradient-to-r from-blue-700 to-indigo-400 p-4 rounded-2xl mb-4 shadow-lg">
      <div className="flex flex-wrap items-center gap-3">
        {/* Date input */}
        <div className="relative">
          <div
            onClick={() => {
              setShowCal(true);
              setSelStart(true);
            }}
            className="w-[210px] bg-white rounded-xl shadow-sm border-b-2 border-indigo-100 flex items-center gap-2 p-2 cursor-pointer justify-center"
          >
            <CalendarDays />
            <p>
              {selRangeDone
                ? `${formatDisplayDate(dateRange.startDate)} - ${formatDisplayDate(dateRange.endDate)}`
                : getTranslation('ChooseDate', language)}
            </p>
          </div>
          {showCal && (
            <div ref={calendarRef} className="absolute top-full left-0 mt-2 z-40">
              <Calendar
                year={Number(calYear)}
                month={calMonth}
                dateRange={dateRange}
                onDateSelect={handleDateSelect}
                onMonthChange={changeMonth}
              />
            </div>
          )}
        </div>
        {/* Year selector */}
        <YearSelector
          years={years}
          selected={dateRange.year}
          show={showYear}
          toggle={() => setShowYear(v => !v)}
          onSelect={handleYear}
        />
        {/* Quarters */}
        <PeriodSelector periods={periods} active={activePeriod} onClick={handlePeriod} />
        {/* Month selector */}
        <MonthSelector
          months={months}
          selected={selMonth}
          show={showMonth}
          onToggle={() => setShowMonth(v => !v)}
          onSelect={handleMonth}
        />
        {/* Reset */}
        <ResetButton onReset={reset} label={getTranslation('Reset_Button', language)} />
      </div>
    </div>
  );
};

export default DateRangePicker;