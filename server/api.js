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
  const sql = `SELECT ostantitle, shahrestantitle, zonetitle, dehestantitle, locationname, population_point_id, shenaseh_melli, adam_paziresh AS bonyad_maskan, arseh_ayan AS tarsim, niazmande_eslah AS sayer_manabe, amaliate_meydani
dadeh_amaei, eslah_naghsheh, daryafte_naghsheh, tolid_qr, pelak_talfighi AS nasbe_pelak, tayid_va_bargozari, tedad_sakhteman, tedad_geosakhteman, tedad_makan, tedad_geocode_makan, tedad_makan_jadid, pdf, ersal_setad
FROM public.locations1 ORDER BY ostantitle, shahrestantitle, zonetitle, dehestantitle, locationname;`;
  return await query(sql);
};

module.exports = { getMapStatusData, getLocationsData, getUpdateStatusData, getGeocodeStatusData, getPlateStatusData, getNationalIDStatusData };