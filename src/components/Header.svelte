<script>
    import {showCustomer} from "../store/Navigation.js"
</script>

<header>
    <nav class="navbar">
        <div class="navbar-brand">
            <a href="/" class="navbar-item">
                <span class="icon">
                    🦌
                </span>
            </a>
        </div>
        <div class="navbar-menu">
            <div class="navbar-item is-centered">
                <p class="name has-text-weigt-bold is-size-1">Santas Reindeers</p>
            </div>
            <div class="navbar-end">
                <div class="navbar-item">
                    <div class="buttons">
                        <button class="button is-primary" on:click="{() => $showCustomer = !$showCustomer}">
                            <strong>{$showCustomer ? 'Customer' : 'Staff'}</strong>
                        </button>

                        <a href="/" class="button is-light">
                        Log in
                        </a>
                  </div>
                </div>
              </div>
        </div>
    </nav>
</header>

<style lang="scss">
    .navbar {
        background: #fafafa;
    }

    .name {
        font-family: 'Niconne', cursive;
        color: $red-dark;
    }

    .icon {
        font-size: xx-large;
    }

</style>