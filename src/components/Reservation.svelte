<script>
    export let date = null;
    export let time = null;
    export let persons = null;
    export let name = '';
    export let email = '';
    let wishes, tel;
    
    
    import  {validate, validity, telvalidate, telvalidity} from "../store/Navigation.js";
</script>

<div class="p-4 control">
    <div class="columns">
        <div class="column" >
            <p>Datum</p>
            <input bind:value={date} class="input is-primary" type="date" placeholder="24.12.2022">
        </div>
        <div class="column">
            <p>Uhrzeit</p>
            <input bind:value={time} class="input is-primary" type="time" placeholder="16:00">
        </div>
        <div class="column">
            <p>Anzahl Personen</p>
            <input bind:value={persons} class="input is-primary" type="number" placeholder="4">
        </div>
    </div>
    
    <div class="columns">
        <div class="column">
            <p>Name</p>
            <input bind:value={name} class="input is-primary" type="text" placeholder="Santa Claus">
        </div>
        <div class="column">
            <p>E-Mail</p>
            <input bind:value={email} class="input is-primary" type="email" placeholder="santas.reindeers@christmas.com"
                class:field-danger={!$validity.valid}
                class:field-success={$validity.valid}
                use:validate={email}
            >
            {#if $validity.dirty && !$validity.valid}
                <span class="validation-hint">
                    INVALID - {$validity.message} 
                </span>
            {/if}
        </div>
        <div class="column">
            <p>Telefonnummer</p>
            <input bind:value={tel} class="input is-primary" type="tel" placeholder="0511 237475"
                class:field-danger={!$telvalidity.valid}
                class:field-success={$telvalidity.valid}
                use:telvalidate={tel}
            >
            {#if $telvalidity.dirty && !$telvalidity.valid}
                <span class="validation-hint">
                    INVALID - {$telvalidity.message} 
                </span>
            {/if}
        </div>
    </div>
    <div class="columns">
        <div class="column">
            <p>Besondere Wünsche:</p>
            <textarea bind:value={wishes} class="textarea is-primary" placeholder="Tisch in Nähe von Spielecke"></textarea>
        </div>
    </div>
</div>

<style>

	:global(body) {
		display: flex;
		flex-direction: column;
	}
	
	input {
		outline: none;
		border-width: 2px;
	}
	
	.validation-hint {
		color: red;
		padding: 6px 0;
	}
	
	.field-danger {
		border-color: red;
	}
	
	.field-success {
		border-color: green;
	}
</style>