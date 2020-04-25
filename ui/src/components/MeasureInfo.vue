<template>
<div class="measure-info">
    <!-- SOC -->
    <div v-if="id == '11'">
        Ration of Persons With More than a High School Degree to those with a High School Degree.
        This index was calculated with Codes 391 (Bachelor’s Degree or More) devided by 397 (Less Than a High School Degree) from the ACS Common Items Extract.
    </div>
    <div v-if="id == '12'">
        Proportion of the population below the age of 65.
        This index was calculate with Codes 300 (Total Population) and 317 (Population over 65) from the ACS Common Items Extract. 
        Calculation: 1-([317] / [300])
    </div>
    <div v-if="id == '13'">
        Households with access to a vehicle for transportation. 
        Codes 304 (Households) and 412 (Households with No Vehicle) from the ACS Common Items Extract are used for this calculation.
        Calculation: 1-([412] / [304])
    </div>
    <div v-if="id == '14'">
        Households/units with access to telephone.
        Codes 303 (Housing Units) and 960 (Selected Housing Characteristics: No Telephone Service Available) from the ACS Common Items Extract are used for this calculation.
        Calculation: 1-([960] / [303])
    </div>
    <div v-if="id == '15'">
        English-speaking population.
        Codes 770 (Language Spoken at Home: Population with age 5 and above) and 771 (Language Spoken at Home: Population with age 5 and above: English Only) from the ACS Common Items Extract are used for this calculation.
        Calculation: [771] / [770]
    </div>
    <div v-if="id == '16'">
        Population without a disability.
        Codes 300 (Total Population) and 413 (Population with Disability) from the ACS Common Items Extract are used for this calculation.
        Calculation: 1-([413] / [300])
    </div>
    <div v-if="id == '17'">
        Population with health insurance.
        Codes 933 (HEALTH INSURANCE COVERAGE: Civilian noninstitutionalized population 18 to 64 years) and 936 (HEALTH INSURANCE COVERAGE: Civilian noninstitutionalized population 18 to 64 years: In Labor Force: Employed: With Coverage) and 941 (HEALTH INSURANCE COVERAGE: Civilian noninstitutionalized population 18 to 64 years: In Labor Force: Unemployed: With Coverage) and 946 (HEALTH INSURANCE COVERAGE: Civilian noninstitutionalized population 18 to 64 years: Not In Labor Force: With Coverage) from the ACS Common Items Extract are used for this calculation.
        Calculation: ( [936] + [941] + [946] ) / [933]
    </div>

    <!-- ECON -->

    <div v-if="id == '21'">
        Proportion of owned or mortgaged housing units.
        Codes 303 (Housing Units) and 965 (SELECTED HOUSING CHARACTERISTICS: Mortgage Status: Owner Occupied Units with a Mortgage) and 966 (SELECTED HOUSING CHARACTERISTICS: Mortgage Status: Owner Occupied Units without a Mortgage) from the ACS Common Items Extract are used for this calculation.
        Calculation: ([965] + [966])/[303]
    </div>
    <div v-if="id == '22'">
        Proportion of the population in the workforce.
        Codes 300 (Total Population) and 341 (Employment 16 and Over) from the ACS Common Items Extract are used for this calculation.
        Calculation: [341] / [300]
    </div>
    <div v-if="id == '23'">
        The disparity in income according to the GINI coeffecient.
        Table B19083: GINI Index of Income Inequality from the ACS is used for this calculation.
        Calculation: 1-[GINI]
    </div>
    <div v-if="id == '24'">
        Proportion of the population employed in single sector workforce.
        Code 300 (Total Population) from the ACS Common Items Extract and employment numbers from the Census County Business Patterns (NAICS Codes 11 and 21) are used for this calculation.
        Calculation: ([NAICS 11] + [NAICS 21]) / [300]
    </div>
    <div v-if="id == '25'">
        Female participation in the workforce.
        Lines 88 (SEX BY AGE BY EMPLOYMENT STATUS FOR THE POPULATION 16 YEARS AND OVER: Female) and 90, 97, 104, 111,118, 125, 132, 139, 146, 153, 160, 165, 170 (Female, Employed, by age bracket) from the ACS Table B23001 are used for this calculation.
        Calculation: [All but 88] / [88]
    </div>
    <div v-if="id == '26'">
        Proportion of large businesses in the area.
        Census County Business Patterns employment by business size was used for this calculation. A broad definition of small business defined by less than 500 employees was used.  
        Calculation: 1 - (Business&lt;500 / TotalBusinesses)
    </div>
    <div v-if="id == '27'">
        Relative number of physicians per capita.
        Code 300 (Total Population) from the ACS Common Items Extract and employment numbers for professions for physicians (NAICS codes between 291011 AND 291067) were used in this calculation.
        Calculation: [Employed in NAICS Codes] / [300]
    </div>

    <!-- INST -->
    <div v-if="id == '31'">
        TODO - describe Mitigation - Hazard Mitigation Plan Coverage
        1. What the index means (like.. "Educational Equity".. what is it?) Why is this measure part of this index?
        2. How the score was computed. Datasources, and math involved to compute it (score should be fully reproducible from the data source)
        3. Information about how to improve the score. Where should they invest, and how much money does it require to improve the score by 1% - even if it's just a guestimate.
    </div>
    <div v-if="id == '32'">
        TODO - describe Floor Coverage
        1. What the index means (like.. "Educational Equity".. what is it?) Why is this measure part of this index?
        2. How the score was computed. Datasources, and math involved to compute it (score should be fully reproducible from the data source)
        3. Information about how to improve the score. Where should they invest, and how much money does it require to improve the score by 1% - even if it's just a guestimate.
    </div>
    <div v-if="id == '33'">
        TODO - describe Municipal Services
        1. What the index means (like.. "Educational Equity".. what is it?) Why is this measure part of this index?
        2. How the score was computed. Datasources, and math involved to compute it (score should be fully reproducible from the data source)
        3. Information about how to improve the score. Where should they invest, and how much money does it require to improve the score by 1% - even if it's just a guestimate.
    </div>
    <div v-if="id == '34'">
        TODO - describe CRS Flood
        1. What the index means (like.. "Educational Equity".. what is it?) Why is this measure part of this index?
        2. How the score was computed. Datasources, and math involved to compute it (score should be fully reproducible from the data source)
        3. Information about how to improve the score. Where should they invest, and how much money does it require to improve the score by 1% - even if it's just a guestimate.
    </div>
    <div v-if="id == '35'">
        TODO - describe Political Fragmentation
        1. What the index means (like.. "Educational Equity".. what is it?)  Why is this measure part of this index?
        2. How the score was computed. Datasources, and math involved to compute it (score should be fully reproducible from the data source)
        3. Information about how to improve the score. Where should they invest, and how much money does it require to improve the score by 1% - even if it's just a guestimate.
    </div>
    <div v-if="id == '36'">
        TODO - describe Previous Disaster Experience
        1. What the index means (like.. "Educational Equity".. what is it?) Why is this measure part of this index?
        2. How the score was computed. Datasources, and math involved to compute it (score should be fully reproducible from the data source)
        3. Information about how to improve the score. Where should they invest, and how much money does it require to improve the score by 1% - even if it's just a guestimate.
    </div>
    <div v-if="id == '37'">
        TODO - describe Mitigation and Social Connectivity
        1. What the index means (like.. "Educational Equity".. what is it?) Why is this measure part of this index?
        2. How the score was computed. Datasources, and math involved to compute it (score should be fully reproducible from the data source)
        3. Information about how to improve the score. Where should they invest, and how much money does it require to improve the score by 1% - even if it's just a guestimate.
    </div>
    <div v-if="id == '38'">
        TODO - describe Storm Ready Communities
        1. What the index means (like.. "Educational Equity".. what is it?) Why is this measure part of this index?
        2. How the score was computed. Datasources, and math involved to compute it (score should be fully reproducible from the data source)
        3. Information about how to improve the score. Where should they invest, and how much money does it require to improve the score by 1% - even if it's just a guestimate.
    </div>

    <!-- IHFR -->

    <div v-if="id == '41'">
        Proportion of non-mobile homes.
        Table B25001 Line 1 (Total Housing Units) and Table B25025 Line 10 (Mobile home) from the ACS were used in this calculation.
        Calculation: 1-([B25025] / [B25001])
    </div>
    <div v-if="id == '42'">
        Proportion of unoccupied rental units in an area.
        Table B25004 Line 1 (Total), Line 2 (For rent), and Line 3 (Rented, not occupied) from the ACS were used for this calculation.
        Calculation: ([Line 2] + [Line 3]) / [Line 1]
    </div>
    <div v-if="id == '43'">
        Number of hospital beds per capita.
        This uses data on hospitals from Centers for Medicare and Medicaid Services (CMS) and is the number of beds per population.
        Calculation: [Beds] / [Population]
    </div>
    <div v-if="id == '44'">
       Number of miles of arterial highway per square mile. 
        This uses data from the National Highway Planning Network for the number of miles of arterial highway in each county and county size in square miles from the Census.
        Calculation: [Highway Miles] / [County Square Miles]
    </div>
    <div v-if="id == '45'">
        Proportion of housing units built between 1970 and 1989.
        Table B25001 Line 1 (Total Hosing Units), Table B25034 Line 5 (Year Structure Built: 1980 to 1989), and Table B25034 Line 6 (Year Structure Built: 1970 to 1979) from the ACS were used for this calculation.
        Calculation: ([Line 5] + [Line 6]) / [Line 1]
    </div>
    <div v-if="id == '46'">
        Number of hotels and motels per square mile.
        Uses NAICS Code 721110 (Hotels except Casino Hotels and Motels) from the Census County Business Patterns and the total square miles from the 2000 Census.
        Calculation: [NAICS 721110] / [Square Miles]
    </div>
    <div v-if="id == '47'">
        Number of elementary and secondary schools per square mile.
        Uses NAICS Code 611110 (Elementary and Secondary Schools) from the Census County Business Patterns and the total square miles from the 2000 Census.
        Calculation: [NAICS 611110] / [Square Miles]
    </div>

    <!-- COMM -->
    
    <div v-if="id == '51'">
        Proportion of the population that is not foreign-born.
        Codes 300 (Total Population) and 763 (Foreign Born Population, excluding population born at sea) from the ACS Common Items Extract are used for this calculation.
        Calculation: 1-([763] / [300])
    </div>
    <div v-if="id == '52'">
        Proportion of the population that resides in the same state of birth.
        Codes 747 (Total Birth Population) and 750 (Total Birth Population: Native: Born in same US state as of their residence) from the ACS Common Items Extract are used for this calculation.
        Calculation: [750] / [747]
    </div>
    <div v-if="id == '53'">
        Percentage of population that voted.
        Code 300 (Total Population) from the ACS Common Items Extract and voter turnout data from StatsAmerica were used for this calculation.
        Calculation: [Voters] / [300]
    </div>
    <div v-if="id == '54'">
        Number of religious organizations per capita.
        Code 300 (Total Population) from the ACS Common Items Extract and total establishments under NAICS Code 813110 (Religious Organizations) from the Census County Business Patterns were used for this calculation.
        Calculation: [NAICS 813110] / [300]
    </div>
    <div v-if="id == '55'">
        Number of civic organizations per capita.
        Code 300 (Total Population) from the ACS Common Items Extract and total establishments under NAICS Code 8134 (Civic Organizations) from the Census County Business Patterns were used for this calculation.
        Calculation: [NAICS 8134] / [300]
    </div>
    <div v-if="id == '56'">
        Number of social advocacy organizations per capita.
        Code 300 (Total Population) from the ACS Common Items Extract and total establishments under NAICS Code 8133 (Social Advocacy Organizations) from the Census County Business Patterns were used for this calculation.
        Calculation: [NAICS 8133] / [300]
    </div>
    <div v-if="id == '57'">
        Proportion of the population employed in a creative class occupation.
        Code 300 (Total Population) from the ACS Common Items Extract and employment numbers for those employed in creative class occupations (NAICS codes in the creative class occupations) were used in this calculation.
        Calculation: [Employed in NAICS Codes] / [300]
    </div>

    <!-- FLOR -->
    <div v-if="id == '101'">
        TODO - describe Business Vulnerability
        1. What the index means (like.. "Educational Equity".. what is it?) Why is this measure part of this index?
        2. How the score was computed. Datasources, and math involved to compute it (score should be fully reproducible from the data source)
        3. Information about how to improve the score. Where should they invest, and how much money does it require to improve the score by 1% - even if it's just a guestimate.
    </div>
    <div v-if="id == '102'">
        TODO - describe Flood Zone
        1. What the index means (like.. "Educational Equity".. what is it?) Why is this measure part of this index?
        2. How the score was computed. Datasources, and math involved to compute it (score should be fully reproducible from the data source)
        3. Information about how to improve the score. Where should they invest, and how much money does it require to improve the score by 1% - even if it's just a guestimate.
    </div>
    <div v-if="id == '103'">
        TODO - describe Commuting
        1. What the index means (like.. "Educational Equity".. what is it?) Why is this measure part of this index?
        2. How the score was computed. Datasources, and math involved to compute it (score should be fully reproducible from the data source)
        3. Information about how to improve the score. Where should they invest, and how much money does it require to improve the score by 1% - even if it's just a guestimate.
    </div>
    <div v-if="id == '104'">
        TODO - describe Housing Construction
        1. What the index means (like.. "Educational Equity".. what is it?) Why is this measure part of this index?
        2. How the score was computed. Datasources, and math involved to compute it (score should be fully reproducible from the data source)
        3. Information about how to improve the score. Where should they invest, and how much money does it require to improve the score by 1% - even if it's just a guestimate.
    </div>
    <div v-if="id == '105'">
        TODO - describe Second Stage Business
        1. What the index means (like.. "Educational Equity".. what is it?) Why is this measure part of this index?
        2. How the score was computed. Datasources, and math involved to compute it (score should be fully reproducible from the data source)
        3. Information about how to improve the score. Where should they invest, and how much money does it require to improve the score by 1% - even if it's just a guestimate.
    </div>
    <div v-if="id == '106'">
        TODO - describe Households with Broadband Access
        1. What the index means (like.. "Educational Equity".. what is it?) Why is this measure part of this index?
        2. How the score was computed. Datasources, and math involved to compute it (score should be fully reproducible from the data source)
        3. Information about how to improve the score. Where should they invest, and how much money does it require to improve the score by 1% - even if it's just a guestimate.
    </div>
</div>
</template>

<script>
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class MeasureInfo extends Vue {
    @Prop({default: null, type: String}) id;
}
</script>

<style scoped>
.measure-info {
    color: #666;
}
h4 {
    opacity: 0.8;
}
</style>
