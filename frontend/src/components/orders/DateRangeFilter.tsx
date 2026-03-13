import React from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from 'lucide-react';

export const DateRangeFilter = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const dateFilter = searchParams.get('dateRange') || 'ALL';

  const handleDateFilterChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value && value !== 'ALL') {
      newParams.set('dateRange', value);
      
      // Calculate start and end dates
      const now = new Date();
      let startDateStr = '';
      let endDateStr = now.toISOString();

      if (value === 'TODAY') {
        now.setHours(0, 0, 0, 0);
        startDateStr = now.toISOString();
      } else if (value === 'LAST_7_DAYS') {
        const last7 = new Date(now);
        last7.setDate(now.getDate() - 7);
        startDateStr = last7.toISOString();
      } else if (value === 'THIS_MONTH') {
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        startDateStr = thisMonth.toISOString();
      }

      newParams.set('startDate', startDateStr);
      newParams.set('endDate', endDateStr);
    } else {
      newParams.delete('dateRange');
      newParams.delete('startDate');
      newParams.delete('endDate');
    }
    setSearchParams(newParams);
  };

  return (
    <div className="w-full sm:w-[200px]">
      <Select value={dateFilter} onValueChange={handleDateFilterChange}>
        <SelectTrigger>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <SelectValue placeholder="Filter by Date" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Time</SelectItem>
          <SelectItem value="TODAY">Today</SelectItem>
          <SelectItem value="LAST_7_DAYS">Last 7 Days</SelectItem>
          <SelectItem value="THIS_MONTH">This Month</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
