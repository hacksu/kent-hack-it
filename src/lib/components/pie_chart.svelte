<script lang="ts">
    const { progressData, showTeam } = $props();

    import { tick } from 'svelte';
    const PIE_COLORS = ['#6366f1', '#72b35f', '#f59e0b', '#ef4444'];

    $effect(() => {
        if (showTeam && progressData.teamProg) {
            tick().then(drawPie);
        }
    });

    function drawPie() {
        const canvas = document.getElementById('team-pie') as HTMLCanvasElement;
        if (!canvas) return;

        const pie = progressData.teamProg!.pie;
        const total = pie.reduce((sum: number, m: any) => sum + m.contributions, 0);

        canvas.width = 200;
        canvas.height = 210 + pie.length * 20;

        const ctx = canvas.getContext('2d')!;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (total === 0) {
            ctx.fillStyle = '#e5e7eb';
            ctx.beginPath();
            ctx.arc(100, 100, 80, 0, Math.PI * 2);
            ctx.fill();
            return;
        }

        let startAngle = -Math.PI / 2;

        pie.forEach((member: any, i: number) => {
            const slice = (member.contributions / total) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(100, 100);
            ctx.arc(100, 100, 80, startAngle, startAngle + slice);
            ctx.closePath();
            ctx.fillStyle = PIE_COLORS[i % PIE_COLORS.length];
            ctx.fill();
            startAngle += slice;
        });

        pie.forEach((member: any, i: number) => {
            const y = 210 + i * 20;
            ctx.fillStyle = PIE_COLORS[i % PIE_COLORS.length];
            ctx.fillRect(10, y, 12, 12);
            ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--color-text-primary') || '#111';
            ctx.font = '12px sans-serif';
            ctx.fillText(`${member.name} (${member.contributions})`, 28, y + 10);
        });
    }
</script>

<canvas id="team-pie" style="margin: 12px auto; display: block;"></canvas>