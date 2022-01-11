<style>
    .table_area{
        padding: 1vh 1vw;
    }
    .area_column{
        padding: 0;
        margin: 0 !important;
    }
    .table_field{
        padding: 0;
        margin: 0 !important;
        width: 14vw;
        height: 14vh;
        border-width: 0.5px;
        border-color: lightgray;
        border-style: dashed;
    }
    .table{
        width: 90%;
        height: 90%;
        margin: 5%;
    }

</style>

<script>

    export let gridRows;
    export let gridCols;

    let idDragged = undefined;

    import DragDropTouch from 'svelte-drag-drop-touch'

    function dropHandler(ev) {
        ev.preventDefault();
        var targetId = getId(ev.target.id);
        var coords = getCoords(targetId[0]);
        var src = idDragged;
        let table = tables.find((e)=>{return e.id == Number(src);})
        grid[table.pos[0]][table.pos[1]] = null;
        grid[coords[0]][coords[1]] = table;
        table.pos = coords;
        idDragged = undefined;
    }

    function allowDrop(ev){
        var targetId = getId(ev.target.id);
        if(targetId[1]){
            return;
        }
        var coords = getCoords(targetId[0]);
        if(grid[coords[0]][coords[1]] == null){
            ev.preventDefault();
        }
    }

    function dragHandler(ev){
        var src = getId(ev.target.id)[0];
        idDragged = src;
    }

    function getId(NameId){
        if(NameId == null || NameId === ""){
            return[-1,true];
        }
        let arr = String(NameId).split("_")
        let isTable = arr[0] === "table"
        return [parseInt(arr[1]),isTable];
    }

    function getCoords(number){
        let col = number%Number(gridCols);
        let row = (number-col)/Number(gridCols);
        return [row,col];
    }

    let tables = [
        {id:1,reservId:1,pos:[1,1]},
        {id:2,reservId:null,pos:[1,3]},
        {id:3,reservId:null,pos:[1,5]},
        {id:4,reservId:null,pos:[3,1]},
        {id:5,reservId:null,pos:[3,3]},
        {id:6,reservId:1,pos:[3,5]},
        {id:7,reservId:null,pos:[5,1]},
        {id:8,reservId:null,pos:[5,3]},
        {id:9,reservId:1,pos:[5,5]}
    ]

    let grid = new Array(Number(gridRows)).fill().map(()=>Array(Number(gridCols)).fill(null));
    tables.forEach(element => {
        grid[element.pos[0]][element.pos[1]] = element;
    });

    let girdFieldId=0;

    function getFieldId(){
        let id = girdFieldId;
        girdFieldId++;
        return id;
    }
</script>

<!--Container for Grid view. Create a div for each posible position. If table is present add table*/-->
<div class="field table_area">
    {#each grid as row}
        <div class="field is-horizontal area_column">
         {#each row as pos}
              <div id="gridField_{getFieldId()}" class="field has-addons has-addons-centered table_field" on:dragover={allowDrop} on:drop={dropHandler}>
                  {#if pos != null}
                  <div on:drag={dragHandler} id="table_{pos.id}" class="field has-addons has-addons-centered has-background-{pos.reservId!=null?"danger":"success"} table" draggable="true">
                    <p class="has-text-centered">Table {pos.id}</p>
                </div>
                  {/if}
              </div>
         {/each}
        </div>
    {/each}
</div>