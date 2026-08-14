<script lang="ts">
    const { progressData, showTeam } = $props();

    import { tick } from 'svelte';
    // Fallback hex values, used only if the CSS chart tokens can't be resolved.
    const PIE_COLORS_FALLBACK = ['#61cf5a', '#4a9eff', '#f59e0b', '#a855f7', '#ef4444'];

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

        // Resolve the app's --chart-1..5 tokens at draw time so the pie stays
        // in sync with the active theme instead of hardcoding colors.
        const rootStyles = getComputedStyle(document.documentElement);
        const pieColors = PIE_COLORS_FALLBACK.map(
            (fallback, i) => rootStyles.getPropertyValue(`--chart-${i + 1}`).trim() || fallback
        );
        const mutedColor = rootStyles.getPropertyValue('--muted').trim() || '#e5e7eb';
        const textColor = rootStyles.getPropertyValue('--foreground').trim() || '#111';

        if (total === 0) {
            ctx.fillStyle = mutedColor;
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
            ctx.fillStyle = pieColors[i % pieColors.length];
            ctx.fill();
            startAngle += slice;
        });

        pie.forEach((member: any, i: number) => {
            const y = 210 + i * 20;
            ctx.fillStyle = pieColors[i % pieColors.length];
            ctx.fillRect(10, y, 12, 12);
            ctx.fillStyle = textColor;
            ctx.font = '12px sans-serif';
            ctx.fillText(`${member.name} (${member.contributions})`, 28, y + 10);
        });
    }
</script>

<canvas id="team-pie" class="mx-auto my-3 block"></canvas>
