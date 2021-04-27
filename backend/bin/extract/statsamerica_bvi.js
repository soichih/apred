#!/usr/bin/env nodejs

const fs = require('fs');
const async = require('async');
const config = require('../../config');
const mssql = require('mssql');


//I can only connect from IU VPN connected IPs - not dev1
mssql.connect(config.stats_america.db_stats4).then(pool=>{
    load(pool);
});

function load(pool) {
    let density = {};

    console.log("dbp_uscnty--------------------------------------------");
    pool.request().query(`

SELECT a.[year]
    , CONCAT(a.[statefips], a.[countyfips]) AS fips
    , a.[naics_code]
    , ISNULL(a.[estab_total],0) AS estab_total
    , ISNULL(b.[estab_total],0) AS estab_vuln_total
    , CASE WHEN a.[estab_total] = 0 THEN 0 ELSE ISNULL(b.[estab_total],0)/a.[estab_total] END AS estab_vuln_pct
    , ISNULL(a.[mm_employees],0) AS emp_total
    , ISNULL(b.[mm_employees],0) AS emp_vuln_total
    , CASE WHEN a.[mm_employees] = 0 THEN 0 ELSE ISNULL(b.[mm_employees],0)/a.[mm_employees] END AS emp_vuln_pct
FROM [stats4].[dbo].[cbp_uscnty] a 
LEFT OUTER JOIN (
    SELECT [year]
        , [statefips]
        , [countyfips]
        , CASE
            WHEN LEFT([naics_code],2) IN ('31','32','33') THEN '31-33'
            WHEN LEFT([naics_code],2) IN ('44','45') THEN '44-45'
            WHEN LEFT([naics_code],2) IN ('48','49') THEN '48-49'
            ELSE LEFT([naics_code],2)
        END naics_code
        , ISNULL(SUM([estab_total]),0.0) AS estab_total
        , ISNULL(SUM([mm_employees]),0.0) AS mm_employees
    FROM [stats4].[dbo].[cbp_uscnty]
    WHERE [naics_code] IN (
        '517110','517210','517410','518210',
        '111110','111120','111130','111140','111150','111160',
        '111199','111211','111219','111310','111320','111331',
        '111332','111333','111334','111335','111336','111339',
        '111411','111419','111421','111422','111910','111920',
        '111930','111940','111991','111992','111998','112111',
        '112120','112210','112330','112340','112320','112390',
        '221111','221112','221113','221114','221115','221116',
        '221117','221118','221121','221122','221210','221310',
        '221320',
        '310000','330000',
        '440000','450000',
        '493110','493120','493130','493190',
        '722410','722511','722513','722514'
    )
    GROUP BY [year], [statefips], [countyfips],
    CASE
        WHEN LEFT([naics_code],2) IN ('31','32','33') THEN '31-33'
        WHEN LEFT([naics_code],2) IN ('44','45') THEN '44-45'
        WHEN LEFT([naics_code],2) IN ('48','49') THEN '48-49'
        ELSE LEFT([naics_code],2)
    END
) b ON b.[year] = a.[year] 
    AND b.[statefips] = a.[statefips] 
    AND b.[countyfips] = a.[countyfips]
    AND b.[naics_code] = a.[naics_code]
WHERE a.[year] >= '2012'
    AND (a.[naics_code] LIKE '__' OR a.[naics_code] LIKE '__-__')
       AND a.[naics_code] != '00'
ORDER BY 
    a.[statefips], 
    a.[countyfips],
    a.[naics_code],
    a.[year] 
    `).then(res=>{
        /*
          {
            year: '2017',
            fips: '01007',
            naics_code: '72',
            estab_total: 18,
            estab_vuln_total: 15,
            estab_vuln_pct: 0.833333,
            emp_total: 265,
            emp_vuln_total: 215,
            emp_vuln_pct: 0.81132
          },
        */
        fs.writeFileSync(config.pubdir+"/raw/bvi.json", JSON.stringify(res.recordset));
        pool.close();
    });

    console.log("empl--------------------------------------------");
    pool.request().query(`
        SELECT a.statefips, a.countyfips, a.year, a.naics, b.naics_title, a.empl
        FROM cew_totown_n a, naics b
        WHERE 
            a.year = '2019' AND a.naics <> '00'
            AND a.naics = b.naics_code
            AND (a.naics LIKE '__' OR a.naics LIKE '__-__')
        ORDER BY empl 
    `).then(res=>{
        //AND a.statefips = '18' AND a.countyfips = '097'
        /*
        {
          statefips: '18',
          countyfips: '097',
          year: '2019',
          naics: '62',
          naics_title: 'Health Care and Social Services',
          empl: 99721.25
        }
        */
        /*
        res.recordset.forEach(rec=>{
            console.log(rec.statefips, rec.countfips, rec.naics, rec.naics_title);
        });
        */
        fs.writeFileSync(config.pubdir+"/raw/industries.json", JSON.stringify(res.recordset));
        pool.close();
    });

}

