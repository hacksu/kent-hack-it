<script lang="ts">
    const users = [];
    let searchTerm = "";

    const nonAdminUserCount = users.filter(user => !user.is_admin).length;
    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
</script>

<div class="users-tab">
    <div class="d-flex justify-content-between align-items-center mb-3">
        <h5 class="mb-0">Registered Users</h5>
        <span class="badge bg-primary fs-6">
            {nonAdminUserCount} User{nonAdminUserCount !== 1 ? 's' : ''}
        </span>
    </div>

    <div class="mb-4">
        <input
            type="text"
            class="form-control"
            placeholder="Search users by username..."
            value={searchTerm}
            oninput={() => {}}
        />
    </div>

    <!-- User Cards -->
    <div class="row">

        {#each filteredUsers as user (user._id)}
            <div class="col-md-3 mb-3">
                <!-- 4 cards per row -->
                <div class="card shadow-sm border-0 h-100 rounded-3" style="font-size: 0.9rem;">
                    <div class="card-body d-flex flex-column justify-content-between p-3">

                        <!-- Top: Avatar + Username -->
                        <div class="d-flex align-items-center mb-2">
                            <img
                                src={user.avatarUrl}
                                alt="{user.username}'s avatar"
                                class="rounded-circle me-2 shadow-sm"
                                style="width: 45px; height: 45px; object-fit: cover;"
                            />
                            <h6 class="card-title mb-0 fw-bold" style="font-size: 1rem;">
                                {user.username}
                            </h6>
                        </div>

                        <!-- Details -->
                        <div class="ms-1">
                            <p class="card-text text-muted mb-1">
                                <strong>Email:</strong> {user.email}
                            </p>
                            <p class="card-text text-muted mb-0">
                                <strong>Team ID:</strong> {user.team_id || "—"}
                            </p>
                        </div>

                        <!-- Action -->
                        <div class="mt-2">
                            <button
                                class="btn btn-sm btn-outline-danger w-100"
                                onclick={() => {}}
                            >
                                <i class="bi bi-trash me-1"></i> Remove
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        {/each}

    </div>
</div>