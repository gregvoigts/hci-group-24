<script>
import { each } from "svelte/internal";

    import TableArea from "./TableArea.svelte";

    $: reservations = [
        {id: 0, name: "Santa", date: "24.12.2021", time: "13:00", persons: 4, table: 4},
        {id: 1, name: "Santa", date: "24.12.2021", time: "13:00", persons: 4, table: 4},
        {id: 2, name: "Bert", date: "24.12.2021", time: "13:00", persons: 4, table: 4},
        {id: 3, name: "Klaus", date: "24.12.2021", time: "13:00", persons: 4, table: 4},
        {id: 4, name: "Hubert", date: "24.12.2021", time: "13:00", persons: 4, table: 4},   
    ]
    console.log(reservations)
    let name;
    let date;
    let time;
    let persons;
    let table;
    let changeInput = "none"
    let changeOutput = "block"
    let k = 1;

    const onFocus =()=>isFocused=true;
	const onBlur =()=>isFocused=false;

    function newReservation() {
        var input = document.getElementById("input");
        input.style.display = "block"
    }

    function createReservation() {
        var input = document.getElementById("input");
        let id = reservations.length + 1;
        let reservation = {id, name, date, time, persons}
        reservations.push(reservation);
        reservations = reservations
        console.log(reservations)
        input.style.display = "none"
        name = ""
        date = ""
        time = ""
        persons = ""
        table = ""
    }

    function changeReservation(id) {
        var input = document.getElementById(id);
        input.style.display = "none"
        var output = document.getElementById(-id);
        output.style.display= "block"
    }

    function saveReservation(id) {
        var input = document.getElementById(id);
        input.style.display = "block"
        var output = document.getElementById(-id);
        output.style.display= "none"
    }

    function deleteReservation(id) {
        console.log(reservations)
        console.log(id - 1)
        reservations.splice(id - 1, 1)
        reservations = reservations
        for (let index = 0; index < reservations.length; index++) {
            reservations[index].id = index;  
        }
        saveReservation(id);
        console.log(reservations)
    }

    function hover(id) {
        var input = document.getElementById(id);
        input.style.color = "red"
    }
    function hoverNot(id) {
        var input = document.getElementById(id);
        input.style.color = "white"
    }
</script>

<div class="staff">
    <div style="flex: 1%;">
        <div style="border: solid; border-right: 0px;">
            <h1 >Reservations</h1>
            <div>

        </div>
        <div style="overflow: hidden; overflow-y: scroll">
            <ul class="p-2" style="height: 648px">
                {#each reservations as res}
                {#if res.id != 0}
                
                <li>
                    <div class="message mb-2">
                        <div id={res.id}>
                            <div class="message-header" 
                                id={res.id + 10}
                                on:focus={onFocus} 
                                on:blur={onBlur} 
                                on:click={changeReservation(res.id)} 
                                on:mouseover={hover(res.id + 10)} 
                                on:mouseout={hoverNot(res.id + 10)}
                            >    
                                {res.name}
                            </div>
                        
                            <div class="message-body" style="font-size: 15pt;">
                                {res.date}
                                {res.time}
                                {res.persons}
                            </div> 
                        </div>
                        
                        <div id={-res.id} style="display: none">
                            <div  class="message-header" 
                                on:click={changeReservation(res.id)} 
                            >
                            <input bind:value={res.name} placeholder="Name">
                        </div>
                        
                        <div class="message-body" style="font-size: 15pt;">
                            <input bind:value={res.date} placeholder="Date">
                            <input bind:value={res.time} placeholder="Time" >
                            <input bind:value={res.persons} placeholder="Persons" >
                            <p class="button is-primary" on:click={saveReservation(res.id)}><strong>Save</strong></p>
                            <p class="button is-primary" on:click={deleteReservation(res.id)}><strong>Delete</strong></p>
                        </div> 
                    </div>
                        
                    </div>
                </li>
                {/if}
                {/each}
                <div id=input class="message mb-2" style="display: none;">
                    <div class="message-header">
                        <input bind:value={name} placeholder="Name">
                    </div>
                    <div class="message-body">
                        <input bind:value={date} placeholder="Date">
                        <input bind:value={time} placeholder="Time">
                        <input bind:value={persons} placeholder="Nr of Persons">
                        <input bind:value={table} placeholder="Table nr">
                        <p class="button is-primary" on:click={createReservation}><strong>Create</strong></p>
                </div> 
            </ul> 
        </div>
            <p class="button is-primary" on:click={newReservation}><strong>New</strong></p>
        </div>
    </div>
    

    <div class="column" style="border: solid;">
        <TableArea gridCols=9 gridRows=9 />
    </div>
</div>

<style>
    .staff {
        display: flex;
        flex-direction: row;
        align-items: flex-start;
    }

    h1 {
        font-size: 30pt;
    }
</style>