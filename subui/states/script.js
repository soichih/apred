
//https://account.mapbox.com/
mapboxgl.accessToken = 'pk.eyJ1Ijoic29pY2hpaCIsImEiOiJjazVqdnBsM2cwN242M2psdjAwZXhhaTFuIn0.o3koWlzx1Tup8CJ1B_KaEA';

new Vue({
    el: '#app',
    data() {
        return {
            map: null,
            modified: null,
            test: "hello",
            props: [],
            selected: null,
            geojson: null,
            county: null, //county travel restrictions
        }
    },
    template: `
    <div>
        <div class="page">
            <p>
                This map shows the current US travel restrictions and business / school closures. 
                The data is from <a href="https://www.nga.org/coronavirus/">https://www.nga.org/coronavirus</a>
                and was last updated on {{new Date(modified).toLocaleString()}}. Click on a state to view data.
            </p>
    
            <!--<h2>Restriction Levels</h2>-->
            <div id="map"/>

            <div v-if="selected">
                <h2>{{selected.name}}</h2>
                <h3>
                    <span style="font-size: 90%; opacity: 0.5;">Restriction Score</span>  
                    <span style="font-size: 150%"><b>{{selected.level}}</b></span>
                    <span style="opacity: 0.7">/ 5</span>
                </h3>

                <p v-if="selected.major_disaster_declaration != ''" class="alert">
                    <b>Major Disaster Declaration</b><br>
                    {{selected.major_disaster_declaration}}
                </p>

                <p v-if="selected.national_guard_activation != ''" class="alert">
                    <b>National Guard Activation</b><br>
                    Activated
                </p>

                <p v-if="selected.statewide_closure_nonessential != ''" class="alert">
                    <b>Statewide Closure of Non‐Essential Businesses</b><br>
                    {{selected.statewide_closure_nonessential}}
                </p>


                <p v-if="selected.name == 'Indiana'">For county specific travel advisory, please see <a href="http://www.in.gov/dhs/traveladvisory/">http://www.in.gov/dhs/traveladvisory/</a></p>

            </div>
            <p v-else>The color code on each states are determined using the following definitions for the restriction level.</p>
            <table class="table table-code">

            <thead>
                <!--
                <tr>
                    <th style="text-align: left;">Restriction Level</th>
                    <th style="background-color: rgba(255,0,0,0)">0</th>
                    <th style="background-color: rgba(255,0,0,0.2)">1</th>
                    <th style="background-color: rgba(255,0,0,0.4)">2</th>
                    <th style="background-color: rgba(255,0,0,0.6)">3</th>
                    <th style="background-color: rgba(255,0,0,0.8)">4</th>
                    <th style="background-color: rgba(255,0,0,1)">5</th>
                </tr>
                -->
                <tr>
                    <th style="text-align: left;">Restriction Level</th>
                    <th style="background-color: #fff">0</th>
                    <th style="background-color: #62D2A2">1</th>
                    <th style="background-color: #F9ED69">2</th>
                    <th style="background-color: #F08A5D">3</th>
                    <th style="background-color: #B83B5E">4</th>
                    <th style="background-color: #6A2C70">5</th>
                </tr>
            </thead>

            <tbody>
            <tr>
                <th>State Employee Travel Restrictions</th>
                <td :class="{active: (this.selected && !this.selected.state_employee_travel_restrictions)}">No Restrictions</td>
                <td :class="{active: (this.selected && this.selected.state_employee_travel_restrictions)}" colspan="5">Active</td>
            </tr>

            <tr>
                <th>School Closures</th>
                <td :class="{active: (this.selected && this.selected.statewide_closure_school == '')}">No Closure</td>
                <td :class="{active: (this.selected && this.selected.statewide_closure_school == 'Local')}">Local Closure</td>
                <td :class="{active: (this.selected && this.selected.statewide_closure_school == 'Yes')}" colspan="5">Statewide Closure</td>
            </tr>

            <!--
            <tr>
                <th>Childcare Closures</th>
                <td :class="{active: (this.selected && this.selected.statewide_closure_school == '')}">No Closure</td>
                <td :class="{active: (this.selected && this.selected.statewide_closure_school == 'Local')}">Local Closure</td>
                <td :class="{active: (this.selected && this.selected.statewide_closure_school == 'Yes')}" colspan="5">Statewide Closure</td>
            </tr>
            -->

            <tr>
                <th>Statewide Limits on Gathering</th>
                <td :class="{active: (this.selected && this.selected.statewide_limits_on_gatherings == '')}">No Limit</td>
                <td :class="{active: (this.selected && (
                    this.selected.statewide_limits_on_gatherings.startsWith('Recommended') || 
                    this.selected.statewide_limits_on_gatherings.startsWith('Local') || 
                    this.selected.statewide_limits_on_gatherings.startsWith('Yes‐ 50 or more') || 
                    this.selected.statewide_limits_on_gatherings.startsWith('Yes‐ unspecified')))}">Recommended</td>
                <td :class="{active: (this.selected && this.selected.statewide_limits_on_gatherings.startsWith('Yes‐ 25 or more'))}">For 25 or more</td>
                <td :class="{active: (this.selected && this.selected.statewide_limits_on_gatherings.startsWith('Yes‐ 10 or more'))}">For 10 or more</td>
                <td :class="{active: (this.selected && this.selected.statewide_limits_on_gatherings.startsWith('Yes‐ 5 or more'))}">For 5 or more</td>
                <td :class="{active: (this.selected && this.selected.statewide_limits_on_gatherings.startsWith('Yes‐ stay at home'))}">Stay at home</td>
            </tr>

            <!--
            <tr>
                <th>National Guard Activation</th>
                <td colspan="3" :class="{active: (this.selected && !this.selected.national_guard_activation)}">No Activation</td>
                <td colspan="3" :class="{active: (this.selected && this.selected.national_guard_activation)}">Active</td>
            </tr>

            <tr>
                <th>Major Disaster Declaration</th>
                <td colspan="2" :class="{active: (this.selected && this.selected.major_disaster_declaration == '')}">No Declaration</td>
                <td colspan="2" :class="{active: (this.selected && this.selected.major_disaster_declaration == 'Request Made')}">Request Made</td>
                <td colspan="2" :class="{active: (this.selected && this.selected.major_disaster_declaration == 'Request Approved')}">Request Approved</td>
            </tr>
            -->

            <tr>
                <th>Business Closure</th>
                <td :class="{active: (this.selected && this.selected.statewide_closure_nonessential == '')}">No Closure</td>
                <td colspan="2" :class="{active: (this.selected && this.selected.statewide_closure_nonessential.includes('recommended'))}">Recommended</td>
                <td colspan="2" :class="{active: (this.selected && this.selected.statewide_closure_nonessential.startsWith('Limited'))}">Limited Operations</td>
                <td :class="{active: (this.selected && this.selected.statewide_closure_nonessential.startsWith('Closure required'))}">Required</td>
            </tr>

            <tr>
                <th>Curfew</th>
                <td colspan="2" :class="{active: (this.selected && this.selected.statewide_curfew == '')}">No Curfew</td>
                <td colspan="2" :class="{active: (this.selected && this.selected.statewide_curfew == 'Local')}">Local Curfew</td>
                <td colspan="2" :class="{active: (this.selected && this.selected.statewide_curfew == 'Yes')}">Active</td>
            </tr>

            </tbody>
            </table>
            
            <br>
            <br>
            <br>
            <br>
            <br>
            <br>
            <br>
            <br>
            <br>
            <br>
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

        Promise.all([this.loadCSV(), this.loadGeo(), this.loadCounty()]).then(data=>{
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

        loadCounty(cb) {
            return new Promise((resolve, reject)=>{
                axios.get("travelrestriction.json").then(res=>{
                    this.county = res.data;
                    resolve(res.data);
                });
            });
        },

        loadCSV(cb) {
            return new Promise((resolve, reject)=>{
                axios.get("COVID2019StateTrackingChart.csv").then(res=>{
                    //csv contains &nbsp; for space.. I need to replace it with space so we can compare names
                    this.modified = res.headers["last-modified"];
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
                        /*
                        0 State,
                        1 Emergency Declaration,
                        2 Major Disaster Dec,
                        3 National Guard Activation,
                        4 State Employee Travel Restrictions,
                        5 Statewide Limits on Gatherings,
                        6 Statewide School Closures,
                        7 State Child Care Closures,
                        8 Statewide Closure of Non‐Essential Businesses,
                        9 Statewide Curfew,
                        10 1135 Waiver Status,
                        11 Extension of Individual Income Tax Deadlines,
                        12 Primary Election
                        */
                        let rec = {
                            state: cols[0],
                            emergency_declaration: (cols[1]=="Yes"),
                            major_disaster_declaration: cols[2], //Request Approved / Request Made 
                            national_guard_activation: (cols[3]=="Yes"),
                            state_employee_travel_restrictions: (cols[4]=="Yes"),
                            statewide_limits_on_gatherings: cols[5],
                            statewide_closure_school: cols[6], ///Yes or Local
                            statewide_closure_childcare: cols[7], ///Yes or Local
                            statewide_closure_nonessential: cols[8], 
                            statewide_curfew: cols[9], //Yes or Local
                            waiver1135: cols[10], //Approved
                            extension_incometax: cols[11], 
                            primary_election: cols[12], 
                        };
                        rec.level = this.scoreLevel(rec);
                        recs.push(rec);
                    });
                    resolve(recs);
                }).catch(reject);
            });
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
            case "Local": 
            case "Yes‐ 50 or more": 
            case "Yes‐ unspecified": 
                    score += 0.2; 
                    break;
            case "Yes‐ 25 or more": score += 0.4; break;
            case "Yes‐ 10 or more": score += 0.6; break;
            case "Yes‐ 5 or more": score += 0.8; break;
            case "Yes‐ stay at home": score += 1; break;
            }

            //if(rec.national_guard_activation) score += 1;
            /*
            switch(rec.major_disaster_declaration) {
            case "Request Made": score += 0.5; break;
            case "Request Approved": score += 1; break;
            }
            */
 
            if(rec.statewide_limits_on_gatherings.startsWith("Closure Recommended")) score += 0.25;
            if(rec.statewide_limits_on_gatherings.startsWith("Limited operations")) score += 0.5;
            if(rec.statewide_limits_on_gatherings.startsWith("Closure required")) score += 0.75;
            if(rec.statewide_limits_on_gatherings.startsWith("Required closures")) score += 1;

            if(rec.statewide_curfew == "Local") score += 0.5;
            if(rec.statewide_curfew != "Yes") score += 1;

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

            this.map.addLayer({
                'id': 'level',
                'source': 'statedata',
                'type': 'fill',
                'paint': { 
                    'fill-color': {
                        property: 'level',
                        stops: [
                            [0, 'rgba(255,255,255,0.75)'],
                            [1, 'rgba(98,210,162,0.75)'],
                            [2, 'rgba(249,237,105,0.75)'],
                            [3, 'rgba(240,139,93,0.75)'],
                            [4, 'rgba(184,59,94,0.75)'],
                            [5, 'rgba(106,44,112,0.75)'],
                        ]
                    }, 
                    /*
                    'fill-color': [
                        'match', ['get', 'level'],
                        0, '#fbb03b',
                        1, '#223b53',
                        2, '#e55e5e',
                        3, '#3bb2d0',
                        '#ccc' //other
                    ],
                    */
                    'fill-outline-color': 'rgba(0,0,0,0)',
                },
            });

            this.map.addLayer({
                'id': 'selected',
                'source': 'statedata',
                'type': 'line',
                'filter': ['==', 'name', ''],
                'paint': { 'line-color': '#fff', 'line-width': 3 },
            });

            this.map.addSource('counties', {
                "type": "vector",
                "url": "mapbox://mapbox.82pkq93d"
            });

            let filter_warning = ['in', 'FIPS'];
            let filter_watch = ['in', 'FIPS'];
            let filter_advisory = ['in', 'FIPS'];
            this.county.forEach(c=>{
                if(c.state == "Warning") filter_warning.push(parseInt(c.fips));
                if(c.state == "Watch") filter_watch.push(parseInt(c.fips));
                if(c.state == "Advisory") filter_advisory.push(parseInt(c.fips));
            });
            this.map.addLayer({
                "id": "counties-warning",
                "type": "fill",
                "source": "counties",
                minzoom: 5,
                "source-layer": "original",
                "paint": {
                    'fill-outline-color': '#444',
                    'fill-color': 'red',
                    'fill-opacity': 0.75,
                },
                'filter': filter_warning,
            });
            this.map.addLayer({
                "id": "counties-watch",
                "type": "fill",
                "source": "counties",
                minzoom: 5,
                "source-layer": "original",
                "paint": {
                    'fill-outline-color': '#444',
                    'fill-color': 'orange',
                    'fill-opacity': 0.75,
                },
                'filter': filter_watch,
            });
            this.map.addLayer({
                "id": "counties-advisory",
                "type": "fill",
                "source": "counties",
                minzoom: 5,
                "source-layer": "original",
                "paint": {
                    'fill-outline-color': '#444',
                    'fill-color': 'yellow',
                    'fill-opacity': 0.75,
                },
                'filter': filter_advisory,
            });


            this.map.on('click', e=>{
                const features = this.map.queryRenderedFeatures(e.point, {
                    layers: ['level']
                });

                if(features.length == 1) {
                    this.selected = features[0].properties;
                    let coordinates = features[0].geometry.coordinates;
                    this.map.setFilter('selected', ['==', 'name', this.selected.name]);

                    /*
                    //zoom to selected state
                    let bounds = coordinates[0].reduce((bounds, coord)=>{
                        return bounds.extend(coord);
                    }, new mapboxgl.LngLatBounds(coordinates[0][0], coordinates[0][0]));
                    this.map.fitBounds(bounds, {padding: 20}); 
                    */
                }
            });

        },
    },

});

