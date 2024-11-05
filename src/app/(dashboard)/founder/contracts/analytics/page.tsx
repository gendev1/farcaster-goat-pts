'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartData } from '@/services/subservice';
import RealTimeChart from '@/components/founder/analytics/charts/RealTimeChart';
import { pubSubService } from '@/services/pubsub.service';

const AnalyticsPage = () => {
    const [chartData, setChartData] = useState<ChartData[]>([]);
    const [dateRange, setDateRange] = useState<{ from: Date; to?: Date }>({
        from: new Date(new Date().setDate(new Date().getDate() - 30)),
        to: new Date(),
    });
    const [activeTab, setActiveTab] = useState('tvl');

    useEffect(() => {
        const subscription = pubSubService.subscribeToChartData((data) => {
            setChartData(prevData => {
                const newData = [...prevData, data].slice(-30);
                return newData;
            });
        });

        return () => subscription.unsubscribe();
    }, []);

    const latestData = chartData[chartData.length - 1] || { tvl: 0, dau: 0, trx: 0 };

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Analytics Dashboard</h1>
            <div className="mb-6">
                <RealTimeChart />
            </div>
            <div className="grid gap-6 lg:grid-cols-4">
                <div className="space-y-6 lg:col-span-1">
                    <MetricCard title="Total Value Locked (TVL)" value={`$${((latestData?.tvl ?? 0) / 1000000).toFixed(2)}M`} change="+10%" />
                    <MetricCard title="Daily Active Users (DAU)" value={latestData.dau.toLocaleString()} change="+5%" />
                    <MetricCard title="Daily Transactions (TRX)" value={latestData.trx.toLocaleString()} change="+7%" />
                </div>
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>{getChartTitle(activeTab)}</CardTitle>
                        <CardDescription>{getChartDescription(activeTab)}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
                            <TabsList>
                                <TabsTrigger value="tvl">TVL</TabsTrigger>
                                <TabsTrigger value="dau">DAU</TabsTrigger>
                                <TabsTrigger value="trx">TRX</TabsTrigger>
                            </TabsList>
                        </Tabs>
                        <div className="h-[270px]">
                            {activeTab === 'dau' ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis 
                                            dataKey="timestamp" 
                                            tickFormatter={(tick) => new Date(tick * 1000).toLocaleDateString()} 
                                        />
                                        <YAxis />
                                        <Tooltip 
                                            labelFormatter={(label) => new Date(label * 1000).toLocaleString()} 
                                        />
                                        <Bar dataKey="dau" fill="#FFFF00" /> {/* Yellow bars */}
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis 
                                            dataKey="timestamp" 
                                            tickFormatter={(tick) => new Date(tick * 1000).toLocaleDateString()} 
                                        />
                                        <YAxis />
                                        <Tooltip 
                                            labelFormatter={(label) => new Date(label * 1000).toLocaleString()} 
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey={activeTab}
                                            stroke="#FFFF00" // Yellow line
                                            strokeWidth={2}
                                            dot={{ fill: 'red', stroke: 'red', r: 4 }} // Red points
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

function MetricCard({ title, value, change }: { title: string; value: string; change: string }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className={`text-xs ${change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>{change}</p>
            </CardContent>
        </Card>
    );
}

function getChartTitle(tab: string) {
    switch (tab) {
        case 'tvl':
            return 'Total Value Locked (TVL)';
        case 'dau':
            return 'Daily Active Users (DAU)';
        case 'trx':
            return 'Daily Transactions (TRX)';
        default:
            return '';
    }
}

function getChartDescription(tab: string) {
    switch (tab) {
        case 'tvl':
            return 'Historical TVL data over time';
        case 'dau':
            return 'Historical DAU data over time';
        case 'trx':
            return 'Historical transaction data over time';
        default:
            return '';
    }
}

export default AnalyticsPage;