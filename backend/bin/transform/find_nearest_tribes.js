#!/usr/bin/env nodejs

const {Polygon, point, Relations} = require('@flatten-js/core');
let {distanceTo} = Relations;

const fs = require('fs');
const config = require('../../config.js');
const assert = require('assert');

const counties_geo_json = fs.readFileSync(config.pubdir+'/counties_geo.json');
const counties_geo = JSON.parse(counties_geo_json);
console.log("loaded counties:", counties_geo.features.length);

const cb_geo_json = fs.readFileSync(__dirname+'/cb_2018_us_aiannh_500k-export.geojson');
const cb_geo = JSON.parse(cb_geo_json);
console.log("loaded cb_geo:", cb_geo.features.length);

//console.dir(cb_geo);

function parseCoordinates(coordinates) {
    //console.log(JSON.stringify(coordinates, null, 4));
    let polygon = new Polygon();
    coordinates.forEach(cs=>{
        let points = [];
        cs.forEach(p=>{
            points.push(point(p[0], p[1]));
        });
        polygon.addFace(points);
    });
    return polygon;
}

console.log("creating polygon for counties");
counties_geo.features.forEach(feature=>{
    if(feature.geometry.type == "Polygon") {
        feature.polygon = parseCoordinates(feature.geometry.coordinates);
    } else if(feature.geometry.type == "MultiPolygon") {
        feature.polygon = parseCoordinates(feature.geometry.coordinates[0]);
    } else {
        //console.dir(feature);
        process.exit(1);
    }
});

console.log("creating polygon for cb");
cb_geo.features.forEach(feature=>{
    if(feature.geometry.type == "Polygon") {
        feature.polygon = parseCoordinates(feature.geometry.coordinates);
    } else if(feature.geometry.type == "MultiPolygon") {
        feature.polygon = parseCoordinates(feature.geometry.coordinates[0]);
    } else {
        //console.dir(feature);
        process.exit(1);
    }
});

let tribes = [];

cb_geo.features.forEach(feature=>{
    let output_name = "output/"+feature.properties.AIANNHCE+".json";

    //console.log("----------------------------------------------------------------------------------");
    //console.log("computing intersections for ...");
    //console.dir(feature.properties);

    if(fs.existsSync(output_name)) {
        console.log("skipping..");
        return;
    }

    //feature.properties.intersect_counties = [];
    let closest = null
    let closest_dist = null; 
    counties_geo.features.forEach(c_feature=>{
        /* slow, and some reservation doesn't intersect..
        if(intersect(c_feature.polygon, feature.polygon)) {
            console.log("intersect with", c_feature.properties);
            feature.properties.intersect_counties.push(c_feature.properties);
        }
        */
        let dist = c_feature.polygon.distanceTo(feature.polygon);
        //console.dir(dist);
        if(closest_dist == null || closest_dist > dist[0]) {
            closest = c_feature;
            closest_dist = dist[0];
        }
    });
    feature.properties.nearest_county = closest.properties;

    /*
    let c = feature.properties.intersect_counties[0];
    counties[c.STATE+"."+c.COUNTY] = c;
    counties[c.STATE+"."+c.COUNTY].tribes = [feature.properties];
    delete feature.properties.intersect_counties;
    console.log(counties[c.STATE+"."+c.COUNTY]);
    *
    */
    console.log(tribes.length, "of", cb_geo.features.length);
    //console.dir(feature.properties);
    tribes.push(feature.properties);
});

console.log("saving");
fs.writeFileSync(config.pubdir+"/tribes.json", JSON.stringify(tribes));


