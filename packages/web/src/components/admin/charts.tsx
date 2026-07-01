'use client';

import {
  BarChart as RechartsBarChart,
  Bar,
  LineChart as RechartsLineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const THEME_COLORS = {
  primary: '#16a34a',
  primaryLight: '#22c55e',
  secondary: '#f97316',
  secondaryLight: '#fb923c',
  accent: '#3b82f6',
  muted: '#94a3b8',
};

const PIE_COLORS = ['#16a34a', '#f97316', '#3b82f6', '#a855f7', '#ec4899', '#14b8a6', '#eab308', '#ef4444'];

interface ChartDataPoint {
  [key: string]: any;
}

interface BaseChartProps {
  title?: string;
  data: ChartDataPoint[];
  height?: number;
  className?: string;
}

// Bar Chart
interface AdminBarChartProps extends BaseChartProps {
  xKey: string;
  yKey: string;
  color?: string;
}

export function AdminBarChart({
  title,
  data,
  xKey,
  yKey,
  color = THEME_COLORS.primary,
  height = 300,
  className,
}: AdminBarChartProps) {
  const chart = (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey={xKey} tick={{ fontSize: 12 }} stroke="#9ca3af" />
        <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
          }}
        />
        <Bar dataKey={yKey} fill={color} radius={[4, 4, 0, 0]} />
      </RechartsBarChart>
    </ResponsiveContainer>
  );

  if (title) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
        <CardContent>{chart}</CardContent>
      </Card>
    );
  }
  return <div className={className}>{chart}</div>;
}

// Line Chart
interface AdminLineChartProps extends BaseChartProps {
  xKey: string;
  lines: { key: string; color?: string; label?: string }[];
}

export function AdminLineChart({
  title,
  data,
  xKey,
  lines,
  height = 300,
  className,
}: AdminLineChartProps) {
  const chart = (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey={xKey} tick={{ fontSize: 12 }} stroke="#9ca3af" />
        <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
          }}
        />
        <Legend />
        {lines.map((line, i) => (
          <Line
            key={line.key}
            type="monotone"
            dataKey={line.key}
            stroke={line.color || [THEME_COLORS.primary, THEME_COLORS.secondary, THEME_COLORS.accent][i % 3]}
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
            name={line.label || line.key}
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  );

  if (title) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
        <CardContent>{chart}</CardContent>
      </Card>
    );
  }
  return <div className={className}>{chart}</div>;
}

// Pie Chart
interface AdminPieChartProps extends BaseChartProps {
  nameKey: string;
  valueKey: string;
  colors?: string[];
}

export function AdminPieChart({
  title,
  data,
  nameKey,
  valueKey,
  colors = PIE_COLORS,
  height = 300,
  className,
}: AdminPieChartProps) {
  const chart = (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsPieChart>
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
          }}
        />
        <Legend />
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey={valueKey}
          nameKey={nameKey}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
      </RechartsPieChart>
    </ResponsiveContainer>
  );

  if (title) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
        <CardContent>{chart}</CardContent>
      </Card>
    );
  }
  return <div className={className}>{chart}</div>;
}

// Area Chart
interface AdminAreaChartProps extends BaseChartProps {
  xKey: string;
  areas: { key: string; color?: string; label?: string }[];
}

export function AdminAreaChart({
  title,
  data,
  xKey,
  areas,
  height = 300,
  className,
}: AdminAreaChartProps) {
  const chart = (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsAreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey={xKey} tick={{ fontSize: 12 }} stroke="#9ca3af" />
        <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
          }}
        />
        <Legend />
        {areas.map((area, i) => (
          <Area
            key={area.key}
            type="monotone"
            dataKey={area.key}
            stroke={area.color || [THEME_COLORS.primary, THEME_COLORS.secondary][i % 2]}
            fill={area.color || [THEME_COLORS.primary, THEME_COLORS.secondary][i % 2]}
            fillOpacity={0.1}
            strokeWidth={2}
            name={area.label || area.key}
          />
        ))}
      </RechartsAreaChart>
    </ResponsiveContainer>
  );

  if (title) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
        <CardContent>{chart}</CardContent>
      </Card>
    );
  }
  return <div className={className}>{chart}</div>;
}