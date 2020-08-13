<template>
<div class="measure-info">
    <!-- SOC -->
    <div v-if="id == '11'">
        <p>
            The percentage of persons with more than a High School degree.
        </p>
        <slot/> 
        <small>This index was calculated with Codes 391 (Bachelor’s Degree or More) devided by 397 (Less Than a High School Degree) from the ACS Common Items Extract.</small>
    </div>
    <div v-if="id == '12'">
        <p>
            The percentage of the population below the age of 65.
        </p>
        <slot/> 
        <small>
            This index was calculated with Codes 300 (Total Population) and 317 (Population over 65) from the ACS Common Items Extract. 
            Calculation: 1-([317] / [300])
        </small>
    </div>
    <div v-if="id == '13'">
        <p>
            The percentage of households with access to a vehicle for transportation. 
        </p>
        <slot/> 
        <small>
            Codes 304 (Households) and 412 (Households with No Vehicle) from the ACS Common Items Extract are used for this calculation.
            Calculation: 1-([412] / [304])
        </small>
    </div>
    <div v-if="id == '14'">
        <p>
            The percentage of households/units with access to telephone.
        </p>
        <slot/> 
        <small>
            Codes 303 (Housing Units) and 960 (Selected Housing Characteristics: No Telephone Service Available) from the ACS Common Items Extract are used for this calculation.
            Calculation: 1-([960] / [303])
        </small>
    </div>
    <div v-if="id == '15'">
        <p>
            The percentage of English-speaking population.
        </p>
        <slot/> 
        <small>
            Codes 770 (Language Spoken at Home: Population with age 5 and above) and 771 (Language Spoken at Home: Population with age 5 and above: English Only) from the ACS Common Items Extract are used for this calculation.
            Calculation: [771] / [770]
        </small>
    </div>
    <div v-if="id == '16'">
        <p>
            The percentage of population without a disability.
        </p>
        <slot/> 
        <small>
            Codes 300 (Total Population) and 413 (Population with Disability) from the ACS Common Items Extract are used for this calculation.
            Calculation: 1-([413] / [300])
        </small>
    </div>
    <div v-if="id == '17'">
        <p>
            The percentage of population with health insurance.
        </p>
        <slot/> 
        <small>
            Codes 933 (HEALTH INSURANCE COVERAGE: Civilian noninstitutionalized population 18 to 64 years) and 936 (HEALTH INSURANCE COVERAGE: Civilian noninstitutionalized population 18 to 64 years: In Labor Force: Employed: With Coverage) and 941 (HEALTH INSURANCE COVERAGE: Civilian noninstitutionalized population 18 to 64 years: In Labor Force: Unemployed: With Coverage) and 946 (HEALTH INSURANCE COVERAGE: Civilian noninstitutionalized population 18 to 64 years: Not In Labor Force: With Coverage) from the ACS Common Items Extract are used for this calculation.
            Calculation: ( [936] + [941] + [946] ) / [933]
        </small>
    </div>

    <!-- ECON -->

    <div v-if="id == '21'">
        <p>
            The percentage of owned or mortgaged housing units.
        </p>
        <slot/> 
        <small>
            Codes 303 (Housing Units) and 965 (SELECTED HOUSING CHARACTERISTICS: Mortgage Status: Owner Occupied Units with a Mortgage) and 966 (SELECTED HOUSING CHARACTERISTICS: Mortgage Status: Owner Occupied Units without a Mortgage) from the ACS Common Items Extract are used for this calculation.
            Calculation: ([965] + [966])/[303]
        </small>
    </div>
    <div v-if="id == '22'">
        <p>
            The percentage of the population in the workforce.
        </p>
        <slot/> 
        <small>
        Codes 300 (Total Population) and 341 (Employment 16 and Over) from the ACS Common Items Extract are used for this calculation.
        Calculation: [341] / [300]
        </small>
    </div>
    <div v-if="id == '23'">
        <p>
            The percentage of the disparity in income according to the GINI coeffecient.
        </p>
        <slot/> 
        <small>
        Table B19083: GINI Index of Income Inequality from the ACS is used for this calculation.
        Calculation: 1-[GINI]
        </small>
    </div>
    <div v-if="id == '24'">
        <p>
            The percentage of the population employed in single sector workforce.
        </p>
        <slot/> 
        <small>
        Code 300 (Total Population) from the ACS Common Items Extract and employment numbers from the Census County Business Patterns (NAICS Codes 11 and 21) are used for this calculation.
        Calculation: ([NAICS 11] + [NAICS 21]) / [300]
        </small>
    </div>
    <div v-if="id == '25'">
        <p>
            The percentage of female participation in the workforce.
        </p>
        <slot/> 
        <small>
        Lines 88 (SEX BY AGE BY EMPLOYMENT STATUS FOR THE POPULATION 16 YEARS AND OVER: Female) and 90, 97, 104, 111,118, 125, 132, 139, 146, 153, 160, 165, 170 (Female, Employed, by age bracket) from the ACS Table B23001 are used for this calculation.
        Calculation: [All but 88] / [88]
        </small>
    </div>
    <div v-if="id == '26'">
        <p>
            The percentage of large businesses in the area.
        </p>
        <slot/> 
        <small>
        Census County Business Patterns employment by business size was used for this calculation. A broad definition of small business defined by less than 500 employees was used.  
        Calculation: 1 - (Business&lt;500 / TotalBusinesses)
        </small>
    </div>
    <div v-if="id == '27'">
        <p>
            The percentage of relative number of physicians per capita.
        </p>
        <slot/> 
        <small>
        Code 300 (Total Population) from the ACS Common Items Extract and employment numbers for professions for physicians (NAICS codes between 291011 AND 291067) were used in this calculation.
        Calculation: [Employed in NAICS Codes] / [300]
        </small>
    </div>

    <!-- INST -->
    <div v-if="id == '31'">
        <p>
        TODO - describe Mitigation - Hazard Mitigation Plan Coverage
        </p>
        <slot/> 
        <small>
        1. What the index means (like.. "Educational Equity".. what is it?) Why is this measure part of this index?
        2. How the score was computed. Datasources, and math involved to compute it (score should be fully reproducible from the data source)
        3. Information about how to improve the score. Where should they invest, and how much money does it require to improve the score by 1% - even if it's just a guestimate.
        </small>
    </div>
    <div v-if="id == '32'">
        <p>
        TODO - describe Floor Coverage
        </p>
        <slot/> 
        <small>
        1. What the index means (like.. "Educational Equity".. what is it?) Why is this measure part of this index?
        2. How the score was computed. Datasources, and math involved to compute it (score should be fully reproducible from the data source)
        3. Information about how to improve the score. Where should they invest, and how much money does it require to improve the score by 1% - even if it's just a guestimate.
        </small>
    </div>
    <div v-if="id == '33'">
        <p>
        TODO - describe Municipal Services
        </p>
        <slot/> 
        <small>
        1. What the index means (like.. "Educational Equity".. what is it?) Why is this measure part of this index?
        2. How the score was computed. Datasources, and math involved to compute it (score should be fully reproducible from the data source)
        3. Information about how to improve the score. Where should they invest, and how much money does it require to improve the score by 1% - even if it's just a guestimate.
        </small>
    </div>
    <div v-if="id == '34'">
        <p>
        TODO - describe CRS Flood
        </p>
        <slot/> 
        <small>
        1. What the index means (like.. "Educational Equity".. what is it?) Why is this measure part of this index?
        2. How the score was computed. Datasources, and math involved to compute it (score should be fully reproducible from the data source)
        3. Information about how to improve the score. Where should they invest, and how much money does it require to improve the score by 1% - even if it's just a guestimate.
        </small>
    </div>
    <div v-if="id == '35'">
        <p>
        TODO - describe Political Fragmentation
        </p>
        <slot/> 
        <small>
        1. What the index means (like.. "Educational Equity".. what is it?)  Why is this measure part of this index?
        2. How the score was computed. Datasources, and math involved to compute it (score should be fully reproducible from the data source)
        3. Information about how to improve the score. Where should they invest, and how much money does it require to improve the score by 1% - even if it's just a guestimate.
        </small>
    </div>
    <div v-if="id == '36'">
        <p>
        TODO - describe Previous Disaster Experience
        </p>
        <slot/> 
        <small>
        1. What the index means (like.. "Educational Equity".. what is it?) Why is this measure part of this index?
        2. How the score was computed. Datasources, and math involved to compute it (score should be fully reproducible from the data source)
        3. Information about how to improve the score. Where should they invest, and how much money does it require to improve the score by 1% - even if it's just a guestimate.
        </small>
    </div>
    <div v-if="id == '37'">
        <p>
        TODO - describe Mitigation and Social Connectivity
        </p>
        <slot/> 
        <small>
        1. What the index means (like.. "Educational Equity".. what is it?) Why is this measure part of this index?
        2. How the score was computed. Datasources, and math involved to compute it (score should be fully reproducible from the data source)
        3. Information about how to improve the score. Where should they invest, and how much money does it require to improve the score by 1% - even if it's just a guestimate.
        </small>
    </div>
    <div v-if="id == '38'">
        <p>
        TODO - describe Storm Ready Communities
        </p>
        <slot/> 
        <small>
        1. What the index means (like.. "Educational Equity".. what is it?) Why is this measure part of this index?
        2. How the score was computed. Datasources, and math involved to compute it (score should be fully reproducible from the data source)
        3. Information about how to improve the score. Where should they invest, and how much money does it require to improve the score by 1% - even if it's just a guestimate.
        </small>
    </div>

    <!-- IHFR -->

    <div v-if="id == '41'">
        <p>
        The percentage of non-mobile homes.
        </p>
        <slot/> 
        <small>
        Table B25001 Line 1 (Total Housing Units) and Table B25025 Line 10 (Mobile home) from the ACS were used in this calculation.
        Calculation: 1-([B25025] / [B25001])
        </small>
    </div>
    <div v-if="id == '42'">
        <p>
        The percentage of unoccupied rental units in an area.
        </p>
        <slot/> 
        <small>
        Table B25004 Line 1 (Total), Line 2 (For rent), and Line 3 (Rented, not occupied) from the ACS were used for this calculation.
        Calculation: ([Line 2] + [Line 3]) / [Line 1]
        </small>
    </div>
    <div v-if="id == '43'">
        <p>
        The percentage of hospital beds per capita.
        </p>
        <slot/> 
        <small>
        This uses data on hospitals from Centers for Medicare and Medicaid Services (CMS) and is the number of beds per population.
        Calculation: [Beds] / [Population]
        </small>
    </div>
    <div v-if="id == '44'">
        <p>
        The number of miles of arterial highway per square mile. 
        </p>
        <slot/> 
        <small>
        This uses data from the National Highway Planning Network for the number of miles of arterial highway in each county and county size in square miles from the Census.
        Calculation: [Highway Miles] / [County Square Miles]
        </small>
    </div>
    <div v-if="id == '45'">
        <p>
        The percentage of housing units built between 1970 and 1989.
        </p>
        <slot/> 
        <small>
        Table B25001 Line 1 (Total Hosing Units), Table B25034 Line 5 (Year Structure Built: 1980 to 1989), and Table B25034 Line 6 (Year Structure Built: 1970 to 1979) from the ACS were used for this calculation.
        Calculation: ([Line 5] + [Line 6]) / [Line 1]
        </small>
    </div>
    <div v-if="id == '46'">
        <p>
        The number of hotels and motels per square mile.
        </p>
        <slot/> 
        <small>
        Uses NAICS Code 721110 (Hotels except Casino Hotels and Motels) from the Census County Business Patterns and the total square miles from the 2000 Census.
        Calculation: [NAICS 721110] / [Square Miles]
        </small>
    </div>
    <div v-if="id == '47'">
        <p>
        The number of elementary and secondary schools per square mile.
        </p>
        <slot/> 
        <small>
        Uses NAICS Code 611110 (Elementary and Secondary Schools) from the Census County Business Patterns and the total square miles from the 2000 Census.
        Calculation: [NAICS 611110] / [Square Miles]
        </small>
    </div>

    <!-- COMM -->
    
    <div v-if="id == '51'">
        <p>
        The percentage of the population that is not foreign-born.
        </p>
        <slot/> 
        <small>
        Codes 300 (Total Population) and 763 (Foreign Born Population, excluding population born at sea) from the ACS Common Items Extract are used for this calculation.
        Calculation: 1-([763] / [300])
        </small>
    </div>
    <div v-if="id == '52'">
        <p>
        The percentage of the population that resides in the same state of birth.
        </p>
        <slot/> 
        <small>
        Codes 747 (Total Birth Population) and 750 (Total Birth Population: Native: Born in same US state as of their residence) from the ACS Common Items Extract are used for this calculation.
        Calculation: [750] / [747]
        </small>
    </div>
    <div v-if="id == '53'">
        <p>
        The percentage of population that voted.
        </p>
        <slot/> 
        <small>
        Code 300 (Total Population) from the ACS Common Items Extract and voter turnout data from StatsAmerica were used for this calculation.
        Calculation: [Voters] / [300]
        </small>
    </div>
    <div v-if="id == '54'">
        <p>
        The number of religious organizations per capita.
        </p>
        <slot/> 
        <small>
        Code 300 (Total Population) from the ACS Common Items Extract and total establishments under NAICS Code 813110 (Religious Organizations) from the Census County Business Patterns were used for this calculation.
        Calculation: [NAICS 813110] / [300]
        </small>
    </div>
    <div v-if="id == '55'">
        <p>
        The number of civic organizations per capita.
        </p>
        <slot/> 
        <small>
        Code 300 (Total Population) from the ACS Common Items Extract and total establishments under NAICS Code 8134 (Civic Organizations) from the Census County Business Patterns were used for this calculation.
        Calculation: [NAICS 8134] / [300]
        </small>
    </div>
    <div v-if="id == '56'">
        <p>
        Number of social advocacy organizations per capita.
        </p>
        <slot/> 
        <small>
        Code 300 (Total Population) from the ACS Common Items Extract and total establishments under NAICS Code 8133 (Social Advocacy Organizations) from the Census County Business Patterns were used for this calculation.
        Calculation: [NAICS 8133] / [300]
        </small>
    </div>
    <div v-if="id == '57'">
        <p>
        The percentage of the population employed in a creative class occupation.
        </p>
        <slot/> 
        <small>
        Code 300 (Total Population) from the ACS Common Items Extract and employment numbers for those employed in creative class occupations (NAICS codes in the creative class occupations) were used in this calculation.
        Calculation: [Employed in NAICS Codes] / [300]
        </small>
    </div>

    <!-- FLOR -->
    <div v-if="id == '101'">
        <p>
        TODO - describe Business Vulnerability
        </p>
        <slot/> 
        <small>
        1. What the index means (like.. "Educational Equity".. what is it?) Why is this measure part of this index?
        2. How the score was computed. Datasources, and math involved to compute it (score should be fully reproducible from the data source)
        3. Information about how to improve the score. Where should they invest, and how much money does it require to improve the score by 1% - even if it's just a guestimate.
        </small>
    </div>
    <div v-if="id == '102'">
        <p>
        TODO - describe Flood Zone
        </p>
        <slot/> 
        <small>
        1. What the index means (like.. "Educational Equity".. what is it?) Why is this measure part of this index?
        2. How the score was computed. Datasources, and math involved to compute it (score should be fully reproducible from the data source)
        3. Information about how to improve the score. Where should they invest, and how much money does it require to improve the score by 1% - even if it's just a guestimate.
        </small>
    </div>
    <div v-if="id == '103'">
        <p>
        TODO - describe Commuting
        </p>
        <slot/> 
        <small>
        1. What the index means (like.. "Educational Equity".. what is it?) Why is this measure part of this index?
        2. How the score was computed. Datasources, and math involved to compute it (score should be fully reproducible from the data source)
        3. Information about how to improve the score. Where should they invest, and how much money does it require to improve the score by 1% - even if it's just a guestimate.
        </small>
    </div>
    <div v-if="id == '104'">
        <p>
        TODO - describe Housing Construction
        </p>
        <slot/> 
        <small>
        1. What the index means (like.. "Educational Equity".. what is it?) Why is this measure part of this index?
        2. How the score was computed. Datasources, and math involved to compute it (score should be fully reproducible from the data source)
        3. Information about how to improve the score. Where should they invest, and how much money does it require to improve the score by 1% - even if it's just a guestimate.
        </small>
    </div>
    <div v-if="id == '105'">
        <p>
        TODO - describe Second Stage Business
        </p>
        <slot/> 
        <small>
        1. What the index means (like.. "Educational Equity".. what is it?) Why is this measure part of this index?
        2. How the score was computed. Datasources, and math involved to compute it (score should be fully reproducible from the data source)
        3. Information about how to improve the score. Where should they invest, and how much money does it require to improve the score by 1% - even if it's just a guestimate.
        </small>
    </div>
    <div v-if="id == '106'">
        <p>
        TODO - describe Households with Broadband Access
        </p>
        <slot/> 
        <small>
        1. What the index means (like.. "Educational Equity".. what is it?) Why is this measure part of this index?
        2. How the score was computed. Datasources, and math involved to compute it (score should be fully reproducible from the data source)
        3. Information about how to improve the score. Where should they invest, and how much money does it require to improve the score by 1% - even if it's just a guestimate.
        </small>
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
line-height: 150%;
font-size: 90%;
}
h4 {
opacity: 0.8;
}
p {
margin: 0;
}
</style>
