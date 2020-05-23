
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
            <table class="legend">
            <thead>
                <tr style="font-size: 85%; text-align: center;">
                    <td></td>
                    <td>Least Restrictive</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td>Most Restrictive</td>
                </tr>
                <tr>
                    <th width="10%" style="text-align: left;" class="restriction_score">Restriction&nbsp;Score</th>
                    <th width="10%" style="background-color: #fff">0</th>
                    <th width="10%" style="background-color: #62D2A2">1</th>
                    <th width="10%" style="background-color: #F9ED69">2</th>
                    <th width="10%" style="background-color: #F08A5D">3</th>
                    <th width="10%" style="background-color: #B83B5E; color: white;">4</th>
                    <th width="10%" style="background-color: #6A2C70; color: white;">5</th>
                </tr>
            </thead>
            </table>
            <div id="map"/>

            <div v-if="selected">
                <h2>{{selected.name}}</h2>
                <h3>
                    <span style="font-size: 90%; opacity: 0.5;">Restriction Score</span>  
                    <span style="font-size: 150%"><b>{{selected.level.toFixed(2)}}</b></span>
                    <span style="opacity: 0.7">/ 5</span>
                </h3>

                <p v-if="selected.name == 'Indiana'">For county specific travel advisory, please see <a href="http://www.in.gov/dhs/traveladvisory/">http://www.in.gov/dhs/traveladvisory/</a></p>

                <!--
                <p v-if="selected.major_disaster_declaration != ''" class="alert">
                    <b>Major Disaster Declared</b>
                </p>
                -->

                <p v-if="selected.national_guard_activation != ''" class="alert">
                    <b>National Guard Activated</b>
                </p>

                <!--
                <p v-if="selected.statewide_closure_nonessential != ''" class="alert">
                    <b>Statewide Closure of Non‐Essential Businesses</b><br>
                    {{selected.statewide_closure_nonessential}}
                </p>
                -->


            </div>
            <p v-else>The restriction score is computed by analyzing various criterias such as school closure, non-essential business / travel restrictions, curfew, etc.</p>

            <table class="info" v-if="selected">
                <tr>
                    <th>Restrictions</th>
                    <th style="color: gray;">
                        <!--
                        Less Restrictive <span style="float: right">More Restrictive</span>
                        -->
                        Scores
                    </th>
                </tr>
                <tr>
                    <th>State Employee Travel Restrictions</th>
                    <td>
                        <!--state employee travel restrictions-->
                        <p class="option" :class="{active: (!selected.state_employee_travel_restrictions)}"><span class="circle"/> No Restrictions (+0)</p>
                        <p class="option" :class="{active: (selected.state_employee_travel_restrictions)}"><span class="circle"/> Active (+0.5)</p>
                    </td>
                </tr>
                <tr>
                    <th>School Closures</th>
                    <td>
                        <!--school closures-->
                        <p class="option" :class="{active: (selected.statewide_closure_school == '')}"><span class="circle"/> No Closure (+0)</p>
                        <p class="option" :class="{active: (selected.statewide_closure_school.startsWith('recommended closure'))}"><span class="circle"/> Recommended Closure (+0.25)</p>
                        <p class="option" :class="{active: (selected.statewide_closure_school.startsWith('statewide closure'))}"><span class="circle"/> Statewide Closure (+0.5)</p>
                    </td>
                </tr>
                <tr>
                    <th>Curfew</th>
                    <td>
                        <!--curfew-->
                        <p class="option" :class="{active: (selected.statewide_curfew == '')}"><span class="circle"/> No Curfew (+0)</p>
                        <p class="option" :class="{active: (selected.statewide_curfew == 'Local')}"><span class="circle"/> Local Curfew (+0.25)</p>
                        <p class="option" :class="{active: (selected.statewide_curfew == 'Yes')}"><span class="circle"/> Statewide Curfew (+0.5)</p>
                    </td>
                </tr>
                <tr>
                    <th>Business Closure</th>
                    <td>
                        <i>{{selected.statewide_closure_nonessential||'none'}}</i> (+{{scoreStatewideClosure(selected.statewide_closure_nonessential)}})
                    </td>
                </tr>
                <tr>
                    <th>Statewide Limits on Gathering</th>
                    <td>
                        <p class="option" :class="{active: (selected.statewide_limits_on_gatherings == '')}"><span class="circle"/> No Limit (+0)</p>
                        <p class="option" :class="{active: (
                            selected.statewide_limits_on_gatherings.startsWith('Recommended') ||
                            selected.statewide_limits_on_gatherings.startsWith('Guidance to avoid') ||
                            selected.statewide_limits_on_gatherings.startsWith('Local') ||
                            selected.statewide_limits_on_gatherings.startsWith('Yes- unspecified'))}">
                            <span class="circle"/> Recommended (+0.2)
                        </p>
                        <p class="option" :class="{active: (selected.statewide_limits_on_gatherings.startsWith('Yes-50or'))}"><span class="circle"/> For 50 or more (+0.3)</p>
                        <p class="option" :class="{active: (selected.statewide_limits_on_gatherings.startsWith('Yes-30or'))}"><span class="circle"/> For 30 or more (+0.4)</p>
                        <p class="option" :class="{active: (selected.statewide_limits_on_gatherings.startsWith('Yes-25or'))}"><span class="circle"/> For 25 or more (+0.5)</p>
                        <p class="option" :class="{active: (selected.statewide_limits_on_gatherings.startsWith('Yes-15or'))}"><span class="circle"/> For 15 or more (+0.6)</p>
                        <p class="option" :class="{active: (selected.statewide_limits_on_gatherings.startsWith('Yes-10or'))}"><span class="circle"/> For 10 or more (+0.7)</p>
                        <p class="option" :class="{active: (selected.statewide_limits_on_gatherings.startsWith('Yes-5or'))}"><span class="circle"/> For 5 or more (+0.8)</p>
                        <p class="option" :class="{active: (selected.statewide_limits_on_gatherings.startsWith('Yes-3or'))}"><span class="circle"/> For 3 or more (+0.9)</p>
                        <p class="option" :class="{active: (selected.statewide_limits_on_gatherings.startsWith('Yes-all'))}"><span class="circle"/> All Gathering (+1)</p>
                    </td>
                </tr>
                <tr>
                    <th>Domestic Travel Limitations</th>
                    <td>
                        <p class="option" :class="{active: (selected.domestic_travel_limit == '')}"><span class="circle"/> No Limit (+0)</p>
                        <p class="option" :class="{active: (selected.domestic_travel_limit.startsWith('Recommendation'))}"><span class="circle"/> Recommended (+0.5)</p>
                        <p class="option" :class="{active: (selected.domestic_travel_limit.startsWith('Mandatory'))}"><span class="circle"/> Mandatory (+0.75)</p>
                        <p class="option" :class="{active: (selected.domestic_travel_limit.startsWith('Executive'))}"><span class="circle"/> Executive Order (+1)</p>
                    </td>
                </tr>
                <tr>
                    <th>Mask in Public</th>
                    <td>
                        <p class="option" :class="{active: (selected.statewide_mask == '')}"><span class="circle"/> No (+0)</p>
                        <p class="option" :class="{active: (selected.statewide_mask.startsWith('Rec') || selected.statewide_mask.startsWith('Yes'))}"><span class="circle"/> Recommended (+0.25)</p>
                        <p class="option" :class="{active: (selected.statewide_mask.startsWith('Mandatory'))}"><span class="circle"/> Mandatory (+0.5)</p>
                    </td>
                </tr>
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

        Promise.all([this.loadCSV(), this.loadGeo()/*, this.loadCounty()*/]).then(data=>{
            //console.log("loaded data");
            //merge csv into geojson
            this.geojson = data[1];
            //console.log("data[0]");
            //console.dir(this.geojson.features);
            data[0].forEach(rec=>{
                let feature = this.geojson.features.find(feature=>rec.state.startsWith(feature.properties.name));
                if(feature) {
                    //console.dir(feature);
                    Object.assign(feature.properties, rec);
                    this.props.push(rec);
                } else {
                    console.error("couldn't find feature for "+rec.state);
                }
            });

            this.map.on('load', ()=>{
                this.createLayers();
            });
        }).catch(err=>{
            console.error(err);
        });;

    },

    methods: {
        loadGeo() {
            return new Promise((resolve, reject)=>{
                axios.get("https://gpu1-pestillilab.psych.indiana.edu/apred/covid19states.geojson").then(res=>{
                    resolve(res.data);
                });
            });
        },

            /*
        loadCounty() {
            return new Promise((resolve, reject)=>{
                axios.get("travelrestriction.json").then(res=>{
                    this.county = res.data;
                    resolve(res.data);
                });
            });
        },
            */

        loadCSV() {
            return new Promise((resolve, reject)=>{
                axios.get("https://gpu1-pestillilab.psych.indiana.edu/apred/COVID2019StateTrackingChart.csv").then(res=>{
                    //csv contains &nbsp; for space.. I need to replace it with space so we can compare names
                    this.modified = res.headers["last-modified"];
                    let re = new RegExp(String.fromCharCode(160), "g");
                    let ascii = res.data.replace(re, " ");

                    re = new RegExp(String.fromCharCode(8208), "g");
                    ascii = ascii.replace(re, "-");

                    let csv = ascii.split("\n");
                    let recs = [];
                    let headers = csv.shift();
                    console.dir(headers);
                    //console.dir(csv);

                    for(let l = 0;l < csv.length; ++l) {
                        let line = csv[l];
                        if(line == "") continue;
                        if(line[0] == "*") continue;
                        if(line[0] == ",") continue;
                        line = line.replace(/\"\"/g, "'");

                        //console.log(line);

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
                                        if(i == line.length) {
                                            //reach the end of line without ending double quote.. try reading the next line
                                            while(true) {
                                                l++;
                                                i = 0;
                                                line = csv[l];
                                                line = line.replace(/\"\"/g, "'");
                                                //console.log(line.length, line);
                                                if(line.length) break;
                                            }
                                        }
                                    }
                                } else {
                                    buf = buf + line[i];
                                }
                            }
                        }
                        cols.push(buf); //add the last column
                        /*
                        0 State,
                        1 State Employee Travel Restrictions,
                        2 Statewide Stay at Home Orders and Guidance*,
                        3 Statewide Limits on Gatherings,
                        4 Statewide School Closures ,
                        5 Statewide Closure of Certain Business Spaces,
                        6 Resources on Business Openings/Closures*,
                        7 Statewide Curfew,
                        8 Extension of Individual Income Tax Deadlines,
                        9 Presidential Primary Election,
                        10 Quarantine Requirements for Interstate Travel,
                        11 Using Cloth Face Coverings in Public,
                        12 Ventilator Sharing,
                        13 Reopening Plans and Task Forces,
                        Unnamed: 14,
                        Unnamed: 15,
                        Unnamed: 16
                        */
                        let state = cols[0].split("(")[0];
                        let rec = {
                            state,
                            state_employee_travel_restrictions: (cols[1]=="Yes"),
                            stay_at_home_order: cols[2],
                            statewide_limits_on_gatherings: cols[3].replace(/ /g, ""),
                            statewide_closure_school: cols[4], ///Yes or Local
                            statewide_closure_nonessential: cols[5], 
                            essential_designations: cols[6], 
                            statewide_curfew: cols[7], //Yes or Local
                            extension_incometax: cols[8], 
                            primary_election: cols[9], 
                            domestic_travel_limit: cols[10], 
                            statewide_mask: cols[11], 
                            ventilator_sharing: cols[12], 
                            reopening_plans: cols[13], 
                        };
                        rec.level = this.scoreLevel(rec);
                        //console.dir(rec);
                        recs.push(rec);
                    }
                    //console.dir(headers);
                    //console.dir(recs[0]);
                    resolve(recs);
                }).catch(err=>{
                    reject(err);
                });
            });
        },

        scoreLevel(rec) {
            let score = 0;

            //max 0.5
            if(rec.state_employee_travel_restrictions) score += 0.5;

            //max 0.5;
            if(rec.statewide_closure_school.startsWith("statewide closure")) score += 0.5;
            else if(rec.statewide_closure_school.startsWith("recommended closure")) score += 0.25;
            else if(rec.statewide_closure_school.startsWith("option")) score += 0.1;

            //max 0.5
            if(rec.statewide_curfew.startsWith("Yes")) score += 0.5;
            else if(rec.statewide_curfew == "Local") score += 0.25;

            //max 1
            if(rec.statewide_limits_on_gatherings.startsWith("Yes-all")) score += 1;
            else if(rec.statewide_limits_on_gatherings.startsWith("Yes-3or")) score += 0.9;
            else if(rec.statewide_limits_on_gatherings.startsWith("Yes-5or")) score += 0.8;
            else if(rec.statewide_limits_on_gatherings.startsWith("Yes-10")) score += 0.7;
            else if(rec.statewide_limits_on_gatherings.startsWith("Yes-15")) score += 0.6;
            else if(rec.statewide_limits_on_gatherings.startsWith("Yes-25")) score += 0.5;
            else if(rec.statewide_limits_on_gatherings.startsWith("Yes-30")) score += 0.4;
            else if(rec.statewide_limits_on_gatherings.startsWith("Yes-50")) score += 0.3;
            else if(
                rec.statewide_limits_on_gatherings.startsWith("SupremeCourt") ||
                rec.statewide_limits_on_gatherings.startsWith("Yes-unspecified")) score += 0.2;
            //else console.log(rec.statewide_limits_on_gatherings);

            //max 1
            score += this.scoreStatewideClosure(rec.statewide_closure_nonessential);

            //max 1
            if(rec.domestic_travel_limit.startsWith('Executive')) score += 1;
            else if(rec.domestic_travel_limit.startsWith('Mandatory')) score += 0.75;
            else if(rec.domestic_travel_limit.startsWith('Recommendation')) score += 0.5;
            else console.log(rec.domestic_travel_limit);

            //max 0.5
            if(rec.statewide_mask.startsWith('Rec') || rec.statewide_mask.startsWith('Yes')) score += 0.25;
            if(rec.statewide_mask.startsWith('Mandatory')) score += 0.5;

            return score;
        },

        scoreStatewideClosure(value) {
            value = value.toLowerCase();
            if(value.includes("prohibited")) return 1;
            else if(value.includes("required")) return 0.8;
            else if(value.includes("limited")) return 0.6;
            else if(value.includes("recommended")) return 0.4;
            return 0;
        },

        createLayers() {
            //https://docs.mapbox.com/mapbox-gl-js/example/geojson-layer-in-stack/
            // Find the index of the first symbol layer in the map style
            var layers = this.map.getStyle().layers;
            var firstSymbolId;
            for (var i = 0; i < layers.length; i++) {
                if (layers[i].type === 'symbol') {
                    firstSymbolId = layers[i].id;
                    break;
                }
            }

            this.map.addSource("statedata", {
                type: "geojson",
                data: this.geojson,
            });


            this.map.addLayer({
                'id': 'level',
                'source': 'statedata',
                'type': 'fill',
                'paint': { 
                    'fill-color': {
                        property: 'level',
                        stops: [
                            [0, 'rgb(255,255,255)'],
                            [1, 'rgb(98,210,162)'],
                            [2, 'rgb(249,237,105)'],
                            [3, 'rgb(240,139,93)'],
                            [4, 'rgb(184,59,94)'],
                            [5, 'rgb(106,44,112)'],
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
            }, firstSymbolId);

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

