<style>
    .table_area{
        padding: 3vh 3vw;
        height: 75vw;
    }
    .area_column{
        padding: 0;
        margin: 0 !important;
    }
    .table_field{
        padding: 0;
        margin: 0 !important;
        width: 14vw;
        height: 7vh;
        border-width: 0.5px;
        border-color: lightgray;
        border-style: dashed;
    }
    .table{
        width: 90%;
        height: 90%;
        margin: 5%;
    }
    svg{
        width: 100%;
        height: 100%;
    }
    img{
        position: absolute;
        z-index: -10;
    }

</style>

<script>

    let gridRows = 15;
    let gridCols = 20;

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
        if(coords[0]<=2 && coords[1]>=10){
            return;
        }

        if(coords[0]<=9 && coords[1] == 8){
            return;
        }

        if(coords[0] == 9){
            return;
        }
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
        {id:1,reservId:1,pos:[0,0]},
        {id:2,reservId:null,pos:[0,2]},
        {id:3,reservId:null,pos:[0,4]},
        {id:4,reservId:null,pos:[0,6]},
        {id:5,reservId:null,pos:[2,0]},
        {id:6,reservId:1,pos:[4,0]},
        {id:7,reservId:null,pos:[6,0]},
        {id:8,reservId:null,pos:[3,3]},
        {id:9,reservId:1,pos:[3,4]},
        {id:10,reservId:1,pos:[3,6]},
        {id:11,reservId:null,pos:[3,7]},
        {id:12,reservId:null,pos:[5,3]},
        {id:13,reservId:null,pos:[5,4]},
        {id:14,reservId:null,pos:[5,6]},
        {id:15,reservId:1,pos:[5,7]},
        {id:16,reservId:null,pos:[8,4]},
        {id:17,reservId:null,pos:[8,6]},
        {id:18,reservId:1,pos:[3,9]},
        {id:19,reservId:1,pos:[3,10]},
        {id:20,reservId:null,pos:[3,12]},
        {id:21,reservId:null,pos:[3,13]},
        {id:22,reservId:null,pos:[5,9]},
        {id:23,reservId:null,pos:[5,10]},
        {id:24,reservId:1,pos:[5,12]},
        {id:25,reservId:null,pos:[5,13]},
        {id:26,reservId:null,pos:[8,10]},
        {id:27,reservId:1,pos:[8,12]},
        {id:28,reservId:1,pos:[3,15]},
        {id:29,reservId:null,pos:[3,16]},
        {id:30,reservId:null,pos:[3,18]},
        {id:31,reservId:null,pos:[3,19]},
        {id:32,reservId:null,pos:[5,15]},
        {id:33,reservId:1,pos:[5,16]},
        {id:34,reservId:null,pos:[5,18]},
        {id:35,reservId:null,pos:[5,19]},
        {id:36,reservId:1,pos:[8,16]},
        {id:37,reservId:1,pos:[8,18]},
        {id:38,reservId:null,pos:[11,0]},
        {id:39,reservId:null,pos:[13,0]},
        {id:40,reservId:null,pos:[11,3]},
        {id:41,reservId:null,pos:[13,3]},
        {id:42,reservId:1,pos:[10,6]},
        {id:43,reservId:null,pos:[11,6]},
        {id:44,reservId:null,pos:[13,6]},
        {id:45,reservId:1,pos:[14,6]},
        {id:46,reservId:1,pos:[10,9]},
        {id:47,reservId:null,pos:[11,9]},
        {id:48,reservId:null,pos:[13,9]},
        {id:49,reservId:null,pos:[14,9]},
        {id:50,reservId:null,pos:[11,11]},
        {id:51,reservId:1,pos:[13,11]},
        {id:52,reservId:null,pos:[10,17]},
        {id:53,reservId:null,pos:[11,17]},
        {id:54,reservId:1,pos:[13,17]},
        {id:55,reservId:1,pos:[14,17]},
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
<div class="field">
    <img src="/restaurant.png" alt="restaurant">
<div class="field table_area">    
    {#each grid as row}
        <div class="field is-horizontal area_column">
         {#each row as pos}
              <div id="gridField_{getFieldId()}" class="field has-addons has-addons-centered table_field" on:dragover={allowDrop} on:drop={dropHandler}>
                  {#if pos != null}
                  <div on:drag={dragHandler} id="table_{pos.id}" class="field has-addons has-addons-centered table" draggable="true">
                    <svg width="380" height="532" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" overflow="hidden" viewBox="0 0 100 100" >
                        <defs>
                            <clipPath id="clip0">
                                <rect x="450" y="49" width="380" height="532"/>
                            </clipPath>
                        </defs>
                        <g clip-path="url(#clip0)" transform="translate(-450 -49)">
                            <rect x="451.5" y="126.5" width="378" height="378" stroke="#A58763" stroke-width="1.33333" stroke-miterlimit="8" fill="#A58763"/>
                            <rect x="530.5" y="504.5" width="220" height="76" stroke="#927676" stroke-width="1.33333" stroke-miterlimit="8" fill="#927676"/>
                            <rect x="530.5" y="51.5001" width="220" height="75" stroke="#927676" stroke-width="1.33333" stroke-miterlimit="8" fill="#927676"/>
                        </g>
                    </svg>
                </div>
                  {/if}
              </div>
         {/each}
        </div>
    {/each}
</div>
</div>