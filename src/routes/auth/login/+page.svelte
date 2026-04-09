<script lang="ts">
    import { authClient } from "$lib/client";
    const { data } = $props(); // fetch data returned from respective .server.ts file

    function buttonStyle(color:string) {
        return `
            background-color: ${color};
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 5px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            width: 100%;
            justify-content: center;
        `;
    }
</script>

<main>
    <header>
        <div class="container mt-5">
            <div class="row justify-content-center">
                <div class="col-md-6">
                    <div class="card shadow">
                        <div class="card-body">
                            <h3 class="card-title text-center mb-4">Login</h3>
                            <div id="msg_popup"></div>

                            <div
                                style="
                                    display: flex;
                                    flex-direction: column;
                                    gap: 12px;
                                    max-width: 250px;
                                    margin: 0 auto;
                                    align-items: center;
                                "
                            >
                                {#each data.providers as { name, provider, icon }}
                                    <button
                                        onclick={async () => await authClient.signIn.social({ provider })}
                                    >
                                        <img
                                        src={icon}
                                        alt="GitHub"
                                        width="20"
                                        height="20"
                                        style="filter: invert(1);"
                                        />
                                        Login with {name}
                                    </button>
                                {/each}
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    </header>
</main>