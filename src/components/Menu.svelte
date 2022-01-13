<body>

<script>
    function changeColor(id) {
        if(id == 15){
            document.getElementById(15).innerHTML = "schäm dich";
        }
        else if(document.getElementById(id).classList.contains("is-success")) {
            document.getElementById(id).classList = "notification";
        } else {
            document.getElementById(id).classList = "notification is-success";
        }
    }
</script>


<div class="p-4 control">
    <div class="columns">
        <div class="column" >
            <div class="card">
                <header class="card-header">
                    <p class="card-header-title">
                    Hauptgerichte
                    </p>
                </header>
                <div class="card-content">
                    <div class="content">
                        <div class="container m-2">
                            <div class="notification" id=11 onclick="changeColor(11)">
                                Veganer Weihnachtsbraten
                            </div>
                        </div>
                        <div class="container m-2">
                            <div class="notification" id=12 onclick="changeColor(12)" >
                                Vegetarischer Weihnachtsbraten
                            </div>
                        </div>
                        <div class="container m-2">
                            <div class="notification" id=13 onclick="changeColor(13)" >
                                Kartoffelsalat
                            </div>
                        </div>
                        <div class="container m-2">
                            <div class="notification" id=14 onclick="changeColor(14)" >
                                Rotkohl und Klöße
                            </div>
                        </div>
                        <div class="container m-2">
                            <div class="notification" id=15 onclick="changeColor(15)" >
                                <s>Rentier</s>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="column">
            <div class="card">
                <header class="card-header">
                    <p class="card-header-title">
                    Plätzchen
                    </p>
                </header>
                <div class="card-content">
                    <div class="content">
                        <div class="container m-2">
                            <div class="notification" id=21 onclick="changeColor(21)">
                                Liebevoll ausgestochene Plätzchen
                            </div>
                        </div>
                        <div class="container m-2">
                            <div class="notification" id=22 onclick="changeColor(22)" >
                                Schokomakronen
                            </div>
                        </div>
                        <div class="container m-2">
                            <div class="notification" id=23 onclick="changeColor(23)" >
                                Marzipanmakronen
                            </div>
                        </div>
                        <div class="container m-2">
                            <div class="notification" id=24 onclick="changeColor(24)" >
                                Schwarz-Weiß-Gebäck
                            </div>
                        </div>
                        <div class="container m-2">
                            <div class="notification" id=25 onclick="changeColor(25)" >
                                Frankfurter Bethmännchen
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="column">
            <div class="card">
                <header class="card-header">
                    <p class="card-header-title">
                    Glühwein
                    </p>
                </header>
                <div class="card-content">
                    <div class="content">
                        <div class="container m-2">
                            <div class="notification" id=31 onclick="changeColor(31)">
                                Christkindl
                            </div>
                        </div>
                        <div class="container m-2">
                            <div class="notification" id=32 onclick="changeColor(32)" >
                                Glögg
                            </div>
                        </div>
                        <div class="container m-2">
                            <div class="notification" id=33 onclick="changeColor(33)" >
                                Der gute von IKEA
                            </div>
                        </div>
                        <div class="container m-2">
                            <div class="notification" id=34 onclick="changeColor(34)" >
                                Der nicht so gute aus dem Tetra Pak
                            </div>
                        </div>
                        <div class="container m-2">
                            <div class="notification" id=35 onclick="changeColor(35)" >
                                Feuerzangenbowle
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

</body>

