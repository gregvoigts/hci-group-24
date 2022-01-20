<script>
    export let date = null;
    export let time = null;
    export let persons = null;
    export let name = '';
    export let email = '';
    let wishes, tel;
    
    let isPersonsValid, isNameValid, isDateValid, isTimeValid;

    $: isPersonsValid = persons > 0 && persons < 17;
    $: isNameValid = name !== '';
    $: isDateValid = date !== null;
    $: isTimeValid = time !== null;
    
    import  {validate, validity, telvalidate, telvalidity} from "../store/Navigation.js";
</script>

<div class="p-4 control">
    <div class="columns">
        <div class="column" >
            <p>Datum</p>
            <input bind:value={date} class="input" type="date" placeholder="24.12.2022"
                class:is-success={isDateValid}
                class:is-danger={!isDateValid}
            >
        </div>
        <div class="column">
            <p>Uhrzeit</p>
            <input bind:value={time} class="input" type="time" placeholder="16:00"
                class:is-success={isTimeValid} 
                class:is-danger={!isTimeValid}
            >
        </div>
        <div class="column">
            <p>Anzahl Personen</p>
            <input bind:value={persons} class="input" type="number" placeholder="4"
                class:is-success={isPersonsValid} 
                class:is-danger={!isPersonsValid}
            >
        </div>
    </div>
    
    <div class="columns">
        <div class="column">
            <p>Name</p>
            <input bind:value={name} class="input" type="text" placeholder="Santa Claus"
                class:is-success={isNameValid} 
                class:is-danger={!isNameValid}
            >
        </div>
        <div class="column">
            <p>E-Mail</p>
            <input bind:value={email} class="input" type="email" placeholder="santas.reindeers@christmas.com"
                class:is-danger={!$validity.valid}
                class:is-success={$validity.valid}
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
                class:is-success={$telvalidity.valid}
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
            <textarea bind:value={wishes} class="textarea" placeholder="Tisch in Nähe von Spielecke"></textarea>
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