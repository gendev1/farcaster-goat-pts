export async function fetchLeaderboardData() {
    try {
        const [goatData, projectData, questData] = await Promise.all([
            fetch('/api/leaderboard/goat').then(res => res.json()),
            fetch('/api/leaderboard/projects').then(res => res.json()),
            fetch('/api/leaderboard/quests').then(res => res.json())
        ]);

        return {
            goatData,
            projectData,
            questData
        };
    } catch (error) {
        console.error('Error fetching leaderboard data:', error);
        throw error;
    }
}

export async function fetchStats() {
    const response = await fetch('/api/stats');
    if (!response.ok) throw new Error('Failed to fetch stats');
    return response.json();
} 