
//https://account.mapbox.com/
mapboxgl.accessToken = 'pk.eyJ1Ijoic29pY2hpaCIsImEiOiJjazVqdnBsM2cwN242M2psdjAwZXhhaTFuIn0.o3koWlzx1Tup8CJ1B_KaEA';

new Vue({
    el: '#app',
    data() {
        return {
            map: null,
            test: "hello",
            props: [],
            selected: null,
            geojson: null,
        }
    },
    template: `
    <div>
        <div class="page">
            <h2>Restriction Levels</h2>
            <div id="map"/>

            <!--
            <div class="info">
                <div v-if="selected">
                    <h3>{{selected.name}}</h3>
                    <div v-if="selected.emergency_declaration">
                        <span class="name">Emergency Decleration</span> <b>Yes</b> 
                    </div>
                    <div v-if="selected.national_guard_activation">
                        <span class="name">National Guard Activation</span> <b>Yes</b> 
                    </div>
                    {{selected}}
                </div>
                <p v-else>Click a state to show info.</p>
            </div>
            -->

            <!--
            <span style="background-color: #0f0" class="legend-color"/> Employee Travel Restrictions
            -->

            <div v-if="selected">
                <h2>{{selected.name}}</h2>
                <p v-if="selected.statewide_closure_nonessential != ''" class="alert">
                    <b>Statewide Closure of Non‐Essential Businesses</b><br>
                    {{selected.statewide_closure_nonessential}}
                </p>
            </div>
            <p v-else>The color code on each states are determined using the following definitions for the restriction level.</p>

            <table class="table table-code">
            <thead>
                <tr>
                    <th>Level</th>
                    <th>State Employee Travel Restrictions</th>
                    <th>School Closures</th>
                    <th>Statewide Limits on Gathering</th>
                    <th>National Guard Activation</th>
                    <th>Business Closure</th>
                    <th>Curfew</th>
                </tr>
            </thead>
            <tr>
                <th style="background-color: rgba(255,0,0,0)">0</th>
                <td :class="{active: (this.selected && !this.selected.state_employee_travel_restrictions)}">No restrictions</td>
                <td :class="{active: (this.selected && this.selected.statewide_closure_school == '')}">No closure</td>
                <td :class="{active: (this.selected && this.selected.statewide_limits_on_gatherings == '')}">No limit</td>
                <td rowspan="4" style="background-color: #eee;" :class="{active: (this.selected && !this.selected.national_guard_activation)}">No Activation</td>
                <td :class="{active: (this.selected && this.selected.statewide_closure_nonessential == '')}">No closure</td>
                <td rowspan="4" style="background-color: #eee;" :class="{active: (this.selected && this.selected.statewide_curfew == '')}">No curfew</td>
            </tr>
            <tr>
                <th style="background-color: rgba(255,0,0,0.2)">1</th>
                <td rowspan="6" :class="{active: (this.selected && this.selected.state_employee_travel_restrictions)}">Yes</td>
                <td :class="{active: (this.selected && this.selected.statewide_closure_school == 'Local')}">Local closure</td>
                <td :class="{active: (this.selected && (this.selected.statewide_limits_on_gatherings == 'Recommended' || this.selected.statewide_limits_on_gatherings == 'Yes‐ 500 or more'))}">Recommended (/>500)</td>
                <td rowspan="2" :class="{active: (this.selected && this.selected.statewide_closure_nonessential.includes('recommended'))}">Recommended</td>
            </tr>
            <tr>
                <th style="background-color: rgba(255,0,0,0.4)">2</th>
                <td rowspan="5" :class="{active: (this.selected && this.selected.statewide_closure_school == 'Yes')}">Statewide closure</td>
                <td :class="{active: (this.selected && this.selected.statewide_limits_on_gatherings == 'Yes‐ 250 or more')}">For >250 or more</td>
            </tr>
            <tr>
                <th style="background-color: rgba(255,0,0,0.6)">3</th>
                <td :class="{active: (this.selected && this.selected.statewide_limits_on_gatherings == 'Yes‐ 100 or more')}">For >100 or more</td>
                <td rowspan="2" :class="{active: (this.selected && this.selected.statewide_closure_nonessential.startsWith('Limited'))}">Limited Operations Required</td>
            </tr>
            <tr>
                <th style="background-color: rgba(255,0,0,0.7)">4</th>
                <td :class="{active: (this.selected && this.selected.statewide_limits_on_gatherings == 'Yes‐ 50 or more')}">For >50 or more</td>
                <td rowspan="3" :class="{active: (this.selected && this.selected.national_guard_activation)}">Active</td>
                <td rowspan="3" :class="{active: (this.selected && this.selected.statewide_curfew != '')}">Local Curfew</td>
            </tr>
            <tr>
                <th style="background-color: rgba(255,0,0,0.8)">5</th>
                <td :class="{active: (this.selected && this.selected.statewide_limits_on_gatherings == 'Yes‐ 10 or more')}">For >10 or more</td>
                <td rowspan="2" :class="{active: (this.selected && this.selected.statewide_closure_nonessential.startsWith('Closure required'))}">Required</td>
            </tr>
            <tr>
                <th style="background-color: rgba(255,0,0,1)">6</th>
            </tr>
            </table>
            
            <br>
            <br>
        </div>
    </div>
    `,

    mounted() {
        this.map = new mapboxgl.Map({
            container: 'map', // container id
            style: 'mapbox://styles/mapbox/light-v10', // stylesheet location
            center: [-98.5, 40], // starting position [lng, lat]
            zoom: 3 // starting zoom
        });

        this.map.scrollZoom.disable();
        this.map.addControl(new mapboxgl.NavigationControl());

        Promise.all([this.loadCSV(), this.loadGeo()]).then(data=>{
            //merge csv into geojson
            this.geojson = data[1];
            //this.geojson.features.forEach(f=>console.dir(f.properties.name));
            //console.dir(this.geojson.features);
            
            /*
            let r = data[0][55];
            for(let i = 0;i < r.state.length;i++) console.log(r.state.charCodeAt(i), r.state.charAt(i));
            console.log(" ".charAt(0));
            let feature = this.geojson.features.find(feature=>{
                if(r.state.startsWith(feature.properties.name)) return true;
            });
            console.dir(feature);
            console.log("...............................");
            */

            data[0].forEach(rec=>{
                let feature = this.geojson.features.find(feature=>rec.state.startsWith(feature.properties.name));
                if(feature) {
                    //console.dir(feature);
                    Object.assign(feature.properties, rec);
                    this.props.push(rec);
                } else {
                    console.error("couldn't find feature for", rec.state);
                }
            });

            this.map.on('load', ()=>{
                this.createLayers();
            });
        });

    },

    methods: {
        loadGeo(cb) {
            return new Promise((resolve, reject)=>{
                axios.get("covid19states.geojson").then(res=>{
                    resolve(res.data);
                });
            });
        },
        loadCSV(cb) {
            return new Promise((resolve, reject)=>{
                axios.get("COVID2019StateTrackingChart.csv").then(res=>{
                    //csv contains &nbsp; for space.. I need to replace it with space so we can compare names
                    let re = new RegExp(String.fromCharCode(160), "g");
                    let ascii = res.data.replace(re, " ");

                    let csv = ascii.split("\n");
                    let recs = [];
                    csv.forEach(line=>{
                        if(line == "") return;
                        let cols = [];
                        let buf = "";
                        for(let i = 0;i < line.length; ++i) {
                            if(line[i] == ",") {
                                cols.push(buf);
                                buf = "";
                            } else {
                                if(line[i] == "\"") {
                                    i++;
                                    while(line[i] != "\"") {
                                        buf = buf + line[i];
                                        i++;
                                    }
                                } else {
                                    buf = buf + line[i];
                                }
                            }
                        }
                        let rec = {
                            state: cols[0],
                            emergency_declaration: (cols[1]=="Yes"),
                            national_guard_activation: (cols[2]=="Yes"),
                            state_employee_travel_restrictions: (cols[3]=="Yes"),
                            statewide_limits_on_gatherings: cols[4],
                            statewide_closure_school: cols[5], ///Yes or Local
                            statewide_closure_nonessential: cols[6], 
                            statewide_curfew: cols[7], //Yes or Local
                            waiver1135: cols[8], //Approved
                        };
                        rec.level = this.scoreLevel(rec);
                        recs.push(rec);
                    });
                    resolve(recs);
                }).catch(reject);
            });
        },

        scoreLevel_old(rec) {
            let max = 0;
            if(rec.state_employee_travel_restrictions && max < 1) max = 1;
            if(rec.statewide_closure_school == "Yes" && max < 2) max = 2;
            if(rec.statewide_limits_on_gatherings == "Yes‐ 100 or more" && max < 3) max = 3;
            if(rec.statewide_limits_on_gatherings == "Yes‐ 50 or more" && max < 4) max = 4;
            if(rec.statewide_limits_on_gatherings == "Yes‐ 25 or more" && max < 5) max = 5;
            if(rec.statewide_limits_on_gatherings == "Yes‐ 10 or more" && max < 6) max = 6;
            if(rec.statewide_limits_on_gatherings == "Recommended" && max < 1) max = 1;
            if(rec.national_guard_activation && max < 4) max = 4;
            return max;
        },

        scoreLevel(rec) {
            let score = 0;

            if(rec.state_employee_travel_restrictions) score += 0.5;

            switch(rec.statewide_closure_school) {
            case "Local": score += 0.5; break;
            case "Yes": score += 1; break;
            }

            switch(rec.statewide_limits_on_gatherings) {
            case "Recommended": 
            case "Yes‐ 500 or more": score += 0.2; break;
            case "Yes‐ 250 or more": score += 0.4; break;
            case "Yes‐ 100 or more": score += 0.6; break;
            case "Yes‐ 50 or more": score += 0.8; break;
            case "Yes‐ 10 or more": score += 1; break;
            }

            if(rec.national_guard_activation) score += 1;
            
            if(rec.statewide_limits_on_gatherings.startsWith("Closure Recommended")) score += 0.25;
            if(rec.statewide_limits_on_gatherings.startsWith("Limited operations")) score += 0.5;
            if(rec.statewide_limits_on_gatherings.startsWith("Closure required")) score += 0.75;
            if(rec.statewide_limits_on_gatherings.startsWith("Required closures")) score += 1;

            if(rec.statewide_curfew != "") score += 1;

            return score; //should be max 6 (actually 5.5 for now..)
        },

        createLayers() {
            this.map.addSource("statedata", {
                type: "geojson",
                data: this.geojson,
            });

            /*
            this.map.addLayer({
                'id': 'allstates',
                'source': 'statedata',
                'type': 'fill',
                'paint': { 'fill-color': '#000', 'fill-opacity': 0.1, }
            });
            */

            /*
            this.map.addLayer({
                'id': 'employee_travel_restrictions',
                'source': 'statedata',
                'type': 'fill',
                'filter': ['==', 'state_employee_travel_restrictions', true],
                'paint': { 'fill-color': '#0f0', 'fill-opacity': 0.5, }
            });
            this.map.loadImage('https://www.nationalguard.mil/portals/31/Images/Image%20Gallery/Graphics/ARNG-small.png', (err, image)=>{
                if(err) throw err;
                this.map.addImage('soldier', image);
                this.map.addLayer({
                    'id': 'points',
                    'type': 'symbol',
                    'source': 'statedata',
                    'filter': ['==', 'national_guard_activation', true],
                    'layout': {
                        "icon-allow-overlap": true,
                        'icon-image': 'soldier',
                        'icon-size': 0.05,
                    }
                });
            });

            this.map.addLayer({
                'id': 'national_guard_activation',
                'source': 'statedata',
                'type': 'fill',
                'filter': ['==', 'national_guard_activation', true],
                'paint': { 'fill-color': '#f00', 'fill-opacity': 0.5, }
            });
            */

            /*
            this.map.addLayer({
                'id': 'selected',
                'source': 'statedata',
                'type': 'fill',
                'filter': ['==', 'name', ''],
                'paint': { 'fill-color': '#fff', 'fill-opacity': 0.5, },
            });
            */

            this.map.addLayer({
                'id': 'selected',
                'source': 'statedata',
                'type': 'fill',
                'paint': { 
                    'fill-color': {
                        property: 'level',
                        stops: [
                            [0, 'rgba(255,0,0,0)'],
                            [6, 'rgba(255,0,0,0.8)'],
                        ]
                    }, 
                    //'fill-opacity': 1,
                },
            });

            this.map.on('click', e=>{
                const features = this.map.queryRenderedFeatures(e.point, {
                    layers: ['selected']
                });

                if(features.length == 1) {
                    this.selected = features[0].properties;
                    let coordinates = features[0].geometry.coordinates;
                    //this.map.setFilter('selected', ['==', 'name', this.selected.name]);
                    console.dir(this.selected);

                    let bounds = coordinates[0].reduce((bounds, coord)=>{
                        return bounds.extend(coord);
                    }, new mapboxgl.LngLatBounds(coordinates[0][0], coordinates[0][0]));
                    this.map.fitBounds(bounds, {padding: 20}); 
                }
            });

        },
    },

});

