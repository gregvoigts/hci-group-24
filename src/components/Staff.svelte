<script>
import { each } from "svelte/internal";
    
    import {selectedIds,selectedListSize} from "../store/Navigation.js";
    import TableArea from "./TableArea.svelte";

    $: reservations = [
        {id: 0, name: "Santa", date: "24.12.2021", time: "13:00", persons: 4, table: [1,2,3]},
        {id: 1, name: "Santa", date: "24.12.2021", time: "13:00", persons: 4, table: [4,5,6]},
        {id: 2, name: "Bert", date: "24.12.2021", time: "13:00", persons: 4, table: [7,8,9]},
        {id: 3, name: "Klaus", date: "24.12.2021", time: "13:00", persons: 4, table: [10,11,12]},
        {id: 4, name: "Hubert", date: "24.12.2021", time: "13:00", persons: 4, table: [53]},   
    ]
    
    let name;
    let date;
    let time;
    let persons;
    let table;

    const onFocus =()=>isFocused=true;
	const onBlur =()=>isFocused=false;

    function newReservation() {
        var input = document.getElementById("input");
        input.style.display = "block"
    }

    function createReservation() {
        var input = document.getElementById("input");
        let id = reservations.length;
        let table = $selectedIds
        let reservation = {id, name, date, time, persons, table }
        reservations.push(reservation);
        reservations = reservations
        console.log(reservations)
        input.style.display = "none"
        name = ""
        date = ""
        time = ""
        persons = ""
        table = []
        $selectedIds = []
        $selectedListSize = 0
    }

    function changeReservation(id) {
        console.log(id)
        console.log(reservations)
        $selectedIds = reservations[id].table
        
        $selectedListSize = reservations[id].table.length
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
        $selectedIds = []
        $selectedListSize = 0
    }

    function deleteReservation(id) {
        console.log(reservations)
        console.log(id - 1)
        reservations.splice(id , 1)
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

<div class="staff columns m-5">
    <div class="box column">
        <div>
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
                        <p class="button is-primary" on:click={createReservation}><strong>Create</strong></p>
                </div> 
            </ul> 
        </div>
            <p class="button is-primary" on:click={newReservation}><strong>New</strong></p>
        </div>
    </div>
    

    <div class="column is-half">
        <TableArea isStaff=1/>
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