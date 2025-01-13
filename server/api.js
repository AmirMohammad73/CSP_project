const { query } = require('./db');

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
    (daryafte_naghsheh = true OR adam_paziresh = true OR arseh_ayan = true OR niazmande_eslah = true OR tayid_va_bargozari = true OR adam_tayid = true OR amaliate_meydani = true OR dadeh_amaei = true OR eslah_naghsheh = true OR ersal_setad = true OR pdf = true);`;
  return await query(sql);
};

const getDetailedLocationsData = async () => {
  const sql = `SELECT
    ROW_NUMBER() OVER (ORDER BY ostantitle) AS row_number,
    ostantitle AS locname,
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
  WHERE 
    (daryafte_naghsheh = true OR adam_paziresh = true OR arseh_ayan = true OR niazmande_eslah = true OR tayid_va_bargozari = true OR adam_tayid = true OR amaliate_meydani = true OR dadeh_amaei = true OR eslah_naghsheh = true OR ersal_setad = true OR pdf = true)
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
    (daryafte_naghsheh = true OR adam_paziresh = true OR arseh_ayan = true OR niazmande_eslah = true OR tayid_va_bargozari = true OR adam_tayid = true OR amaliate_meydani = true OR dadeh_amaei = true OR eslah_naghsheh = true OR ersal_setad = true OR pdf = true)
    AND ostantitle = $1
GROUP BY
    shahrestantitle
ORDER BY
    shahrestantitle;
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
        (daryafte_naghsheh = true OR adam_paziresh = true OR arseh_ayan = true OR niazmande_eslah = true OR tayid_va_bargozari = true OR adam_tayid = true OR amaliate_meydani = true OR dadeh_amaei = true OR eslah_naghsheh = true OR ersal_setad = true OR pdf = true)
        AND ostantitle = $1 AND shahrestantitle = $2
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
        (daryafte_naghsheh = true OR adam_paziresh = true OR arseh_ayan = true OR niazmande_eslah = true OR tayid_va_bargozari = true OR adam_tayid = true OR amaliate_meydani = true OR dadeh_amaei = true OR eslah_naghsheh = true OR ersal_setad = true OR pdf = true)
        AND ostantitle = $1 AND shahrestantitle = $2 AND zonetitle = $3
      GROUP BY 
        dehestantitle
      ORDER BY 
        dehestantitle;`;
  return await query(sql, [ostantitle, shahrestantitle, zonetitle]);
};
module.exports = { getMapStatusData, getLocationsData, getUpdateStatusData, getGeocodeStatusData, getPlateStatusData, getNationalIDStatusData, getDetailedLocationsData, getShahrestanData, getZoneData, getDehestanData };