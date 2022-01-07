<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css">

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
    }
</style>

<script>
    let grid = [
        [null,null,null,null,null,null,null],
        [null,1,null,2,null,3,null],
        [null,null,null,null,null,null,null],
        [null,4,null,5,null,6,null],
        [null,null,null,null,null,null,null],
        [null,7,null,8,null,9,null],
        [null,null,null,null,null,null,null]
    ]
</script>

<!--Container for Grid view. Create a div for each posible position. If table is present add table*/-->
<div class="field table_area">
    {#each grid as row}
        <div class="field is-horizontal area_column">
         {#each row as pos}
              <div class="field has-addons has-addons-centered table_field">
                  {#if pos != null}
                    <div class="field has-addons has-addons-centered">
                        <p class="has-text-centered">{pos}</p>
                    </div>
                  {/if}
              </div>
         {/each}
        </div>
    {/each}
</div>
