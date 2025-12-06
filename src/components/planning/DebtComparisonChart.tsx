"use client"

import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExtraPaymentSimulation } from '@/lib/planning/debt-simulator';
import { format } from 'date-fns';

interface DebtComparisonChartProps {
  simulation: ExtraPaymentSimulation;
}

export function DebtComparisonChart({ simulation }: DebtComparisonChartProps) {
  const maxMonths = Math.max(simulation.monthlyProjection.length, simulation.baseline.monthlyProjection.length);
  const chartData = [];
  
  for (let i = 0; i < maxMonths; i++) {
    const simPoint = simulation.monthlyProjection[i];
    const basePoint = simulation.baseline.monthlyProjection[i];
    
    if (simPoint || basePoint) {
      chartData.push({
        month: i,
        date: simPoint?.date || basePoint?.date,
        CurrentBalance: basePoint ? basePoint.totalBalance : 0,
        OptimizedBalance: simPoint ? simPoint.totalBalance : 0,
      });
    }
  }

  const interestData = [
    { name: 'Current Path', amount: simulation.baseline.totalInterestPaid },
    { name: 'With Extra', amount: simulation.totalInterestPaid },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Balance Over Time</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(str) => str ? format(new Date(str), 'MMM yy') : ''} 
                minTickGap={30}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(str) => str ? format(new Date(str), 'MMM yyyy') : ''}
                formatter={(value: number) => [`€${value.toLocaleString()}`, '']}
              />
              <Legend />
              <Line type="monotone" dataKey="CurrentBalance" stroke="#64748B" strokeWidth={2} dot={false} name="Current Path" />
              <Line type="monotone" dataKey="OptimizedBalance" stroke="#0D9488" strokeWidth={2} dot={false} name="With Extra" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Total Interest Paid</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={interestData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value: number) => [`€${value.toLocaleString()}`, 'Interest']} />
              <Bar dataKey="amount" fill="#0D9488" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
