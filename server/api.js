const { query, pool } = require('./db');

const getMapStatusData = async () => {
  const sql = `
    SELECT 
      ostantitle,
      COUNT(CASE WHEN adam_paziresh THEN 1 END) AS bonyad_maskan,
      COUNT(CASE WHEN niazmande_eslah THEN 1 END) AS sayer_manabe,
      COUNT(CASE WHEN arseh_ayan THEN 1 END) AS tarsim,
      COUNT(*) AS total
    FROM 
      public.locations1
    GROUP BY 
      ostantitle
    ORDER BY 
      ostantitle;
  `;
  return await query(sql);
};

const getUpdateStatusData = async () => {
  const sql = `SELECT 
      ostantitle,
      COUNT(CASE WHEN amaliate_meydani THEN 1 END) AS amaliate_meydani,
      COUNT(CASE WHEN dadeh_amaei THEN 1 END) AS dadeh_amaei,
      COUNT(CASE WHEN eslah_naghsheh THEN 1 END) AS eslah_naghsheh,
      COUNT(*) AS total
    FROM 
      public.locations1
    GROUP BY 
      ostantitle
    ORDER BY 
      ostantitle;`;
  return await query(sql);
};

const getGeocodeStatusData = async () => {
  const sql = `SELECT 
      ostantitle,
      COUNT(CASE WHEN eslah_naghsheh THEN 1 END) AS eslah_naghsheh,
      COUNT(CASE WHEN tayid_va_bargozari THEN 1 END) AS tayid_va_bargozari,
      COUNT(CASE WHEN daryafte_naghsheh THEN 1 END) AS daryafte_naghsheh,
      COUNT(*) AS total
    FROM 
      public.locations1
    GROUP BY 
      ostantitle
    ORDER BY 
      ostantitle;`;
  return await query(sql);
};

const getPlateStatusData = async () => {
  const sql = `SELECT 
      ostantitle,
      COUNT(CASE WHEN tolid_qr THEN 1 END) AS tolid_qr,
      COUNT(CASE WHEN pelak_talfighi THEN 1 END) AS pelak_talfighi,
      COUNT(*) AS total
    FROM 
      public.locations1
    GROUP BY 
      ostantitle
    ORDER BY 
      ostantitle;`;
  return await query(sql);
};

const getPieMap = async () => {
  const sql = `SELECT
    SUM(CASE WHEN adam_paziresh THEN 1 ELSE 0 END) AS bonyad_maskan,
    SUM(CASE WHEN arseh_ayan THEN 1 ELSE 0 END) AS tarsim,
    SUM(CASE WHEN niazmande_eslah THEN 1 ELSE 0 END) AS sayer_manabe,
    COUNT(*) - SUM(CASE WHEN adam_paziresh THEN 1 ELSE 0 END) - 
               SUM(CASE WHEN arseh_ayan THEN 1 ELSE 0 END) - 
               SUM(CASE WHEN niazmande_eslah THEN 1 ELSE 0 END) AS remaining_count
FROM public.locations1;`;
  return await query(sql);
};
// Function to construct and execute the SQL query
const getQueryData = async (selectedItems) => {
    let whereCondition = '';

    // Add WHERE condition if selectedItems is provided
    if (selectedItems && selectedItems.length > 0) {
        const formattedItems = selectedItems.map(item => `'${item}'`).join(', ');
        whereCondition = `AND ostantitle IN (${formattedItems})`;
    }

    const sql = `SELECT 
    ostantitle, 
    shahrestantitle, 
    zonetitle, 
    dehestantitle, 
    locationname, 
    population_point_id, 
    adam_paziresh AS bonyad_maskan, 
    niazmande_eslah AS sayer_manabe,
    arseh_ayan AS tarsim, 
    amaliate_meydani, 
    dadeh_amaei, 
    eslah_naghsheh, 
    daryafte_naghsheh AS geocode, 
    pdf, 
    ersal_setad,
    date,
    tedad_geocode_makan,
    tedad_makan_jadid,
    tedad_sakhteman,
    tedad_makan,
    tedad_geosakhteman,
    tayid_va_bargozari,
    (COALESCE(NULLIF(tedad_parcel, '')::integer, 0) + COALESCE(NULLIF(tedad_parcel_tarsimi, '')::integer, 0)) AS total_parcels
FROM 
    public.locations1
WHERE 
    ((adam_paziresh = true
    OR niazmande_eslah = true 
    OR arseh_ayan = true) 
    OR amaliate_meydani = true 
    OR dadeh_amaei = true 
    OR eslah_naghsheh = true 
    OR daryafte_naghsheh = true
    OR pdf = true 
    OR ersal_setad = true)
    ${whereCondition}
ORDER BY 
    ostantitle, 
    shahrestantitle, 
    zonetitle, 
    dehestantitle, 
    locationname;`;

    return await query(sql); // Execute the query and return the results
};
const getNationalIDStatusData = async () => {
  const sql = `SELECT 
      ostantitle,
      COUNT(shenaseh_melli) AS shenaseh_melli,
      COUNT(*) AS total
    FROM 
      public.locations1
    GROUP BY 
      ostantitle
    ORDER BY 
      ostantitle;`;
  return await query(sql);
};

const getLocationsData = async () => {
  const sql = `SELECT
    1 AS row_number,
    'ایران' AS locname,
    (
        SELECT SUM(CASE WHEN l1.tedad_makan ~ '^[0-9]+$' THEN l1.tedad_makan::INTEGER ELSE 0 END)
        FROM public.locations1 l1
    ) AS total_record_count,
    COUNT(*) AS total_count,
    SUM(CASE WHEN adam_paziresh THEN 1 ELSE 0 END) AS Bonyad_Maskan_count,
    SUM(CASE WHEN niazmande_eslah THEN 1 ELSE 0 END) AS Sayer_Manabe_count,
    SUM(CASE WHEN arseh_ayan THEN 1 ELSE 0 END) AS Tarsim_count,
    SUM(CASE WHEN adam_paziresh THEN 1 ELSE 0 END) + SUM(CASE WHEN niazmande_eslah THEN 1 ELSE 0 END) + SUM(CASE WHEN arseh_ayan THEN 1 ELSE 0 END) AS total_naghsheh_count,
    SUM(CASE WHEN tedad_parcel ~ '^[0-9]+$' THEN tedad_parcel::INTEGER ELSE 0 END) +
    SUM(CASE WHEN tedad_parcel_tarsimi ~ '^[0-9]+$' THEN tedad_parcel_tarsimi::INTEGER ELSE 0 END) AS total_parcel_count,
    SUM(CASE WHEN amaliate_meydani THEN 1 ELSE 0 END) AS amaliate_meydani_count,
    SUM(CASE WHEN tedad_makan ~ '^[0-9]+$' AND amaliate_meydani = true THEN tedad_makan::INTEGER ELSE 0 END) AS Record_Count,
    SUM(CASE WHEN tedad_makan_jadid ~ '^[0-9]+$' AND amaliate_meydani THEN tedad_makan_jadid::INTEGER ELSE 0 END) AS Makan_Count,
    SUM(CASE WHEN tedad_sakhteman ~ '^[0-9]+$' AND amaliate_meydani = true THEN tedad_sakhteman::INTEGER ELSE 0 END) AS Building_Count,
    SUM(CASE WHEN dadeh_amaei THEN 1 ELSE 0 END) AS dadeh_amaei_count,
    SUM(CASE WHEN eslah_naghsheh THEN 1 ELSE 0 END) AS eslah_naghsheh_count,
    SUM(CASE WHEN tayid_va_bargozari THEN 1 ELSE 0 END) AS tayid_va_bargozari_count,
    SUM(CASE WHEN daryafte_naghsheh THEN 1 ELSE 0 END) AS GeoCode_count,
    SUM(CASE WHEN tedad_geocode_makan ~ '^[0-9]+$' AND amaliate_meydani = true THEN tedad_geocode_makan::INTEGER ELSE 0 END) AS Geocode_Makan_Count,
    SUM(CASE WHEN tedad_geosakhteman ~ '^[0-9]+$' AND amaliate_meydani = true THEN tedad_geosakhteman::INTEGER ELSE 0 END) AS Geocode_Building_Count,
    SUM(CASE WHEN pdf THEN 1 ELSE 0 END) AS Mokhtasat_Roosta_count,
    SUM(CASE WHEN ersal_setad THEN 1 ELSE 0 END) AS Mahdoudeh_Roosta_count
FROM 
    public.locations1 l2;`;
  return await query(sql);
};

const getDetailedLocationsData = async () => {
  const sql = `SELECT
    ROW_NUMBER() OVER (ORDER BY ostantitle) AS row_number,
    ostantitle AS locname,
    COUNT(*) AS total_count,
    (
        SELECT SUM(CASE WHEN l1.tedad_makan ~ '^[0-9]+$' THEN l1.tedad_makan::INTEGER ELSE 0 END)
        FROM public.locations1 l1
        WHERE l1.ostantitle = l2.ostantitle
    ) AS total_record_count,
    SUM(CASE WHEN adam_paziresh THEN 1 ELSE 0 END) AS Bonyad_Maskan_count,
    SUM(CASE WHEN niazmande_eslah THEN 1 ELSE 0 END) AS Sayer_Manabe_count,
    SUM(CASE WHEN arseh_ayan THEN 1 ELSE 0 END) AS Tarsim_count,
    SUM(CASE WHEN adam_paziresh THEN 1 ELSE 0 END) + SUM(CASE WHEN niazmande_eslah THEN 1 ELSE 0 END) + SUM(CASE WHEN arseh_ayan THEN 1 ELSE 0 END) AS total_naghsheh_count,
    SUM(CASE WHEN tedad_parcel ~ '^[0-9]+$' THEN tedad_parcel::INTEGER ELSE 0 END) +
    SUM(CASE WHEN tedad_parcel_tarsimi ~ '^[0-9]+$' THEN tedad_parcel_tarsimi::INTEGER ELSE 0 END) AS total_parcel_count,
    SUM(CASE WHEN amaliate_meydani THEN 1 ELSE 0 END) AS amaliate_meydani_count,
    SUM(CASE WHEN tedad_makan ~ '^[0-9]+$' AND amaliate_meydani = true THEN tedad_makan::INTEGER ELSE 0 END) AS Record_Count,
    SUM(CASE WHEN tedad_makan_jadid ~ '^[0-9]+$' AND amaliate_meydani THEN tedad_makan_jadid::INTEGER ELSE 0 END) AS Makan_Count,
    SUM(CASE WHEN tedad_sakhteman ~ '^[0-9]+$' AND amaliate_meydani = true THEN tedad_sakhteman::INTEGER ELSE 0 END) AS Building_Count,
    SUM(CASE WHEN dadeh_amaei THEN 1 ELSE 0 END) AS dadeh_amaei_count,
    SUM(CASE WHEN eslah_naghsheh THEN 1 ELSE 0 END) AS eslah_naghsheh_count,
    SUM(CASE WHEN tayid_va_bargozari THEN 1 ELSE 0 END) AS tayid_va_bargozari_count,
    SUM(CASE WHEN daryafte_naghsheh THEN 1 ELSE 0 END) AS GeoCode_count,
    SUM(CASE WHEN tedad_geocode_makan ~ '^[0-9]+$' AND amaliate_meydani = true THEN tedad_geocode_makan::INTEGER ELSE 0 END) AS Geocode_Makan_Count,
    SUM(CASE WHEN tedad_geosakhteman ~ '^[0-9]+$' AND amaliate_meydani = true THEN tedad_geosakhteman::INTEGER ELSE 0 END) AS Geocode_Building_Count,
    SUM(CASE WHEN pdf THEN 1 ELSE 0 END) AS Mokhtasat_Roosta_count,
    SUM(CASE WHEN ersal_setad THEN 1 ELSE 0 END) AS Mahdoudeh_Roosta_count
FROM 
    public.locations1 l2
GROUP BY 
    ostantitle
ORDER BY 
    ostantitle;`;
  return await query(sql);
};
const getShahrestanData = async (ostantitle) => {
  const sql = `SELECT
    ROW_NUMBER() OVER (ORDER BY shahrestantitle) AS row_number,
    shahrestantitle AS locname,
    (
        SELECT SUM(CASE WHEN l1.tedad_makan ~ '^[0-9]+$' THEN l1.tedad_makan::INTEGER ELSE 0 END)
        FROM public.locations1 l1
        WHERE l1.shahrestantitle = l2.shahrestantitle AND ostantitle = $1
    ) AS total_record_count,
    COUNT(*) AS total_count,
    SUM(CASE WHEN adam_paziresh THEN 1 ELSE 0 END) AS Bonyad_Maskan_count,
    SUM(CASE WHEN niazmande_eslah THEN 1 ELSE 0 END) AS Sayer_Manabe_count,
    SUM(CASE WHEN arseh_ayan THEN 1 ELSE 0 END) AS Tarsim_count,
    SUM(CASE WHEN adam_paziresh THEN 1 ELSE 0 END) + SUM(CASE WHEN niazmande_eslah THEN 1 ELSE 0 END) + SUM(CASE WHEN arseh_ayan THEN 1 ELSE 0 END) AS total_naghsheh_count,
    SUM(CASE WHEN tedad_parcel ~ '^[0-9]+$' THEN tedad_parcel::INTEGER ELSE 0 END) +
    SUM(CASE WHEN tedad_parcel_tarsimi ~ '^[0-9]+$' THEN tedad_parcel_tarsimi::INTEGER ELSE 0 END) AS total_parcel_count,
    SUM(CASE WHEN amaliate_meydani THEN 1 ELSE 0 END) AS amaliate_meydani_count,
    SUM(CASE WHEN tedad_makan ~ '^[0-9]+$' AND amaliate_meydani = true THEN tedad_makan::INTEGER ELSE 0 END) AS Record_Count,
    SUM(CASE WHEN tedad_makan_jadid ~ '^[0-9]+$' AND amaliate_meydani THEN tedad_makan_jadid::INTEGER ELSE 0 END) AS Makan_Count,
    SUM(CASE WHEN tedad_sakhteman ~ '^[0-9]+$' AND amaliate_meydani = true THEN tedad_sakhteman::INTEGER ELSE 0 END) AS Building_Count,
    SUM(CASE WHEN dadeh_amaei THEN 1 ELSE 0 END) AS dadeh_amaei_count,
    SUM(CASE WHEN eslah_naghsheh THEN 1 ELSE 0 END) AS eslah_naghsheh_count,
    SUM(CASE WHEN tayid_va_bargozari THEN 1 ELSE 0 END) AS tayid_va_bargozari_count,
    SUM(CASE WHEN daryafte_naghsheh THEN 1 ELSE 0 END) AS GeoCode_count,
    SUM(CASE WHEN tedad_geocode_makan ~ '^[0-9]+$' AND amaliate_meydani = true THEN tedad_geocode_makan::INTEGER ELSE 0 END) AS Geocode_Makan_Count,
    SUM(CASE WHEN tedad_geosakhteman ~ '^[0-9]+$' AND amaliate_meydani = true THEN tedad_geosakhteman::INTEGER ELSE 0 END) AS Geocode_Building_Count,
    SUM(CASE WHEN pdf THEN 1 ELSE 0 END) AS Mokhtasat_Roosta_count,
    SUM(CASE WHEN ersal_setad THEN 1 ELSE 0 END) AS Mahdoudeh_Roosta_count
FROM
    public.locations1 l2
WHERE
    ostantitle = $1
GROUP BY
    shahrestantitle
ORDER BY
    shahrestantitle;;
    `;
  return await query(sql, [ostantitle]);
};
const getZoneData = async (ostantitle, shahrestantitle) => {
  const sql = `SELECT
    ROW_NUMBER() OVER (ORDER BY zonetitle) AS row_number,
    zonetitle AS locname,
    (
        SELECT SUM(CASE WHEN l1.tedad_makan ~ '^[0-9]+$' THEN l1.tedad_makan::INTEGER ELSE 0 END)
        FROM public.locations1 l1
        WHERE l1.zonetitle = l2.zonetitle AND ostantitle = $1 AND shahrestantitle = $2
    ) AS total_record_count,
    COUNT(*) AS total_count,
    SUM(CASE WHEN adam_paziresh THEN 1 ELSE 0 END) AS Bonyad_Maskan_count,
    SUM(CASE WHEN niazmande_eslah THEN 1 ELSE 0 END) AS Sayer_Manabe_count,
    SUM(CASE WHEN arseh_ayan THEN 1 ELSE 0 END) AS Tarsim_count,
    SUM(CASE WHEN adam_paziresh THEN 1 ELSE 0 END) + SUM(CASE WHEN niazmande_eslah THEN 1 ELSE 0 END) + SUM(CASE WHEN arseh_ayan THEN 1 ELSE 0 END) AS total_naghsheh_count,
    SUM(CASE WHEN tedad_parcel ~ '^[0-9]+$' THEN tedad_parcel::INTEGER ELSE 0 END) +
    SUM(CASE WHEN tedad_parcel_tarsimi ~ '^[0-9]+$' THEN tedad_parcel_tarsimi::INTEGER ELSE 0 END) AS total_parcel_count,
    SUM(CASE WHEN amaliate_meydani THEN 1 ELSE 0 END) AS amaliate_meydani_count,
    SUM(CASE WHEN tedad_makan ~ '^[0-9]+$' AND amaliate_meydani = true THEN tedad_makan::INTEGER ELSE 0 END) AS Record_Count,
    SUM(CASE WHEN tedad_makan_jadid ~ '^[0-9]+$' AND amaliate_meydani THEN tedad_makan_jadid::INTEGER ELSE 0 END) AS Makan_Count,
    SUM(CASE WHEN tedad_sakhteman ~ '^[0-9]+$' AND amaliate_meydani = true THEN tedad_sakhteman::INTEGER ELSE 0 END) AS Building_Count,
    SUM(CASE WHEN dadeh_amaei THEN 1 ELSE 0 END) AS dadeh_amaei_count,
    SUM(CASE WHEN eslah_naghsheh THEN 1 ELSE 0 END) AS eslah_naghsheh_count,
    SUM(CASE WHEN tayid_va_bargozari THEN 1 ELSE 0 END) AS tayid_va_bargozari_count,
    SUM(CASE WHEN daryafte_naghsheh THEN 1 ELSE 0 END) AS GeoCode_count,
    SUM(CASE WHEN tedad_geocode_makan ~ '^[0-9]+$' AND amaliate_meydani = true THEN tedad_geocode_makan::INTEGER ELSE 0 END) AS Geocode_Makan_Count,
    SUM(CASE WHEN tedad_geosakhteman ~ '^[0-9]+$' AND amaliate_meydani = true THEN tedad_geosakhteman::INTEGER ELSE 0 END) AS Geocode_Building_Count,
    SUM(CASE WHEN pdf THEN 1 ELSE 0 END) AS Mokhtasat_Roosta_count,
    SUM(CASE WHEN ersal_setad THEN 1 ELSE 0 END) AS Mahdoudeh_Roosta_count
FROM 
    public.locations1 l2
WHERE 
    ostantitle = $1 AND shahrestantitle = $2
GROUP BY 
    zonetitle
ORDER BY 
    zonetitle;`;
  return await query(sql, [ostantitle, shahrestantitle]);
};
const getDehestanData = async (ostantitle, shahrestantitle, zonetitle) => {
  const sql = `SELECT
    ROW_NUMBER() OVER (ORDER BY dehestantitle) AS row_number,
    dehestantitle AS locname,
    (
        SELECT SUM(CASE WHEN l1.tedad_makan ~ '^[0-9]+$' THEN l1.tedad_makan::INTEGER ELSE 0 END)
        FROM public.locations1 l1
        WHERE l1.dehestantitle = l2.dehestantitle AND ostantitle = $1 AND shahrestantitle = $2 AND zonetitle = $3
    ) AS total_record_count,
    COUNT(*) AS total_count,
    SUM(CASE WHEN adam_paziresh THEN 1 ELSE 0 END) AS Bonyad_Maskan_count,
    SUM(CASE WHEN niazmande_eslah THEN 1 ELSE 0 END) AS Sayer_Manabe_count,
    SUM(CASE WHEN arseh_ayan THEN 1 ELSE 0 END) AS Tarsim_count,
    SUM(CASE WHEN adam_paziresh THEN 1 ELSE 0 END) + SUM(CASE WHEN niazmande_eslah THEN 1 ELSE 0 END) + SUM(CASE WHEN arseh_ayan THEN 1 ELSE 0 END) AS total_naghsheh_count,
    SUM(CASE WHEN tedad_parcel ~ '^[0-9]+$' THEN tedad_parcel::INTEGER ELSE 0 END) +
    SUM(CASE WHEN tedad_parcel_tarsimi ~ '^[0-9]+$' THEN tedad_parcel_tarsimi::INTEGER ELSE 0 END) AS total_parcel_count,
    SUM(CASE WHEN amaliate_meydani THEN 1 ELSE 0 END) AS amaliate_meydani_count,
    SUM(CASE WHEN tedad_makan ~ '^[0-9]+$' AND amaliate_meydani = true THEN tedad_makan::INTEGER ELSE 0 END) AS Record_Count,
    SUM(CASE WHEN tedad_makan_jadid ~ '^[0-9]+$' AND amaliate_meydani THEN tedad_makan_jadid::INTEGER ELSE 0 END) AS Makan_Count,
    SUM(CASE WHEN tedad_sakhteman ~ '^[0-9]+$' AND amaliate_meydani = true THEN tedad_sakhteman::INTEGER ELSE 0 END) AS Building_Count,
    SUM(CASE WHEN dadeh_amaei THEN 1 ELSE 0 END) AS dadeh_amaei_count,
    SUM(CASE WHEN eslah_naghsheh THEN 1 ELSE 0 END) AS eslah_naghsheh_count,
    SUM(CASE WHEN tayid_va_bargozari THEN 1 ELSE 0 END) AS tayid_va_bargozari_count,
    SUM(CASE WHEN daryafte_naghsheh THEN 1 ELSE 0 END) AS GeoCode_count,
    SUM(CASE WHEN tedad_geocode_makan ~ '^[0-9]+$' AND amaliate_meydani = true THEN tedad_geocode_makan::INTEGER ELSE 0 END) AS Geocode_Makan_Count,
    SUM(CASE WHEN tedad_geosakhteman ~ '^[0-9]+$' AND amaliate_meydani = true THEN tedad_geosakhteman::INTEGER ELSE 0 END) AS Geocode_Building_Count,
    SUM(CASE WHEN pdf THEN 1 ELSE 0 END) AS Mokhtasat_Roosta_count,
    SUM(CASE WHEN ersal_setad THEN 1 ELSE 0 END) AS Mahdoudeh_Roosta_count
FROM 
    public.locations1 l2
WHERE 
    ostantitle = $1 AND shahrestantitle = $2 AND zonetitle = $3
GROUP BY 
    dehestantitle
ORDER BY 
    dehestantitle;`;
  return await query(sql, [ostantitle, shahrestantitle, zonetitle]);
};
const getRoostaData = async (ostantitle, shahrestantitle, zonetitle, dehestantitle) => {
  const sql = `SELECT ostantitle, shahrestantitle, zonetitle, dehestantitle, locationname, population_point_id, shenaseh_melli, adam_paziresh AS bonyad_maskan
, niazmande_eslah AS sayer_manabe, arseh_ayan AS tarsim, tedad_parcel, amaliate_meydani, dadeh_amaei, eslah_naghsheh, daryafte_naghsheh AS geocode
, adam_tayid, tayid_va_bargozari, pdf AS mokhtasat_rousta, ersal_setad AS mahdoudeh_rousta, tolid_qr, pelak_talfighi FROM public.locations1
WHERE ostantitle = $1 AND shahrestantitle = $2 AND zonetitle = $3 AND dehestantitle = $4;`;
  return await query(sql, [ostantitle, shahrestantitle, zonetitle, dehestantitle]);
};
const getBSCTab1Data = async () => {
  const sql = `WITH bsc_summary AS (
        SELECT
            ostantitle,
            month_calc(12, 1, 1, bsc) AS amalkard,
            month_calc(12, 2, 1, bsc) AS barnameh,
            month_calc(12, 2, 1, bsc) AS total_barnameh,
            amaliat
        FROM public.bsc
        WHERE amaliat = 1
        GROUP BY ostantitle, amaliat, bsc
    )
    -- section1
    , section1_summary AS (
        SELECT
            ostantitle,
            amalkard,
            barnameh - amalkard AS dirkard,
            total_barnameh - amalkard - (barnameh - amalkard) AS barnameh_diff,
            amaliat
        FROM bsc_summary
    )
    -- Calculate totals for section1
    , section1_totals AS (
        SELECT
            'جمع کشوری' AS ostantitle,
            SUM(amalkard) AS amalkard,
            SUM(dirkard) AS dirkard,
            SUM(barnameh_diff) AS barnameh_diff,
            MAX(amaliat) AS amaliat
        FROM section1_summary
    )
    -- Combine results
    (SELECT * FROM section1_totals)
    UNION ALL
    (SELECT * FROM section1_summary ORDER BY ostantitle);`;
  return await query(sql);
};
const getBSCTab2Data = async () => {
  const sql = `WITH bsc_summary AS (
        SELECT
            ostantitle,
            month_calc(12, 1, 2, bsc) AS amalkard,
            month_calc(12, 2, 2, bsc) AS barnameh,
            month_calc(12, 2, 2, bsc) AS total_barnameh,
            amaliat
        FROM public.bsc
        WHERE amaliat = 2
        GROUP BY ostantitle, amaliat, bsc
    )
    -- section1
    , section1_summary AS (
        SELECT
            ostantitle,
            amalkard,
            barnameh - amalkard AS dirkard,
            total_barnameh - amalkard - (barnameh - amalkard) AS barnameh_diff,
            amaliat
        FROM bsc_summary
    )
    -- Calculate totals for section1
    , section1_totals AS (
        SELECT
            'جمع کشوری' AS ostantitle,
            SUM(amalkard) AS amalkard,
            SUM(dirkard) AS dirkard,
            SUM(barnameh_diff) AS barnameh_diff,
            MAX(amaliat) AS amaliat
        FROM section1_summary
    )
    -- Combine results
    (SELECT * FROM section1_totals)
    UNION ALL
    (SELECT * FROM section1_summary ORDER BY ostantitle);`;
  return await query(sql);
};
const getBSCTab3Data = async () => {
  const sql = `WITH bsc_summary AS (
        SELECT
            ostantitle,
            month_calc(12, 1, 3, bsc) AS amalkard,
            month_calc(12, 2, 3, bsc) AS barnameh,
            month_calc(12, 2, 3, bsc) AS total_barnameh,
            amaliat
        FROM public.bsc
        WHERE amaliat = 3
        GROUP BY ostantitle, amaliat, bsc
    )
    -- section1
    , section1_summary AS (
        SELECT
            ostantitle,
            amalkard,
            barnameh - amalkard AS dirkard,
            total_barnameh - amalkard - (barnameh - amalkard) AS barnameh_diff,
            amaliat
        FROM bsc_summary
    )
    -- Calculate totals for section1
    , section1_totals AS (
        SELECT
            'جمع کشوری' AS ostantitle,
            SUM(amalkard) AS amalkard,
            SUM(dirkard) AS dirkard,
            SUM(barnameh_diff) AS barnameh_diff,
            MAX(amaliat) AS amaliat
        FROM section1_summary
    )
    -- Combine results
    (SELECT * FROM section1_totals)
    UNION ALL
    (SELECT * FROM section1_summary ORDER BY ostantitle);`;
  return await query(sql);
};
const getBSCTab4Data = async () => {
  const sql = `WITH bsc_summary AS (
        SELECT
            ostantitle,
            month_calc(12, 1, 4, bsc) AS amalkard,
            month_calc(12, 2, 4, bsc) AS barnameh,
            month_calc(12, 2, 4, bsc) AS total_barnameh,
            amaliat
        FROM public.bsc
        WHERE amaliat = 4
        GROUP BY ostantitle, amaliat, bsc
    )
    -- section1
    , section1_summary AS (
        SELECT
            ostantitle,
            amalkard,
            barnameh - amalkard AS dirkard,
            total_barnameh - amalkard - (barnameh - amalkard) AS barnameh_diff,
            amaliat
        FROM bsc_summary
    )
    -- Calculate totals for section1
    , section1_totals AS (
        SELECT
            'جمع کشوری' AS ostantitle,
            SUM(amalkard) AS amalkard,
            SUM(dirkard) AS dirkard,
            SUM(barnameh_diff) AS barnameh_diff,
            MAX(amaliat) AS amaliat
        FROM section1_summary
    )
    -- Combine results
    (SELECT * FROM section1_totals)
    UNION ALL
    (SELECT * FROM section1_summary ORDER BY ostantitle);`;
  return await query(sql);
};
const getBSCTab5Data = async () => {
  const sql = `WITH bsc_summary AS (
        SELECT
            ostantitle,
            month_calc(12, 1, 5, bsc) AS amalkard,
            month_calc(12, 2, 5, bsc) AS barnameh,
            month_calc(12, 2, 5, bsc) AS total_barnameh,
            amaliat
        FROM public.bsc
        WHERE amaliat = 5
        GROUP BY ostantitle, amaliat, bsc
    )
    -- section1
    , section1_summary AS (
        SELECT
            ostantitle,
            amalkard,
            barnameh - amalkard AS dirkard,
            total_barnameh - amalkard - (barnameh - amalkard) AS barnameh_diff,
            amaliat
        FROM bsc_summary
    )
    -- Calculate totals for section1
    , section1_totals AS (
        SELECT
            'جمع کشوری' AS ostantitle,
            SUM(amalkard) AS amalkard,
            SUM(dirkard) AS dirkard,
            SUM(barnameh_diff) AS barnameh_diff,
            MAX(amaliat) AS amaliat
        FROM section1_summary
    )
    -- Combine results
    (SELECT * FROM section1_totals)
    UNION ALL
    (SELECT * FROM section1_summary ORDER BY ostantitle);`;
  return await query(sql);
};
// Update roosta data
const updateRoostaData = async (modifiedRecords) => {
  const client = await pool.connect(); // Now pool is defined
  try {
    await client.query('BEGIN'); // Start a transaction

    for (const record of modifiedRecords) {
      const { population_point_id, shenaseh_melli, amaliate_meydani, dadeh_amaei, geocode } = record;

      // Update the main table
      const updateQuery = `
        UPDATE public.locations1
        SET 
          shenaseh_melli = $1,
          amaliate_meydani = $2,
          dadeh_amaei = $3,
          daryafte_naghsheh = $4
        WHERE population_point_id = $5;
      `;
      await client.query(updateQuery, [shenaseh_melli, amaliate_meydani, dadeh_amaei, geocode, population_point_id]);

      // Insert the changes into the changes table
      const insertQuery = `
        INSERT INTO roosta_changes (
          population_point_id, 
          shenaseh_melli, 
          amaliate_meydani, 
          dadeh_amaei, 
          daryafte_naghsheh, 
          changed_at
        )
        VALUES ($1, $2, $3, $4, $5, NOW());
      `;
      await client.query(insertQuery, [population_point_id, shenaseh_melli, amaliate_meydani, dadeh_amaei, geocode]);
    }

    await client.query('COMMIT'); // Commit the transaction
    return { message: 'Roosta data updated and changes logged successfully!' };
  } catch (error) {
    await client.query('ROLLBACK'); // Rollback the transaction in case of error
    throw error;
  } finally {
    client.release();
  }
};
const getOstanNames = async () => {
  const sql = `SELECT ostantitle FROM public.locations1 GROUP BY ostantitle ORDER BY ostantitle;`;
  return await query(sql);
};
module.exports = { getMapStatusData, getLocationsData, getUpdateStatusData, getGeocodeStatusData, getPlateStatusData, getNationalIDStatusData, getDetailedLocationsData, getShahrestanData, getZoneData, getDehestanData, getRoostaData, getOstanNames, getQueryData, getPieMap, getBSCTab1Data, getBSCTab2Data, getBSCTab3Data, getBSCTab4Data, getBSCTab5Data, updateRoostaData};