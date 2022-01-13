<script>
    import Header from "./components/Header.svelte";    
    import Customer from "./components/Customer.svelte";
    import Staff from "./components/Staff.svelte"
    import {showCustomer} from "./store/Navigation.js"


</script>

<Header/>

<main>
    {#if $showCustomer}
    <Customer/>
    {:else}
    <Staff/>
    {/if}
</main>

<footer class="footer">
    <div class="content has-text-centered">
        <p class="has-text-weight-light">Santas Reindeers</p>
        
    </div>
</footer>

<style global>
    @import 'src/styles/global.scss';
</style>