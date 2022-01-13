<script>
    import Header from "./components/Header.svelte";    
    import Customer from "./components/Customer.svelte";
    
</script>

<svelte:head>
    <!-- <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css"> -->
</svelte:head>

<Header/>

<main>    
    <Customer/>
</main>

<footer class="footer">
    <div class="content has-text-centered">
        <p class="has-text-weight-light">Santas Reindeers</p>
        <p class="has-text-weight-light">Tel.: +299 123456</p>
    </div>
</footer>

<style global>
    @import 'src/styles/global.scss';
</style>