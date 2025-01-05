const { query } = require('./db');

const getData = async () => {
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

module.exports = { getData };