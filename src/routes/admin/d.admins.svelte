<script>
    const admins = [];
</script>

<div class="container mt-4 d-flex justify-content-center align-items-center">
    <div class="row w-100 justify-content-center">
        <h4>Current Admins</h4>

        <ul class="list-group w-auto">
            {#each admins as admin, index (index)}
                <li
                    class="list-group-item d-flex align-items-center px-3 py-2"
                    style="font-size: 1rem; min-width: 250px; max-width: 400px;"
                >
                    <!-- Avatar + Username -->
                    <div class="d-flex align-items-center flex-grow-1">
                        <img
                            src={admin.avatarUrl}
                            alt="{admin.username}'s avatar"
                            class="rounded-circle me-3"
                            style="width: 40px; height: 40px; object-fit: cover;"
                        />
                        <span class="fw-semibold text-dark">{admin.username}</span>
                    </div>

                    <!-- Delete Button -->
                    <button
                        class="btn btn-sm btn-outline-danger ms-3"
                        onClick={() => {}}
                    >
                        <i class="bi bi-trash"></i> Delete
                    </button>
                </li>
            {/each}
        </ul>
    </div>
</div>