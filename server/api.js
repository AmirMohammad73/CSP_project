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

const getLocationsData = async () => {
  const sql = `SELECT ostantitle, shahrestantitle, zonetitle, dehestantitle, locationname, population_point_id, shenaseh_melli, adam_paziresh AS bonyad_maskan, arseh_ayan AS tarsim, niazmande_eslah AS sayer_manabe, amaliate_meydani
dadeh_amaei, eslah_naghsheh, daryafte_naghsheh, tolid_qr, pelak_talfighi AS nasbe_pelak, tayid_va_bargozari, tedad_sakhteman, tedad_geosakhteman, tedad_makan, tedad_geocode_makan, tedad_makan_jadid, pdf, ersal_setad
FROM public.locations1 ORDER BY ostantitle, shahrestantitle, zonetitle, dehestantitle, locationname;`;
  return await query(sql);
};

module.exports = { getMapStatusData, getLocationsData };