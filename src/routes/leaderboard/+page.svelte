<script lang="ts">
    const { data } = $props();
    let searchValue = $state("");

    const filtered = $derived(
        data.board.filter((entry: any) => {
            return entry.name.toLowerCase().includes(searchValue.toLowerCase());
        })
    );
</script>

<main>
    <div class="col-12 text-center">
        <h2 class="mb-0">KHI Leaderboard</h2>
        <div class="mb-3 mt-3 d-flex justify-content-center">
            <input
                type="text"
                class="form-control"
                placeholder="Search by name..."
                bind:value={searchValue}
                style="maxWidth: 400px; width: 50%"
            />
        </div>
    </div>
    
    <div class="container py-3">
        <div class="d-flex gap-3 align-items-start flex-wrap">

            {#if data.user_placement}
            <div class="card border shadow-none" style="min-width: 180px; flex: 0 0 auto;">
                <div class="card-body">
                    <p class="text-muted small mb-1">Your placement</p>
                    <div class="d-flex align-items-baseline gap-2">
                        <span class="fs-3 fw-medium">#{data.user_placement.rank}</span>
                        <span class="text-muted small">{data.user_placement.name}</span>
                    </div>
                    <p class="text-muted small mb-0 mt-1">{data.user_placement.score.toLocaleString()} pts</p>
                </div>
            </div>
            {/if}

            <div class="card border shadow-none flex-grow-1" style="min-width: 280px;">
                <div class="card-header bg-transparent d-flex align-items-center gap-2 border-bottom">
                    <i class="ti ti-trophy" style="font-size:18px; color:#BA7517;"></i>
                    <span class="fw-medium">Leaderboard</span>
                </div>
                <ul class="list-group list-group-flush">
                    {#each filtered as entry}
                    <li
                        class="list-group-item d-grid align-items-center px-3 py-2"

                        class:gold={entry.rank === 1}
                        class:silver={entry.rank === 2}
                        class:bronze={entry.rank === 3}

                        class:list-group-item-secondary={entry.name === data.user?.name}
                        style="grid-template-columns: 2.5rem 1fr auto;"
                    >
                        <span class="text-center">
                            <span class="text-muted small">{entry.rank}</span>
                        </span>
                        <span class="small" class:fw-medium={entry.name === data.user?.name}>{entry.name}</span>
                        <span class="badge text-bg-light fw-normal">{entry.score.toLocaleString()} pts</span>
                    </li>
                    {/each}
                </ul>
            </div>

        </div>
    </div>
</main>

<style>
    .gold { background-color: #e9c422; }
    .silver { background-color: #e2e1da; }
    .bronze { background-color: rgb(241, 147, 110); }
</style>